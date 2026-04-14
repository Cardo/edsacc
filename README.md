# Storybook + AEM EDS

<img width="981" height="360" alt="image" src="https://github.com/user-attachments/assets/c4129267-e8a1-4907-b96d-fb3c957ee499" />

A local development environment for building and previewing [AEM Edge Delivery Services](https://www.aem.live/) blocks in isolation using [Storybook](https://storybook.js.org/).

No React. No TypeScript. No build step. Just plain HTML, CSS, and vanilla JavaScript — the same stack EDS uses in production.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| [Node.js](https://nodejs.org/) | 18 |
| npm | 9 |

> Tested on Node.js 22 / npm 10. Any Node.js LTS release ≥ 18 should work.

---

## Installation

**1. Clone the repository**

```bash
git clone <repo-url>
cd storybook-eds
```

**2. Install dependencies**

```bash
npm install
```

That's it. There is no build step, no compilation, and no framework to configure.

---

## Running Storybook

```bash
npm run storybook
```

Opens at **http://localhost:6006**. Storybook watches for file changes and hot-reloads automatically.

---

## Building a Static Storybook

```bash
npm run build-storybook
```

Outputs a fully static site to `storybook-static/`. This can be deployed to any static host (GitHub Pages, Netlify, etc.) for sharing with stakeholders.

---

## Project Structure

```
.
├── blocks/                    # EDS blocks — one folder per block
│   └── accordion/
│       ├── accordion.js       # EDS decoration function (production code)
│       ├── accordion.css      # Block styles (production code)
│       ├── accordion.stories.js  # Storybook stories (dev only)
│       └── ACCORDION.md       # Block-level documentation
├── .storybook/
│   ├── main.js                # Storybook config (framework, addons, story glob)
│   └── preview.js             # Global Storybook parameters
├── vite.config.js             # Minimal Vite config
└── package.json
```

New blocks follow the same pattern: create a `blocks/<name>/` folder with `<name>.js`, `<name>.css`, and optionally `<name>.stories.js`.

---

## Adding a New Block

1. Create the folder:
   ```bash
   mkdir blocks/my-block
   ```

2. Add the three files:
   - `blocks/my-block/my-block.js` — export a `default function decorate(block)`.
   - `blocks/my-block/my-block.css` — plain CSS scoped to `.my-block.block`.
   - `blocks/my-block/my-block.stories.js` — import and call `decorate()` in the `render` function.

3. Storybook picks it up automatically — no registration needed.

---

## Deploying Blocks to AEM EDS

Copy only the production files (`.js` and `.css`) into your EDS GitHub repository:

```
your-eds-repo/
└── blocks/
    └── accordion/
        ├── accordion.js
        └── accordion.css
```

EDS loads blocks by convention: it matches the CSS class on the page to a folder name under `blocks/`, then dynamically imports the JS and CSS. No bundler, no config.

See [`blocks/accordion/ACCORDION.md`](blocks/accordion/ACCORDION.md) for a full walkthrough of the authoring-to-production workflow.

---

## Dependencies

| Package | Purpose |
|---|---|
| `storybook` | Core Storybook CLI |
| `@storybook/html-vite` | HTML + vanilla JS framework adapter |
| `@storybook/addon-docs` | Auto-generated docs tab from story metadata |
| `@storybook/addon-a11y` | Accessibility audit panel |
| `vite` | Dev server and bundler used by Storybook |
