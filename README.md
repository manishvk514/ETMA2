# Everything Media — website

Static site. No framework. Drop-in deploy.

## Files

```
everything-media/
├── index.html      the site
├── style.css       the design system
├── script.js       the motion + form
├── vercel.json     hosting headers (Vercel)
└── README.md       this
```

## Deploy — the easy way (Netlify, 2 minutes)

1. Go to **app.netlify.com/drop**
2. Drag the `everything-media` folder onto the page
3. It deploys instantly. You get a live URL like `wonderful-cake-abc123.netlify.app`
4. Sign up with your email to keep it permanent and connect a domain

Done. To connect `everythingmedia.studio`: Netlify dashboard → your site → Domain settings → Add custom domain. Netlify shows you 2 DNS records. Add them at your registrar (GoDaddy/Hostinger/whoever). HTTPS auto-provisions. Done within a day.

## Deploy — the long-game way (GitHub + Vercel, 10 minutes)

Better for ongoing edits. Recommended once the site is really yours.

1. Sign up at **github.com**
2. Click "New repository" — name it `everything-media`, public, add README, create
3. On the repo page, "Add file" → "Upload files" → drag all 5 files in → commit
4. Go to **vercel.com**, sign up with "Continue with GitHub"
5. Dashboard → "Add New" → "Project" → find `everything-media` → Import → Deploy
6. 30 seconds later: live URL

**Future edits:** edit a file directly on GitHub's web interface (click the pencil icon) → commit. Vercel auto-redeploys in 30 seconds. No code editor ever needed.

## Replace the placeholder images

All hero stills and work tiles currently use Unsplash URLs. To swap:

**Hero stills** (6 of them) — in `index.html`, find each `<div class="hero-still"` and replace its `background-image: url('...')` with your image URL. Also update the `data-meta` attribute with real camera info (e.g., `"01 · 35mm · f/1.8"`) if you want.

**Work tiles** — find each `<img src="..."` inside `#work` and replace. Recommended:
- Full-width tile: 2400×1030 px (21:9)
- Half/third tiles: 1600×900 px (16:9)

Host images however: local folder (`images/jiostar-01.jpg`), Cloudinary, imgix, or any CDN.

## Upgrade the form from mailto to a real backend

Current: the form opens the visitor's email client. Works immediately.

When you want real form submissions in an inbox/dashboard:

**Formspree (5 min):**
1. Sign up at formspree.io, create a form, copy its endpoint (`https://formspree.io/f/abc1234`)
2. In `index.html`, change `<form id="contact-form" class="contact-form" novalidate>` to `<form id="contact-form" class="contact-form" novalidate action="https://formspree.io/f/abc1234" method="POST">`
3. In `script.js`, inside `submitForm`, replace the mailto block with:
   ```js
   const res = await fetch(form.action, {
       method: 'POST',
       headers: { 'Accept': 'application/json' },
       body: new FormData(form)
   });
   return { ok: res.ok };
   ```

## Typography

- **Display:** Fraunces (Google Fonts — free)
- **UI:** JetBrains Mono (Google Fonts — free)

Both loaded automatically via the `<link>` in `index.html`. No setup needed.

## What the site is

A small-studio, contact-sheet-coded homepage for Everything Media. Designed around one thesis — *"we still believe the frame matters."* Navigation section-slates (`scn. 02 — position`), a real-time scroll timecode in the nav, and grease-pencil-red as the single accent color mirror the language of a director reviewing takes. Everything else on the page — hero stills with hard cuts, tile circle-marks on hover, serif manifesto — serves that register.

## Credits

Built by Manish Verma Kumawat with Claude (Anthropic). Everything Media, 2026.
