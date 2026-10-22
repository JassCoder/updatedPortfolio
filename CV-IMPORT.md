# LinkedIn CV import

Start a local HTTP server from the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/import.html, or follow **Import LinkedIn PDF / CV** from About or Certifications. ES modules and the PDF worker require HTTP hosting; opening the HTML file directly is unsupported.

The importer reads text-based PDFs locally with bundled Mozilla PDF.js 6.4.299. It recognizes English section headings and uses a heuristic for LinkedIn two-column exports. Review and edit all fields; scanned images need OCR elsewhere, and protected PDFs need an unlocked export. Limits: 15 MB and 50 pages.

Saving explicitly stores a reviewed CV under `jas.reviewed-cv.v1` in this browser's local storage. About shows that browser's saved preview. The public portfolio source is unchanged. JSON download exports a portable copy; clear removes the saved copy and current review. No PDF upload or LinkedIn account connection occurs. Storage is shared by pages on the same origin, not other browsers or devices.

Run parser regression tests with `node --test tests/cv-parser.test.mjs`.
