import { expect, it } from 'vitest';
import { getCatalogSearchScore } from '@/lib/catalog-search';
it('finds current and old supplier references without supplier private data', () => {
  const product = { name: 'Olives', sku: 'OL1', category: 'Food', marques: [], supplierReferences: ['00123', 'OLD-A7'] };
  expect(getCatalogSearchScore(product, '00123')).toBeGreaterThan(9000);
  expect(getCatalogSearchScore(product, 'old-a7')).not.toBeNull();
  expect(getCatalogSearchScore({ ...product, supplierReferences: [] }, '00123')).toBeNull();
});
