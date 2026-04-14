# Accordion Block

An AEM Edge Delivery Services (EDS) block that transforms a Word document table into an interactive, accessible accordion component. No frameworks, no dependencies — plain HTML, CSS, and JavaScript.

---

## How It Works

### Word Table → HTML → Decorated Component

**Step 1 — Author in Word**

Create a table in the Word document. The first row is the block name; subsequent rows are content:

```
┌──────────────────────────────────────────────────┐
│                    Accordion                     │  ← block name (first row)
├──────────────┬──────────────┬────────────────────┤
│    Brand     │ Descriptions │      #e53e3e       │  ← title | body | color
├──────────────┼──────────────┼────────────────────┤
│    Brand     │ Descriptions │      #38a169       │  ← title | body | color
└──────────────┴──────────────┴────────────────────┘
```

The third column is optional. If omitted, the item falls back to the default color defined by `--accordion-color` in the CSS (`#555`).

**Step 2 — EDS generates HTML**

EDS strips the block name row and wraps each content row in nested `<div>` elements:

```html
<div class="accordion block">
  <div>
    <div>Brand</div>
    <div>Descriptions</div>
    <div>#e53e3e</div>
  </div>
  <div>
    <div>Brand</div>
    <div>Descriptions</div>
    <div>#38a169</div>
  </div>
</div>
```

Each outer `<div>` is a row; the three inner `<div>` elements map to the three columns (title, body, color).

**Step 3 — `decorate(block)` transforms the DOM**

EDS automatically loads `accordion.js` and calls `decorate(block)`. The function iterates over every row and replaces the raw divs with semantic, accessible markup:

```html
<div class="accordion block">
  <div class="accordion-item" style="--accordion-color: #e53e3e">
    <button
      class="accordion-trigger"
      id="accordion-trigger-0"
      aria-expanded="false"
      aria-controls="accordion-panel-0"
      type="button"
    >
      <span class="accordion-title">Brand</span>
      <span class="accordion-icon" aria-hidden="true"></span>
    </button>
    <div
      class="accordion-panel"
      id="accordion-panel-0"
      role="region"
      aria-labelledby="accordion-trigger-0"
      hidden
    >
      <div class="accordion-panel-inner">Descriptions</div>
    </div>
  </div>
  <!-- …more items -->
</div>
```

---

## File Structure

```
blocks/
└── accordion/
    ├── accordion.js      # EDS decoration function (the component logic)
    ├── accordion.css     # Plain CSS styles
    └── accordion.stories.js  # Storybook stories for local development
```

### `accordion.js`

Exports a single default function — the EDS contract:

```js
export default function decorate(block) { ... }
```

| What it does               | How                                                                        |
| -------------------------- | -------------------------------------------------------------------------- |
| Reads each Word table row  | Iterates `block.children`                                                  |
| Builds accessible triggers | `<button>` with `aria-expanded` + `aria-controls`                          |
| Builds collapsible panels  | `<div role="region">` with `hidden` attribute                              |
| Applies per-item color     | Reads third column's `textContent` → sets `--accordion-color` CSS variable |
| Handles open/close         | `click` listener toggles `aria-expanded` and `hidden`                      |

### `accordion.css`

Plain CSS with no preprocessor. Key design decisions:

- **`--accordion-color`** CSS custom property drives both the border and the trigger background, so each item can be independently themed from a single value.
- **`hidden` attribute** is used instead of `display: none` toggled by a class — this is more accessible and aligns with the HTML spec.
- **`@keyframes accordion-open`** provides a subtle fade+slide animation when a panel opens, using `:not([hidden])` as the trigger so no JS class management is needed.
- **`focus-visible`** outline ensures keyboard users always have a clear focus indicator without affecting mouse users.

### `accordion.stories.js`

Uses **`@storybook/html-vite`** (not React). Each story:

1. Builds the exact raw HTML that EDS would generate from a Word table.
2. Calls `decorate(block)` — the real production function.
3. Returns the live DOM element for Storybook to render.

This means **what you see in Storybook is what you get in production** — there is no simulation layer.

---

## Exporting to AEM EDS

### 1. Copy the block files

Copy the two runtime files into the EDS project repository under `blocks/accordion/`:

```
sample-eds-project/
└── blocks/
    └── accordion/
        ├── accordion.js   ← copy this
        └── accordion.css  ← copy this
```

> Do **not** copy `accordion.stories.js` — that file is only for local development.

### 2. Author the content in Word

In the SharePoint or Google Drive document, insert a table:

| Accordion      |                        |         |
| -------------- | ---------------------- | ------- |
| The title here | The body content here  | #e53e3e |
| Another title  | Another body paragraph | #38a169 |

- Row 1 (`Accordion`) — the block name. EDS uses this to match the block.
- Rows 2+ — each row becomes one accordion item. Left cell = title, middle cell = body, right cell = color.
- The color column accepts any valid CSS color value: hex (`#e53e3e`), named (`red`), `rgb()`, etc.
- The color column is **optional** — omitting it falls back to the default `#555` defined in `accordion.css`.

---

## Local Development with Storybook

Run Storybook to develop and test the block in isolation, without needing an EDS environment:

```bash
npm run storybook
# → http://localhost:6006
```

Navigate to **Blocks > Accordion** in the sidebar. Three stories are available:

| Story        | Purpose                                                   |
| ------------ | --------------------------------------------------------- |
| `Default`    | Two items — red and green (matches the Word table design) |
| `SingleItem` | Edge case with a single accordion item                    |
| `ManyItems`  | Four items with varied colors                             |

To add a new story, add an export to `accordion.stories.js` and call `createAccordion()` with the desired items. The `decorate()` function runs live, so the story output is always in sync with the production code.
