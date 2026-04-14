import decorate from "./accordion.js";
import "./accordion.css";

/**
 * Storybook story for the Accordion EDS block.
 *
 * The HTML rendered here mirrors exactly what AEM EDS produces when the
 * author fills in a Word document table like:
 *
 *   ┌─────────────────────────────────┐
 *   │           Accordion             │  ← block name row
 *   ├──────────────┬──────────────┬───┤
 *   │    Brand     │ Descriptions │ #e53e3e │  ← col 3 = color
 *   ├──────────────┼──────────────┼───┤
 *   │    Brand     │ Descriptions │ #38a169 │
 *   └──────────────┴──────────────┴───┘
 *
 * EDS turns each data row into:
 *   <div class="accordion block">
 *     <div>
 *       <div>Brand</div>
 *       <div>Descriptions</div>
 *       <div>#e53e3e</div>
 *     </div>
 *   </div>
 *
 * The decorator reads colorCell.textContent from the third column.
 */

export default {
  title: "Blocks/Accordion",
  parameters: {
    docs: {
      description: {
        component:
          "AEM EDS Accordion block. The raw HTML simulates what EDS generates " +
          "from a Word table. The `decorate()` function transforms it into an " +
          "accessible, interactive accordion.",
      },
    },
  },
};

// Helper function

/**
 * Build the raw EDS HTML, call decorate(), and return the live element.
 *
 * @param {Array<{brand: string, description: string, color?: string}>} items
 * @returns {HTMLElement}
 */
function createAccordion(items) {
  const block = document.createElement("div");
  block.className = "accordion block";

  items.forEach(({ brand, description, color }) => {
    const row = document.createElement("div");

    const titleCell = document.createElement("div");
    titleCell.textContent = brand;

    const bodyCell = document.createElement("div");
    bodyCell.textContent = description;

    row.append(titleCell, bodyCell);

    if (color) {
      const colorCell = document.createElement("div");
      colorCell.textContent = color;
      row.append(colorCell);
    }

    block.append(row);
  });

  decorate(block);
  return block;
}

// Stories, use cases

/**
 * Default: two items, red and green, matching the original design.
 */
export const Default = {
  render: () =>
    createAccordion([
      { brand: "Brand", description: "Descriptions", color: "#e53e3e" },
      { brand: "Brand", description: "Descriptions", color: "#38a169" },
    ]),
};

/**
 * Single item — edge-case sanity check.
 */
export const SingleItem = {
  render: () =>
    createAccordion([
      { brand: "Brand", description: "Descriptions", color: "#3182ce" },
    ]),
};

/**
 * Many items — stress test with varied colors.
 */
export const ManyItems = {
  render: () =>
    createAccordion([
      { brand: "Brand", description: "Descriptions", color: "#e53e3e" },
      { brand: "Brand", description: "Descriptions", color: "#38a169" },
      { brand: "Brand", description: "Descriptions", color: "#3182ce" },
      { brand: "Brand", description: "Descriptions", color: "#d69e2e" },
    ]),
};
