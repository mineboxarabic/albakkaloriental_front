import http from 'node:http';
import { jwtVerify, SignJWT } from 'jose';
import type { AdminProduct } from '../lib/catalog-admin-types';

export const TEST_SECRET = 'isolated-e2e-auth-secret-at-least-32-characters';
export const FIXTURE_IMAGE = 'https://alimexpress-buckeyt.s3.eu-north-1.amazonaws.com/catalog-admin-fixture.png';
export async function catalogToken(admin = true, portal: 'retail' | 'pro' = 'retail') {
  return new SignJWT(portal === 'retail' ? { sub: admin ? 'retail-admin' : 'retail-customer', userId: admin ? 'admin' : 'customer', name: 'Tester', phone: '0612345678', role: 'ADMIN' } : { sub: admin ? 'admin' : 'customer', email: 'tester@isolated.test', name: 'Tester', customerId: null })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode(TEST_SECRET));
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ1sAAAAASUVORK5CYII=', 'base64');
export class CatalogAdminBackend {
  private server?: http.Server;
  products: AdminProduct[] = [];
  writes = 0;
  previews = 0;
  revoked = false;
  failPreview = false;
  reset() {
    this.writes = 0; this.previews = 0; this.revoked = false; this.failPreview = false;
    this.products = [
      { id: 'p1', name: 'Rice 1kg', sku: 'R1', barcode: '12345678', imageUrl: null, visibility: 'BOTH', retailStatus: 'OUT_OF_STOCK', wholesaleStatus: 'VISIBLE', updatedAt: '2026-10-29T10:00:00.000Z' },
      { id: 'p2', name: 'Hidden tea', sku: 'T1', barcode: null, imageUrl: null, visibility: 'WHOLESALE', retailStatus: 'HIDDEN', wholesaleStatus: 'HIDDEN', updatedAt: '2026-10-29T10:00:00.000Z' },
    ];
  }
  async start() {
    this.reset();
    this.server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost:3091');
      const send = (status: number, data: unknown) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(status === 200 ? { success: true, data } : { success: false, error: data })); };
      if (url.pathname === '/fixture-image.png') { res.writeHead(200, { 'content-type': 'image/png' }); res.end(png); return; }
      let sub = '';
      try { sub = (await jwtVerify(req.headers.authorization?.slice(7) ?? '', new TextEncoder().encode(TEST_SECRET))).payload.sub ?? ''; } catch { /* guest */ }
      const isAdmin = ['retail-admin', 'admin'].includes(sub) && !this.revoked;
      if (url.pathname.startsWith('/api/v1/catalog-admin')) {
        if (!sub) return send(401, 'Connexion requise.');
        if (!isAdmin) return send(403, 'Accès administrateur requis.');
        const path = url.pathname.replace('/api/v1/catalog-admin', '');
        if (path === '/me') return send(200, { isAdmin: true });
        if (path === '/products') {
          const products = this.products.filter((p) => `${p.name} ${p.sku} ${p.barcode}`.toLowerCase().includes((url.searchParams.get('q') ?? '').toLowerCase()));
          return send(200, { products, total: products.length, page: 1, totalPages: 1 });
        }
        const product = this.products.find((p) => p.id === path.split('/')[2]);
        if (!product) return send(404, 'Produit introuvable.');
        if (req.method === 'GET') return send(200, product);
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const body = JSON.parse(Buffer.concat(chunks).toString());
        if (path.endsWith('/image-preview')) {
          this.previews++;
          if (this.failPreview) return send(502, 'Image indisponible.');
          return send(200, { candidates: [{ imageUrl: FIXTURE_IMAGE, previewToken: 'fixture-preview', title: 'Rice 1kg', sourceUrl: 'https://example.com/rice' }] });
        }
        if (path.endsWith('/image')) { if (body.previewToken !== 'fixture-preview') return send(400, 'Aperçu invalide.'); product.imageUrl = FIXTURE_IMAGE; }
        else {
          if (body.expectedUpdatedAt !== product.updatedAt) return send(409, 'Ce produit a changé.');
          for (const key of ['visibility', 'retailStatus', 'wholesaleStatus'] as const) if (body[key]) Object.assign(product, { [key]: body[key] });
        }
        this.writes++; product.updatedAt = new Date().toISOString(); return send(200, product);
      }
      if (url.pathname === '/api/v1/retail/catalog' || url.pathname === '/api/v1/b2b/catalog') {
        const pro = url.pathname.includes('/b2b/');
        return send(200, { products: this.products.filter((p) => (p.visibility === 'BOTH' || p.visibility === (pro ? 'WHOLESALE' : 'RETAIL')) && (pro ? p.wholesaleStatus !== 'HIDDEN' : p.retailStatus !== 'HIDDEN')).map((p) => ({ ...p, category: 'epicerie', marques: [], unitsPerPack: 12, baseUnit: 'PIECE', sellingPrice: 7.99, price: 7.99, unitSellingPrice: null, priceLevelC: null, priceLevelD: null, priceLevelE: null, priceLevelF: null, isOutOfStock: false, availableStock: 100 })) });
      }
      if (url.pathname === '/api/v1/public/categories') return send(200, { categories: [{ id: 'cat1', name: 'epicerie', parentId: null }] });
      if (url.pathname === '/api/v1/public/marques') return send(200, { marques: [] });
      if (url.pathname === '/api/v1/public/deliveries/upcoming') return send(200, { deliveries: [] });
      if (url.pathname.endsWith('/me')) return send(200, { user: { id: sub, name: 'Tester', email: 'tester@isolated.test', isActive: true, emailVerified: 'yes', mustChangePassword: false }, customer: { id: sub, name: 'Tester', phone: '0612345678', city: 'Test', address: 'Test', pricingLevel: 'E', companyName: 'Test' } });
      if (url.pathname.endsWith('/cart')) return send(200, { cart: { items: [], total: 0 } });
      send(404, 'Not found');
    });
    await new Promise<void>((resolve) => this.server!.listen(3091, '127.0.0.1', resolve));
  }
  async stop() { await new Promise<void>((resolve) => this.server?.close(() => resolve())); }
}
