import http from "http";
import * as jose from "jose";

async function createSignedToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "afa4008dc6e5d02542bbceda1e9dc521fd8852a8326b5f9e47ccc484c6eed276c6e4b733a83229e9"
  );
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export class MockBackend {
  private server: http.Server | null = null;
  public retailCartItems: any[] = [];
  public proCartItems: any[] = [];
  public loggedIn = false;
  public loggedInPro = false;

  constructor(private port: number = 3001) {}

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const url = new URL(req.url || "", `http://localhost:${this.port}`);
        const path = url.pathname;
        const method = req.method;

        // CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
        res.setHeader("Access-Control-Allow-Credentials", "true");

        if (method === "OPTIONS") {
          res.writeHead(200);
          res.end();
          return;
        }

        // Helper to send JSON
        const sendJSON = (statusCode: number, body: any) => {
          res.writeHead(statusCode, { "Content-Type": "application/json" });
          res.end(JSON.stringify(body));
        };

        // Parse body helper
        let bodyBuffer = "";
        req.on("data", (chunk) => { bodyBuffer += chunk; });
        req.on("end", async () => {
          let reqBody: any = {};
          try {
            if (bodyBuffer) reqBody = JSON.parse(bodyBuffer);
          } catch (e) {}

          // Router
          if (path === "/api/v1/public/categories") {
            return sendJSON(200, { categories: [{ name: "epicerie" }] });
          }
          if (path.startsWith("/api/v1/public/deliveries/upcoming")) {
            return sendJSON(200, { deliveries: [] });
          }

          // Catalog endpoint
          if (path === "/api/v1/retail/catalog") {
            return sendJSON(200, {
              products: [
                {
                  id: "prod-1",
                  name: "Produit Retail 1",
                  sku: "PR-1",
                  category: "epicerie",
                  imageUrl: null,
                  unitsPerPack: 1,
                  baseUnit: "PIECE",
                  visibility: "BOTH",
                  sellingPrice: 5.5,
                  unitSellingPrice: null,
                  priceLevelC: 4.5,
                  price: 5.5,
                  b2cStatus: "VISIBLE",
                  b2bStatus: "VISIBLE"
                }
              ]
            });
          }

          if (path === "/api/v1/b2b/catalog") {
            if (!this.loggedInPro) {
              return sendJSON(401, { error: "Authentication required" });
            }
            return sendJSON(200, {
              products: [
                {
                  id: "prod-2",
                  name: "Produit Pro 2",
                  sku: "PP-2",
                  category: "epicerie",
                  imageUrl: null,
                  unitsPerPack: 12,
                  baseUnit: "KG",
                  visibility: "BOTH",
                  sellingPrice: 15.0,
                  unitSellingPrice: null,
                  priceLevelC: 12.0,
                  price: 12.0,
                  b2cStatus: "VISIBLE",
                  b2bStatus: "VISIBLE"
                }
              ]
            });
          }

          // Auth
          if (path === "/api/v1/retail/auth/login") {
            this.loggedIn = true;
            const token = await createSignedToken({
              sub: "cust-1",
              userId: "u-1",
              role: "B2C_CLIENT",
              name: "John Doe",
              phone: "12345678"
            });
            return sendJSON(200, {
              token,
              customer: { id: "cust-1", name: "John Doe", phone: "12345678" }
            });
          }

          if (path === "/api/v1/b2b/auth/login") {
            this.loggedInPro = true;
            const token = await createSignedToken({
              sub: "u-pro-1",
              customerId: "cust-pro-1",
              role: "B2B_CLIENT",
              email: "pro@example.com",
              name: "Pro User"
            });
            return sendJSON(200, {
              token,
              user: { id: "u-pro-1", email: "pro@example.com" }
            });
          }

          if (path === "/api/v1/retail/me") {
            if (!this.loggedIn) {
              return sendJSON(401, { error: "Authentication required" });
            }
            return sendJSON(200, {
              user: { id: "u-1", email: "john@example.com", name: "John Doe", isActive: true, emailVerified: "yes" },
              customer: { id: "cust-1", name: "John Doe", phone: "12345678", city: "Paris", postalCode: "75001", address: "1 Rue de Rivoli", isActive: true, createdAt: "2026-06-01" }
            });
          }

          if (path === "/api/v1/b2b/me") {
            if (!this.loggedInPro) {
              return sendJSON(401, { error: "Authentication required" });
            }
            return sendJSON(200, {
              user: { id: "u-pro-1", email: "pro@example.com", name: "Pro User", role: "CLIENT", isActive: true, mustChangePassword: false, emailVerified: "yes" },
              customer: {
                id: "cust-pro-1",
                companyName: "Al Bakkal Pro",
                companyType: "SARL",
                siret: "12345678900012",
                vatNumber: "FR123456789",
                contactName: "Jean Pro",
                phone: "0102030405",
                address: "10 Rue des Pros",
                city: "Paris",
                postalCode: "75002",
                country: "France",
                pricingLevel: "C",
                outstandingBalance: 0
              }
            });
          }

          // Retail Cart
          if (path.startsWith("/api/v1/retail/cart")) {
            if (!this.loggedIn) {
              return sendJSON(401, { error: "Authentication required" });
            }
          }

          if (path === "/api/v1/retail/cart") {
            if (method === "GET") {
              return sendJSON(200, {
                cart: {
                  id: "cart-retail",
                  items: this.retailCartItems,
                  total: this.retailCartItems.reduce((acc, it) => acc + (it.product.effectivePrice * it.quantity), 0)
                }
              });
            }
            if (method === "DELETE") {
              this.retailCartItems = [];
              return sendJSON(200, { cleared: true });
            }
          }

          if (path === "/api/v1/retail/cart/items") {
            if (method === "POST") {
              const { productId, quantity, saleUnit } = reqBody;
              const existingIdx = this.retailCartItems.findIndex(it => it.productId === productId);
              const productDetail = {
                name: "Produit Retail 1",
                sku: "PR-1",
                category: "epicerie",
                imageUrl: null,
                unitsPerPack: 1,
                baseUnit: "PIECE",
                sellingPrice: 5.5,
                unitSellingPrice: null,
                effectivePrice: 5.5
              };
              if (existingIdx > -1) {
                this.retailCartItems[existingIdx].quantity += quantity;
                return sendJSON(200, { item: this.retailCartItems[existingIdx] });
              } else {
                const newItem = {
                  id: `line-${Date.now()}`,
                  productId,
                  quantity,
                  saleUnit: saleUnit || "UNIT",
                  product: productDetail
                };
                this.retailCartItems.push(newItem);
                return sendJSON(200, { item: newItem });
              }
            }
          }

          if (path.startsWith("/api/v1/retail/cart/items/")) {
            const lineId = path.split("/").pop();
            const existingIdx = this.retailCartItems.findIndex(it => it.id === lineId);
            if (existingIdx > -1) {
              if (method === "PATCH") {
                this.retailCartItems[existingIdx].quantity = reqBody.quantity;
                return sendJSON(200, { itemId: lineId });
              }
              if (method === "DELETE") {
                this.retailCartItems.splice(existingIdx, 1);
                return sendJSON(200, { itemId: lineId });
              }
            }
          }

          // Pro Cart (B2B)
          if (path.startsWith("/api/v1/b2b/cart")) {
            if (!this.loggedInPro) {
              return sendJSON(401, { error: "Authentication required" });
            }
          }

          if (path === "/api/v1/b2b/cart") {
            if (method === "GET") {
              return sendJSON(200, {
                cart: {
                  id: "cart-pro",
                  items: this.proCartItems,
                  total: this.proCartItems.reduce((acc, it) => acc + (it.product.effectivePrice * it.quantity), 0)
                }
              });
            }
            if (method === "DELETE") {
              this.proCartItems = [];
              return sendJSON(200, { cleared: true });
            }
          }

          if (path === "/api/v1/b2b/cart/items") {
            if (method === "POST") {
              const { productId, quantity, saleUnit } = reqBody;
              const existingIdx = this.proCartItems.findIndex(it => it.productId === productId);
              const productDetail = {
                name: "Produit Pro 2",
                sku: "PP-2",
                category: "epicerie",
                imageUrl: null,
                unitsPerPack: 12,
                baseUnit: "KG",
                sellingPrice: 15.0,
                unitSellingPrice: null,
                effectivePrice: 12.0
              };
              if (existingIdx > -1) {
                this.proCartItems[existingIdx].quantity += quantity;
                return sendJSON(200, { item: this.proCartItems[existingIdx] });
              } else {
                const newItem = {
                  id: `line-pro-${Date.now()}`,
                  productId,
                  quantity,
                  saleUnit: saleUnit || "PACK",
                  product: productDetail
                };
                this.proCartItems.push(newItem);
                return sendJSON(200, { item: newItem });
              }
            }
          }

          if (path.startsWith("/api/v1/b2b/cart/items/")) {
            const lineId = path.split("/").pop();
            const existingIdx = this.proCartItems.findIndex(it => it.id === lineId);
            if (existingIdx > -1) {
              if (method === "PATCH") {
                this.proCartItems[existingIdx].quantity = reqBody.quantity;
                return sendJSON(200, { itemId: lineId });
              }
              if (method === "DELETE") {
                this.proCartItems.splice(existingIdx, 1);
                return sendJSON(200, { itemId: lineId });
              }
            }
          }

          // Fallback: 404
          res.writeHead(404);
          res.end("Not Found");
        });
      });

      this.server.listen(this.port, () => {
        resolve();
      });
      this.server.on("error", (err) => {
        reject(err);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
