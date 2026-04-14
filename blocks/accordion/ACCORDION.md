# Accordion Block

An AEM Edge Delivery Services (EDS) block that transforms a Word document table into an interactive, accessible accordion component. No frameworks, no dependencies — plain HTML, CSS, and JavaScript.

---

## How It Works

### The EDS Block Model

AEM EDS follows a **DOM-First** architecture. Content is authored in Microsoft Word (or Google Docs) as a table. EDS converts that table into a predictable HTML structure and then calls a `decorate(block)` function exported from the block's JavaScript file. The decorator's job is to take that raw HTML and progressively enhance it into a fully interactive component.

This means:
- **No build step** is needed to ship the component.
- **Content lives in Word**, not in code.
- **The decorator is the component** — it reads the DOM and rewrites it in place.

### Word Table → HTML → Decorated Component

**Step 1 — Author in Word**

Create a table in your Word document. The first row is the block name; subsequent rows are content:

```
┌─────────────────────────────┐
│          Accordion          │  ← block name (first row)
├──────────────┬──────────────┤
│    Brand     │ Descriptions │  ← item 1: title | body
├──────────────┼──────────────┤
│    Brand     │ Descriptions │  ← item 2: title | body
└──────────────┴──────────────┘
```

**Step 2 — EDS generates HTML**

EDS strips the block name row and wraps each content row in nested `<div>` elements:

```html
<div class="accordion block">
  <div>
    <div>Brand</div>
    <div>Descriptions</div>
  </div>
  <div>
    <div>Brand</div>
    <div>Descriptions</div>
  </div>
</div>
```

Each outer `<div>` is a row; the two inner `<div>` elements map to the two columns (title and body).

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

| What it does | How |
|---|---|
| Reads each Word table row | Iterates `block.children` |
| Builds accessible triggers | `<button>` with `aria-expanded` + `aria-controls` |
| Builds collapsible panels | `<div role="region">` with `hidden` attribute |
| Applies per-item color | Reads `data-color` → sets `--accordion-color` CSS variable |
| Handles open/close | `click` listener toggles `aria-expanded` and `hidden` |

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

## Accessibility

| Feature | Implementation |
|---|---|
| Keyboard navigation | Native `<button>` — Tab to focus, Space/Enter to toggle |
| Screen reader state | `aria-expanded="true/false"` on the trigger |
| Panel association | `aria-controls` (trigger → panel) and `aria-labelledby` (panel → trigger) |
| Landmark region | `role="region"` on each panel |
| Focus indicator | `focus-visible` outline on the trigger |
| Icon hidden from AT | `aria-hidden="true"` on the `+/−` icon span |

---

## Exporting to AEM EDS

### 1. Copy the block files

Copy the two runtime files into your EDS project repository under `blocks/accordion/`:

```
your-eds-project/
└── blocks/
    └── accordion/
        ├── accordion.js   ← copy this
        └── accordion.css  ← copy this
```

> Do **not** copy `accordion.stories.js` — that file is only for local development.

### 2. EDS auto-loads the block

EDS discovers and loads blocks by convention. As long as `accordion.js` and `accordion.css` are at `blocks/accordion/`, EDS will:

1. Detect the `accordion` class on the block `<div>`.
2. Dynamically `import('/blocks/accordion/accordion.js')`.
3. Inject `<link rel="stylesheet" href="/blocks/accordion/accordion.css">`.
4. Call `decorate(block)` on every matching element on the page.

No registration, no config file, no bundler needed.

### 3. Author the content in Word

In your SharePoint or Google Drive document, insert a table:

| Accordion | |
|---|---|
| Your title here | Your body content here |
| Another title | Another body paragraph |

- Row 1 (`Accordion`) — the block name. EDS uses this to match the block.
- Rows 2+ — each row becomes one accordion item. Left cell = title, right cell = body.

### 4. Optional: per-item color via block options

EDS supports **block options** by adding text in parentheses after the block name, e.g. `Accordion (red)`. You can extend `accordion.js` to read `block.classList` for these options and map them to `--accordion-color` values:

```js
// Example extension inside decorate()
const colorMap = { red: '#e53e3e', green: '#38a169', blue: '#3182ce' };
const colorOption = [...block.classList].find((c) => colorMap[c]);
if (colorOption) {
  block.style.setProperty('--accordion-color', colorMap[colorOption]);
}
```

Alternatively, the current implementation reads a `data-color` attribute on each row, which can be set programmatically or via EDS metadata.

### 5. Preview and publish

Use the standard EDS workflow:

```
1. Edit document in Word / Google Docs
2. Preview  → https://main--{repo}--{org}.hlx.page/{path}
3. Publish  → https://main--{repo}--{org}.hlx.live/{path}
```

The block renders identically in preview and production because EDS serves the files directly from your GitHub repository — there is no build or deployment step.

---

## Local Development with Storybook

Run Storybook to develop and test the block in isolation, without needing an EDS environment:

```bash
npm run storybook
# → http://localhost:6006
```

Navigate to **Blocks > Accordion** in the sidebar. Three stories are available:

| Story | Purpose |
|---|---|
| `Default` | Two items — red and green (matches the Word table design) |
| `SingleItem` | Edge case with a single accordion item |
| `ManyItems` | Four items with varied colors |

To add a new story, add an export to `accordion.stories.js` and call `createAccordion()` with your desired items. The `decorate()` function runs live, so the story output is always in sync with the production code.
