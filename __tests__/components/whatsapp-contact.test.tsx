import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { RegisterEntrepriseForm } from '@/app/(retail)/register/entreprise/register-entreprise-form';
import { DeliveryChecker } from '@/components/retail/delivery-checker';
import { LanguageProvider } from '@/components/language-provider';

afterEach(cleanup);
const number = '33722222222';
function completeForm() {
  for (const [name, value] of Object.entries({ firstName: 'Test', lastName: 'Client', companyName: 'Company', email: 'test@example.com', phone: '0612345678', address: '1 Rue Test' })) {
    fireEvent.change(document.querySelector(`input[name="${name}"]`)!, { target: { value } });
  }
}
describe('configured WhatsApp links', () => {
  it.each(['fr', 'ar'] as const)('uses the configured number and translated message on the %s business form', (language) => {
    render(<LanguageProvider language={language}><RegisterEntrepriseForm whatsappNumber={number} /></LanguageProvider>);
    completeForm();
    const link = document.querySelector('a[href^="https://wa.me/"]')!;
    const url = new URL(link.getAttribute('href')!);
    expect(url.pathname).toBe('/' + number);
    expect(url.searchParams.get('text')).toContain('Company');
    expect(screen.getByText('+' + number)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('+33 7 66 30 13 39');
  });
  it('does not enable a business request without a configured WhatsApp number', () => {
    render(<RegisterEntrepriseForm whatsappNumber={null} />);
    completeForm();
    expect(document.querySelector('a[href^="https://wa.me/"]')).toBeNull();
    expect(document.querySelector('a[aria-disabled="true"]')).not.toBeNull();
  });
  it('uses the same number for a city delivery request', () => {
    render(<DeliveryChecker deliveries={[]} serverDate="2026-10-30T10:00:00Z" whatsappNumber={number} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lyon & Nice' } });
    const url = new URL(screen.getByRole('link', { name: 'Demander un arrêt' }).getAttribute('href')!);
    expect(url.pathname).toBe('/' + number);
    expect(url.searchParams.get('text')).toContain('Lyon & Nice');
  });
  it('hides the delivery WhatsApp link when no number is configured', () => {
    render(<DeliveryChecker deliveries={[]} serverDate="2026-10-30T10:00:00Z" whatsappNumber={null} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lyon' } });
    expect(screen.queryByRole('link', { name: 'Demander un arrêt' })).not.toBeInTheDocument();
  });
});
