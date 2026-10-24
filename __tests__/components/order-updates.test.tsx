import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
import { OrderUpdates } from '@/components/order-updates';
import { LanguageProvider } from '@/components/language-provider';

beforeEach(() => { vi.useFakeTimers(); refresh.mockReset(); });
afterEach(() => { vi.useRealTimers(); });
describe('customer order tracking', () => {
  it('refreshes active order status without requiring a page reload', () => {
    render(<OrderUpdates status="PENDING" />);
    act(() => vi.advanceTimersByTime(30000));
    expect(refresh).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('actualisé automatiquement');
  });
  it('stops polling delivered and cancelled orders', () => {
    const { rerender } = render(<OrderUpdates status="DELIVERED" />);
    act(() => vi.advanceTimersByTime(60000));
    rerender(<OrderUpdates status="CANCELLED" />);
    act(() => vi.advanceTimersByTime(60000));
    expect(refresh).not.toHaveBeenCalled();
  });
  it('supports Arabic', () => {
    render(<LanguageProvider language="ar"><OrderUpdates status="CONFIRMED" /></LanguageProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('تلقائياً');
  });
});
