# Company email and WhatsApp

The storefront reads the public contact fields from the AlimExpress company profile through `GET /api/v1/public/contact`. The email powers contact, support, delivery, click-and-collect and legal pages, along with the footer. The WhatsApp number powers the contact page, professional account application and delivery-stop requests.

Set these defaults in the frontend environment if needed:

```dotenv
COMPANY_EMAIL="contact@example.com"
WHATSAPP_NUMBER="+33 7 66 30 13 39"
```

AlimExpress settings take priority. The backend uses its own `COMPANY_EMAIL` and `WHATSAPP_NUMBER` when a saved setting is empty. Frontend defaults are used if the backend provides no valid contact or is unavailable. `SUPPORT_EMAIL` is no longer read, and there is no hardcoded WhatsApp destination or support email fallback. A company phone number is not automatically used as WhatsApp.

The public number is normalized to international digits only. WhatsApp URLs are built from validated numbers and encoded messages. When no number is configured, contact and delivery WhatsApp links are hidden, and the professional application explains that WhatsApp is temporarily unavailable. Missing email configuration renders no empty `mailto:` link.

The server fetch uses no persistent cache, and React deduplicates reads within one render. Admin changes appear on the next page load; already open pages must be refreshed. Changes to environment variables require the usual application restart or redeployment.

Deploy the companion AlimExpress migration and API before this frontend change when possible. Environment defaults allow the frontend to run during a staggered rollout. The frontend does not access the database or any admin/service credentials for public contact settings.

Run `npm run test:contact` and `npm run test:contact:e2e`. Browser tests use the real Next.js pages with an isolated API fixture, international-number and company-email defaults, and local font responses. Install Playwright Chromium normally, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an available Chromium executable.
