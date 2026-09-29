# GenTS project page

Static project page for **GenTS: Unified Generative Modeling for Multimodal Time Series Analysis** (ACM Multimedia 2026), intended for `https://seqml.github.io/GenTS/`.

## Preview

Open `index.html` directly, or run `python3 -m http.server 8000` from the `seqml.github.io` directory and visit `http://localhost:8000/GenTS/`. No build step, package installation, external font, or CDN is required.

## Content and assets

- Text, authors, affiliations, DOI, and all 192 benchmark values come from the active (uncommented) content of `GenTS_MM26_CameraReady/sigconf.tex`.
- `GenTS.pdf` is the existing full 10-page camera-ready PDF from `资助/GenTS_MM26_CameraReady.pdf` (not the one-page document in `备案预算`).
- WebP figures are rendered from the paper's vector PDFs. Dataset case images preserve the three columns of each row of `figure/case_study.pdf`, in paper order: TimeMMD-Env, Weather, HongKong, ETTm1, Exchange, Traffic.
- Header waveforms are conceptual illustrations, explicitly labeled; quantitative results use the paper's actual values.
- The background, waveform mark, and social preview are original project assets. No TADiff country, football, or mascot artwork is used.
- The page preserves the reference site's research-page structure: navigation, abstract, method, interactive evaluation, case studies, and citation.

## Updating

- **Code link:** the disabled `Code` button in `index.html` intentionally has no URL. Replace it with `<a class="button" href="YOUR_REPOSITORY_URL" target="_blank" rel="noopener">Code ↗</a>` when the repository is ready.
- **Paper:** replace `GenTS.pdf` if a newer camera-ready PDF is compiled.
- **Citation:** keep `citation.bib` and `#bibtex` in `index.html` in sync.
- **Colors/layout:** edit `assets/css/style.css`; theme tokens are at the top.
- **Interactions/background:** edit `assets/js/main.js`.

Tables are embedded in HTML and remain accessible without JavaScript. JavaScript enables keyboard-operable task tabs, dataset switching, citation copying, mobile navigation, and subtle background animation. Animation respects reduced-motion preferences and pauses when offscreen or the tab is hidden. Wide scientific tables and figures scroll within their containers on phones.
