# Category photographs

Six original category images generated with the built-in image generation tool for Le Bakkal Oriental. WebP copies are 720 × 720 px (32–49 KB each).

Shared prompt: a refined, realistic Mediterranean grocery still life, photographed at a slightly elevated 45-degree angle on a warm ivory #F0EBDD background. Central composition with negative space, soft diffuse daylight, natural shadows, matte ceramics and linen, restrained olive green #3F561F accents. No text, logos, people or frames.

Subjects:

- `epicerie-salee.webp`: chickpeas, rice, lentils, olive oil, olives and paprika.
- `epicerie-sucree.webp`: pistachio baklava, biscuits, honey and dates.
- `boissons.webp`: orange and pomegranate juices, water, orange and mint.
- `laitiers.webp`: labneh, white brined cheese, ayran and linen.
- `charcuterie.webp`: beef sucuk, beef sausage slices, parsley and peppercorns; no pork.
- `maison-hygiene.webp`: olive oil soap, linen towel, wooden brush and cotton shopping bag.

Backend category image URLs take priority. Subcategories inherit their parent's image until a dedicated image is configured. New categories without artwork use the existing product placeholder; categories are never renamed or created by the artwork mapping.

## Subcategories and categories without artwork

Image priority for every category shown on the storefront
(`lib/catalog-navigation.ts`):

1. the image uploaded in the back office (`Category.imageUrl`);
2. the artwork above, matched by category `code`;
3. the photo of an in-stock product sold in that category (shown whole, on
   white, since it is a packshot);
4. the parent category's artwork, then the neutral placeholder.

So subcategories (riz-pates, epices, cafes…) and any category created later in
the back office get their own picture without a code change. Uploading an image
in the back office overrides the automatic choice.
