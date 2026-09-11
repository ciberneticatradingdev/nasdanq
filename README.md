# NASDANQ

Memecoin site for **$NASDANQ** — "a gnome walked into the Nasdaq and never left."

- CA: `9WRSxYeMzHBguGYG57KPzARcWepM7TeQCPLfVLxgSTNK` (Solana, StonkFun, paired with QQQx)
- Static site: `index.html` + `style.css` + `script.js` + `assets/`
- Local: `node serve.js` → http://localhost:8979
- Deploy: Vercel (static, `cleanUrls`)

## Hero artwork
- Desktop (16:9): `assets/hero-desktop.jpg` — full bleed.
- Mobile / tablet: drop `assets/hero-mobile.jpg` and `assets/hero-tablet.jpg` in and point the two
  `<source>` tags inside `<picture class="hero-pic">` in `index.html` at them.
