# Chrome Web Store asset manifest

All final images are factual product artwork. No generative image model was used: exact UI copy, browser chrome, product icon, layout, borders, and depth are rendered deterministically from the adjacent HTML/CSS sources in Google Chrome.

## Produce

| id | source | output | strategy | dimensions | format | transparency | deviations | qa_status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primary-copy | `store-screenshot-01.html` + `popup-real-1.5.3-clean.png` | `markdown-link-copier-1280x800.png` | deterministic browser render with real 1.5.3 popup reference | 1280×800 | PNG | none | none | accepted |
| original-title | `store-screenshot-02.html` | `markdown-link-copier-original-title-1280x800.png` | deterministic browser render using exact original-title source label | 1280×800 | PNG | none | demonstration page/title are illustrative, not a commercial claim | accepted |
| output-presets | `store-screenshot-03.html` | `markdown-link-copier-output-presets-1280x800.png` | deterministic browser render using real preset names and template syntax | 1280×800 | PNG | none | none | accepted |
| clean-shortcut | `store-screenshot-04.html` | `markdown-link-copier-shortcut-1280x800.png` | deterministic browser render using the real shortcut result message | 1280×800 | PNG | none | shortcut keys are an example assignment | accepted |
| small-promo | `store-small-promo.html` | `markdown-link-copier-small-promo-440x280.png` | deterministic browser render of the compact product promise | 440×280 | PNG | none | none | accepted |
| marquee | `store-marquee.html` | `markdown-link-copier-marquee-1400x560.png` | deterministic browser render combining the primary copy result and proof points | 1400×560 | PNG | none | none | accepted |

## Direct

| id | source | output | strategy | dimensions | format | transparency | deviations | qa_status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| popup-reference | real Chrome capture | `popup-real-1.5.3-clean.png` | source evidence retained for reproducibility | source size | JPEG payload | none | file keeps its historic `.png` name | accepted |
| app-icon | repository-native icon master | `../../chrome-extension/icons/icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`, `icon512.png` | production exports at each target size | 16–512px square | PNG | rounded alpha | none | accepted |

## Semantic

| id | implementation | notes | qa_status |
| --- | --- | --- | --- |
| browser-window | HTML layers for window bar, address field, page lines, popup, and toast; CSS owns radius, borders, shadow, and crop | UI text remains selectable in source and crisp at every export size | accepted |
| marketing-copy | semantic headings, paragraphs, and evidence items in each source document | uses only verified product behavior; no ratings, awards, or user-scale claims | accepted |
| visual-system | `store-assets.css` owns the shared daylight-blue field, ink hierarchy, Action Blue, Confirmed Green, spacing, and depth | matches the public website and existing primary screenshot | accepted |

## Execution order

1. Render source HTML at its declared viewport with device scale factor 1.
2. Confirm pixel dimensions and opaque output.
3. Visually inspect every image at original or high detail.
4. Embed the deterministic source and origin into image metadata.

## Blockers

None for local production. Uploading these assets and submitting a new store review is a separate external action.

## Assumptions

- English remains the global store-artwork language.
- The 44 KB claim refers to the verified 1.5.3 compressed release package.
- The 42-test claim refers to the current automated extension test suite.
