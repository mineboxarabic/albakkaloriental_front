import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const { load, placement, preview, apply, refresh } = vi.hoisted(() => ({ load: vi.fn(), placement: vi.fn(), preview: vi.fn(), apply: vi.fn(), refresh: vi.fn() }));
vi.mock('@/actions/catalog-admin', () => ({ loadAdminProduct: load, updateProductPlacement: placement, prepareProductImage: preview, applyProductImage: apply }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
import { CatalogAdminProvider } from '@/components/admin/catalog-admin-provider';
import { ProductAdminActions } from '@/components/admin/product-admin-actions';
const product = { id: 'p1', name: 'Rice 1kg', imageUrl: null, sku: 'R1', barcode: '12345678', visibility: 'BOTH', retailStatus: 'OUT_OF_STOCK', wholesaleStatus: 'VISIBLE', updatedAt: '2026-10-29T10:00:00Z' };
function renderAdmin(available = true) {
  render(<CatalogAdminProvider available={available} editBaseUrl="https://backend.test"><ProductAdminActions productId="p1" /></CatalogAdminProvider>);
}
beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  load.mockResolvedValue({ ok: true, data: product });
  placement.mockResolvedValue({ ok: true, data: { ...product, visibility: 'WHOLESALE' } });
  preview.mockResolvedValue({ ok: true, data: { candidates: [{ imageUrl: 'https://owned.test/new.png', previewToken: 'signed', title: 'Photo' }] } });
  apply.mockResolvedValue({ ok: true, data: { ...product, imageUrl: 'https://owned.test/new.png' } });
});
describe('admin thumbnail controls', () => {
  it('renders no controls for visitors and customers', () => {
    renderAdmin(false);
    expect(screen.queryByRole('button', { name: 'Mode admin' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Gérer le produit' })).not.toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();
  });
  it('reveals controls in admin mode without fetching every product', () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Mode admin' }));
    expect(screen.getByRole('button', { name: 'Remplacer l’image' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Modifier dans le backend' })).toHaveAttribute('href', 'https://backend.test/products/p1/edit');
    expect(load).not.toHaveBeenCalled();
  });
  it('opens management from the thumbnail and changes only placement', async () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Mode admin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gérer le produit' }));
    await screen.findByLabelText('Où vendre');
    fireEvent.change(screen.getByLabelText('Où vendre'), { target: { value: 'WHOLESALE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => expect(placement).toHaveBeenCalledWith('p1', { visibility: 'WHOLESALE', expectedUpdatedAt: product.updatedAt }));
  });
  it('shows a missing original, previews a URL, and only writes after Apply', async () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Mode admin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remplacer l’image' }));
    await screen.findByLabelText('Lien de l’image');
    fireEvent.change(screen.getByLabelText('Lien de l’image'), { target: { value: 'https://source.test/new.png' } });
    fireEvent.click(screen.getByRole('button', { name: 'Prévisualiser le lien' }));
    await screen.findByAltText('Nouvelle image');
    expect(screen.getByText('Aucune image')).toBeInTheDocument();
    expect(apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer l’image' }));
    await waitFor(() => expect(apply).toHaveBeenCalledWith('p1', 'signed'));
  });
  it('displays errors and never applies a failed preview', async () => {
    preview.mockResolvedValue({ ok: false, error: 'Image indisponible' });
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Mode admin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Chercher une meilleure image' }));
    await screen.findByText('Image indisponible');
    expect(apply).not.toHaveBeenCalled();
  });
  it('recovers from a transport failure instead of leaving the editor disabled', async () => {
    placement.mockRejectedValue(new Error('Network interrupted'));
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Mode admin' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gérer le produit' }));
    await screen.findByLabelText('Où vendre');
    fireEvent.change(screen.getByLabelText('Statut gros'), { target: { value: 'HIDDEN' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await screen.findByText('Opération impossible pour le moment.');
    expect(screen.getByLabelText('Statut gros')).not.toBeDisabled();
  });
});
