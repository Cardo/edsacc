/**
 * Accordion block — AEM EDS decoration function.
 *
 * Expected DOM coming from EDS (Word table → HTML):
 *
 *   <div class="accordion block">
 *     <div>
 *       <div>Brand text</div>       ← title / trigger
 *       <div>Descriptions text</div> ← body / panel
 *     </div>
 *     ...more rows
 *   </div>
 *
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // Each direct child <div> is one accordion row produced by EDS
  const rows = [...block.children];

  rows.forEach((row, index) => {
    const [titleCell, bodyCell] = row.children;

    // ── Build trigger button ──────────────────────────────────────────────
    const triggerId = `accordion-trigger-${index}`;
    const panelId = `accordion-panel-${index}`;

    const trigger = document.createElement('button');
    trigger.className = 'accordion-trigger';
    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('type', 'button');

    // Move the title cell's content into the button
    trigger.innerHTML = `
      <span class="accordion-title">${titleCell.innerHTML}</span>
      <span class="accordion-icon" aria-hidden="true"></span>
    `;

    // ── Build panel ───────────────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);
    panel.hidden = true;

    const panelInner = document.createElement('div');
    panelInner.className = 'accordion-panel-inner';
    panelInner.innerHTML = bodyCell.innerHTML;
    panel.append(panelInner);

    // ── Replace raw row with semantic markup ──────────────────────────────
    const item = document.createElement('div');
    item.className = 'accordion-item';
    // Carry over any data-color attribute set by the story (or CMS metadata)
    const color = row.dataset.color;
    if (color) item.style.setProperty('--accordion-color', color);

    item.append(trigger, panel);
    row.replaceWith(item);

    // ── Toggle logic ──────────────────────────────────────────────────────
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });
}
