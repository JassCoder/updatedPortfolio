import test from 'node:test';
import assert from 'node:assert/strict';
import { pageText, parseCV, validCV } from '../js/cv-parser.mjs';

test('reads a LinkedIn sidebar after the main column without merging skills and identity', () => {
  const item = (str, x, y, width = 120) => ({ str, transform: [1, 0, 0, 1, x, y], width });
  const text = pageText([
    item('Contact', 30, 760), item('person@example.com', 30, 735),
    item('Top Skills', 30, 700), item('Houdini', 30, 675),
    item('Jane Example', 220, 760), item('Creative Technologist', 220, 735),
    item('Warsaw, Poland', 220, 710), item('Summary', 220, 660),
    item('Connecting art and code.', 220, 635), item('Experience', 220, 590),
    item('Studio', 220, 565), item('Compositor', 220, 540)
  ]);
  const cv = parseCV(text);
  assert.equal(cv.name, 'Jane Example');
  assert.equal(cv.location, 'Warsaw, Poland');
  assert.equal(cv.sections.skills, 'Houdini');
  assert.equal(cv.sections.experience, 'Studio\nCompositor');
  assert.ok(validCV(cv));
});

test('preserves unrecognized content and recognizes alternative certification headings', () => {
  const cv = parseCV('Jane Example\nArtist\nAbout:\nA short summary.\nLicenses & Certifications\nIBM\nSoftware Engineering Essentials\nCustom notes\nA new direction.');
  assert.equal(cv.sections.summary, 'A short summary.');
  assert.equal(cv.sections.certifications, 'IBM\nSoftware Engineering Essentials\nCustom notes\nA new direction.');
  assert.equal(cv.sourceText.includes('Custom notes'), true);
  assert.equal(validCV({ version: 1, name: 'Partial' }), false);
});
