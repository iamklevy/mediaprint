# Media Print Pack — new website

A rebuild of [mediaprint-eg.com](https://mediaprint-eg.com/) as a static site: no WordPress, no
build step, no dependencies. Four HTML pages, one stylesheet, two scripts.

English is the primary language and lives in the HTML itself. Arabic (RTL) is applied on top by a
small i18n layer when the visitor toggles it.

```
mediaprint/
├── index.html          الرئيسية
├── products.html       المنتجات — full catalogue, filterable
├── services.html       خدمات الطباعة
├── contact.html        تواصل معنا — quote form + map
├── assets/
│   ├── css/style.css   design system + all components
│   └── js/
│       ├── i18n.js     Arabic strings only (English comes from the HTML)
│       └── main.js     language toggle, nav, reveals, filters, quote form
└── .claude/launch.json local preview config
```

## Running it locally

Any static server works. From this folder:

```bash
python -m http.server 5290
```

Then open <http://localhost:5290>. Opening the files directly with `file://` mostly works but
`localStorage` (the saved language choice) is unreliable there — use a server.

## Deploying

Upload the four HTML files and the `assets/` folder to any host — the existing cPanel/WordPress
host, Netlify, Vercel, Cloudflare Pages, GitHub Pages. There is nothing to build or install.

If it replaces the current WordPress site, keep these URLs redirecting so existing links and search
rankings survive:

| Old URL | New URL |
| --- | --- |
| `/المنتجات/` | `/products.html` |
| `/خدمتنا-الأخري/` | `/services.html` |
| `/contact/` | `/contact.html` |

## Before it goes live — three things need your input

**1. The product photos are still hotlinked to the old site.** Every `<img>` points at
`https://mediaprint-eg.com/wp-content/uploads/...`. That works today, but it breaks the moment the
WordPress install is removed. Download those images into `assets/img/` and find-replace the
`https://mediaprint-eg.com/wp-content/uploads/` prefix with `assets/img/`.

**2. Confirm which photo belongs to which product.** I matched them to the order they appeared on
the old homepage, which should be right, but it is worth a look. One is a genuine guess: the
*شكاير 5 كيلو* card reuses the main hero photo because the old site had no dedicated image for it.

**3. The logo.** The header uses a designed monogram mark rather than the company's real logo — the
only logo file on the old site is a screenshot PNG (`Screen-Shot-2024-11-02...png`) that would look
poor at small sizes. Drop a clean SVG or transparent PNG into `assets/img/` and swap it into the
`.brand__mark` span on all four pages when you have one.

## What the content is based on

Everything factual came off the current site and is unchanged in substance: the 11 products, the 8
printing services, all phone numbers, both email addresses, the address (323 شارع السودان،
المهندسين، الجيزة), the opening hours, and the minimums (1,000 printed bags; 300 printed sacks; 100
plain sacks).

Two deliberate changes:

- **The fake counters are gone.** The old homepage ended with "Lines of code / Cups of coffee /
  Solved tickets / Active installs" — leftover template junk that undermined the whole page. Nothing
  was invented to replace it; the trust signals on the new site are all verifiable claims (sample
  before production, real minimums, shipping coverage).
- **Four service descriptions were written from scratch** — دوبلكس، رول أب، فلاير وبروشور وكتالوج،
  شنط دعائية had no copy at all on the old site. They are deliberately generic. Please check they
  match what you actually offer.

## The bilingual layer

English text sits in the HTML — that is what search engines index and what renders if JavaScript
never runs. Each translatable element carries a `data-i18n` key, and `assets/js/i18n.js` maps that
key to Arabic:

```html
<h3 data-i18n="p.zipper.t">Zipper (Ziplock) Bags</h3>
```

```js
'p.zipper.t': 'أكياس سوسته (زيبر)',
```

On toggle, `main.js` swaps the text, flips `<html dir>` between `ltr` and `rtl`, switches the font
stack, updates the page title and meta description, and remembers the choice in `localStorage` under
`mp-lang`. Returning visitors get whichever language they last chose; first-time visitors get
English.

**To edit English**, edit the HTML. **To edit Arabic**, edit `i18n.js`. Attribute translations use
`key@attr` (e.g. `f.name@placeholder`, `wa.float@aria-label`). There are 212 keys and every one of
them resolves on all four pages — if you add an element with a `data-i18n` key that is missing from
`i18n.js`, that element simply stays English in Arabic mode.

### Switching the default back to Arabic

Two changes: in `assets/js/main.js`, change the fallback in `initLang()` from `: 'en'` to `: 'ar'`,
and in each page's `<head>` script invert the check so it opts into English rather than Arabic. That
only changes what visitors see first — for Arabic to be what *crawlers* see, the two languages would
need to swap places again (Arabic into the HTML, English into `i18n.js`).

Adding a product means copying an `<article class="pcard">` block in `products.html`, giving it a
`data-cat` of `plastic` / `paper` / `fabric` / `print` so the filter picks it up, and adding the
matching English keys.

## Prices

All figures live in one file: `assets/js/pricing.js`. Nothing else contains a price, so updating
the price list means editing that file and nothing more.

Source: `Price list 2026-3-25.pdf`, cross-checked against `قائمة الاسعار.xlsx`. The spreadsheet
quotes a single quantity (300) and equals `tier300 + printing` on every row that appears in both
documents — that reconciliation is what verifies the figures.

Three pricing models are supported, because the price list uses three:

| Model | Used by | Behaviour |
| --- | --- | --- |
| `tiers` | boxes, garment bags, totes, kraft bags | Unit price drops at quantity breaks |
| `finish` | hang tags | One MOQ per size; price varies by finishing option |
| `perKg` | courier bags | Sold by weight; unit = `perKg ÷ pcsPerKg` |

`assets/js/pricer.js` renders the calculator into any `<div class="pricer" data-product="ID"></div>`
where `ID` matches a key in `PRICING.products`. It re-renders on language switch and hands the
finished spec to WhatsApp.

**To change a price**, edit the numbers in `pricing.js` and bump the `?v=` on the script tags. To
add a product, add a `PRICING.products` entry and drop the matching `<div class="pricer">` into that
product's card.

Variants marked `check: true` are values I could not read unambiguously from the PDF — see the
handover notes before treating them as final.

## The quote form has no backend

`contact.html`'s form does not email anyone. On submit it assembles the answers into a WhatsApp
message and opens `wa.me/201005750973` with it pre-filled — the visitor taps send. It builds the
message in whichever language the site is currently showing.

That is deliberate: a static site cannot send mail, and WhatsApp is where the enquiries already go.
If you later want the form to email instead, a service like Formspree or Web3Forms needs one
attribute on the `<form>` tag and no other change.

## Notes for whoever maintains this

- Asset links carry a `?v=7` query. **Bump that number whenever you edit `style.css` or the JS**,
  otherwise returning visitors keep the cached copy.
- Layout uses CSS logical properties (`margin-inline-start`, `inset-inline-end`) throughout, so one
  stylesheet serves both RTL and LTR. Avoid `left`/`right` when editing.
- The frosted header background is on `.header::before`, not `.header`. This is load-bearing:
  `backdrop-filter` on the header itself makes it the containing block for `position: fixed`
  children, which traps the mobile menu and its overlay inside the header bar.
- Reveal-on-scroll animations are gated behind a `.js` class set in each page's `<head>`. Without
  it the content would be invisible if a script ever failed to load.
- `prefers-reduced-motion` is respected — all animation is disabled for visitors who ask for that.
```
