# Wedding Invitation — Aysha & Farhan • Falakh & Shazar
Static site (no build step). Deploy the folder to Vercel/Netlify as-is.
- `index.html`, `style.css`, `main.js`
- `assets/hero-arch.png` (hero background), `assets/invitation-opening.mp4` (+ `video-poster.jpg`), `assets/music.mp3`
- `og.jpg` — 1200×630 placeholder. Replace with your final image and switch the `og:image` / `twitter:image` URLs to absolute (https://your-domain/og.jpg) once the domain is live; WhatsApp requires absolute URLs.

## Theme: Luxury Burgundy · Crimson · Antique Gold
- Palette lives in `:root` of `style.css` (`--black/--wine/--burg/--crim/--rich/--gold/--champ/--ivory`); the theme block is at the end of that file.
- `assets/bg-hall.webp` (primary: hero, invitation, countdown, closing), `assets/bg-candle.webp` (intimate: couples, details, dua, family), `assets/bg-entrance.webp` (highlight: scratch, venue). Each section sets its own `--img / --pos / --ov` at the end of `style.css`.
- `assets/hero-arch.*` rebuilt on the crimson hall; `invitation-opening.mp4` and `video-poster.jpg` colour-graded to burgundy (card position unchanged, so the name overlay still aligns).
- Script names use Google Font *Great Vibes* (loaded in `index.html`, falls back to Cormorant Garamond).
