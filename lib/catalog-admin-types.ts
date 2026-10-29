export type Visibility = 'RETAIL' | 'WHOLESALE' | 'BOTH';
export type RetailStatus = 'VISIBLE' | 'OUT_OF_STOCK' | 'HIDDEN';
export type WholesaleStatus = 'VISIBLE' | 'HIDDEN';
export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  imageUrl: string | null;
  visibility: Visibility;
  retailStatus: RetailStatus;
  wholesaleStatus: WholesaleStatus;
  updatedAt: string;
}
export interface ImageCandidate { imageUrl: string; previewToken: string; title: string; sourceUrl?: string }
export type PreviewRequest = { kind: 'upload'; data: string } | { kind: 'url'; url: string } | { kind: 'enhance' | 'search' };
export type AdminResult<T> = { ok: true; data: T } | { ok: false; error: string };
export type AdminOperation = 'manage' | 'replace' | 'enhance' | 'search';
export type PlacementPatch = Partial<Pick<AdminProduct, 'visibility' | 'retailStatus' | 'wholesaleStatus'>> & { expectedUpdatedAt: string };
