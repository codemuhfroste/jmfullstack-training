/**
 * CSS course — structure and grading. Lesson text lives in ./css/*.md.
 *
 * Checks run inside the preview iframe (see runners/web.js and the note at
 * the top of html.js): self-contained functions of (doc, win, h, src).
 * Styles are read back as *computed* values, so any correct way of writing a
 * declaration passes (`bold` or `700`, a colour name or its hex code, …).
 */

export default {
  id: 'css',
  title: 'CSS',
  layer: 'Style',
  mark: '{ }',
  color: '#4da3ff',
  kind: 'web',
  tagline: 'Make it look like something.',
  description: 'Colour, type, spacing and layout. Turn bare HTML into a page people want to look at, on any screen size.',
  chapters: [
    {
      id: 'basics',
      title: 'Rules and selectors',
      summary: 'How a stylesheet targets elements and changes them.',
      lessons: [
        {
          id: 'first-rule',
          checks: [
            { label: 'The h1 text is #6f4e37', test: (doc, win, h) => h.sameColor(h.q('h1'), 'color', '#6f4e37') || 'Add an h1 rule with color: #6f4e37;' },
            { label: 'The body background is #fff8f0', test: (doc, win, h) => h.sameColor(doc.body, 'background-color', '#fff8f0') || 'Add a body rule with background-color: #fff8f0;' },
          ],
        },
        {
          id: 'typography',
          checks: [
            {
              label: 'body uses Verdana with a sans-serif fallback',
              test: (doc, win, h) => /verdana.*sans-serif/i.test(h.css(doc.body, 'font-family')) || 'In the body rule: font-family: Verdana, sans-serif;',
            },
            { label: 'The h1 is 40px', test: (doc, win, h) => h.px(h.q('h1'), 'font-size') === 40 || 'Set font-size: 40px; on h1.' },
            { label: 'The h1 is centred', test: (doc, win, h) => h.css(h.q('h1'), 'text-align') === 'center' || 'Set text-align: center; on h1.' },
            {
              label: 'Paragraphs have a line-height of 1.6',
              test: (doc, win, h) => {
                const p = h.q('p');
                return Math.abs(h.px(p, 'line-height') / h.px(p, 'font-size') - 1.6) < 0.02 || 'Add a p rule with line-height: 1.6;';
              },
            },
          ],
        },
        {
          id: 'classes-ids',
          checks: [
            { label: 'Every .price is #b3541e', test: (doc, win, h) => h.all('.price').every((el) => h.sameColor(el, 'color', '#b3541e')) || 'Add a .price rule with color: #b3541e;' },
            { label: 'Every .price is bold', test: (doc, win, h) => h.all('.price').every((el) => Number(h.css(el, 'font-weight')) >= 700) || 'Add font-weight: bold; to the .price rule.' },
            { label: '#special has a #ffe8b0 background', test: (doc, win, h) => h.sameColor(h.q('#special'), 'background-color', '#ffe8b0') || 'Add a #special rule with background-color: #ffe8b0;' },
            { label: '#special has 8px of padding', test: (doc, win, h) => (h.px(h.q('#special'), 'padding-top') === 8 && h.px(h.q('#special'), 'padding-left') === 8) || 'Add padding: 8px; to the #special rule.' },
          ],
        },
      ],
    },
    {
      id: 'layout',
      title: 'Boxes and layout',
      summary: 'Spacing, borders, and arranging things side by side.',
      lessons: [
        {
          id: 'box-model',
          checks: [
            { label: 'Cards have 16px of padding', test: (doc, win, h) => h.all('.card').every((el) => h.px(el, 'padding-top') === 16 && h.px(el, 'padding-left') === 16) || 'Add padding: 16px; to .card.' },
            {
              label: 'Cards have a 2px solid #6f4e37 border',
              test: (doc, win, h) =>
                h.all('.card').every((el) => h.px(el, 'border-top-width') === 2 && h.css(el, 'border-top-style') === 'solid' && h.sameColor(el, 'border-top-color', '#6f4e37')) ||
                'Add border: 2px solid #6f4e37; to .card.',
            },
            { label: 'Corners are rounded by 12px', test: (doc, win, h) => h.all('.card').every((el) => h.px(el, 'border-top-left-radius') === 12) || 'Add border-radius: 12px; to .card.' },
            { label: 'Cards have a 16px bottom margin', test: (doc, win, h) => h.all('.card').every((el) => h.px(el, 'margin-bottom') === 16) || 'Add margin-bottom: 16px; to .card.' },
          ],
        },
        {
          id: 'flexbox',
          checks: [
            { label: '.menu is a flex container', test: (doc, win, h) => h.css(h.q('.menu'), 'display') === 'flex' || 'Add display: flex; to .menu.' },
            { label: 'There is a 16px gap between cards', test: (doc, win, h) => h.px(h.q('.menu'), 'column-gap') === 16 || 'Add gap: 16px; to .menu.' },
            { label: 'The cards are centred', test: (doc, win, h) => h.css(h.q('.menu'), 'justify-content') === 'center' || 'Add justify-content: center; to .menu.' },
            {
              label: 'The cards sit in one row',
              test: (doc, win, h) => {
                const tops = h.all('.menu > .card').map((el) => Math.round(el.getBoundingClientRect().top));
                return (h.css(h.q('.menu'), 'display') === 'flex' && tops.every((top) => top === tops[0])) || 'The cards are still stacked. Check the .menu rule.';
              },
            },
          ],
        },
        {
          id: 'hover-states',
          checks: [
            { label: 'The button is #6f4e37 with white text', test: (doc, win, h) => (h.sameColor(h.q('.btn'), 'background-color', '#6f4e37') && h.sameColor(h.q('.btn'), 'color', 'white')) || 'Set background-color: #6f4e37; and color: white; on .btn.' },
            {
              label: 'Padding is 10px 18px, corners are 8px',
              test: (doc, win, h) => {
                const btn = h.q('.btn');
                return (h.px(btn, 'padding-top') === 10 && h.px(btn, 'padding-left') === 18 && h.px(btn, 'border-top-left-radius') === 8) || 'Add padding: 10px 18px; and border-radius: 8px; to .btn.';
              },
            },
            {
              label: 'A .btn:hover rule changes the background to #8b6b4f',
              test: (doc, win, h) =>
                h.rules().some((rule) => rule.selector.replace(/\s/g, '').includes('.btn:hover') && rule.style.backgroundColor && h.color(rule.style.backgroundColor) === h.color('#8b6b4f')) ||
                'Add a separate rule: .btn:hover { background-color: #8b6b4f; }',
            },
            { label: 'The colour change is animated', test: (doc, win, h) => parseFloat(h.css(h.q('.btn'), 'transition-duration')) > 0 || 'Add transition: background-color 0.2s; to .btn.' },
          ],
        },
      ],
    },
    {
      id: 'responsive',
      title: 'Every screen size',
      summary: 'Grid layout and media queries.',
      lessons: [
        {
          id: 'responsive-grid',
          challenge: true,
          checks: [
            { label: '.menu is a grid container', test: (doc, win, h) => h.css(h.q('.menu'), 'display') === 'grid' || 'Add display: grid; to .menu.' },
            {
              label: 'The grid has 3 equal columns',
              test: (doc, win, h) => {
                const columns = h.css(h.q('.menu'), 'grid-template-columns').split(/\s+/).map(parseFloat);
                return (h.css(h.q('.menu'), 'display') === 'grid' && columns.length === 3 && columns.every((width) => Math.abs(width - columns[0]) < 1)) || 'Use grid-template-columns: repeat(3, 1fr);';
              },
            },
            { label: 'There is a 16px gap', test: (doc, win, h) => (h.px(h.q('.menu'), 'column-gap') === 16 && h.px(h.q('.menu'), 'row-gap') === 16) || 'Add gap: 16px; to .menu.' },
            {
              label: 'A media query for max-width: 600px sets one column',
              test: (doc, win, h) =>
                h.rules().some((rule) => /max-width:\s*600px/.test(rule.media) && rule.selector.includes('.menu') && rule.style.gridTemplateColumns.trim() === '1fr') ||
                'Add @media (max-width: 600px) { .menu { grid-template-columns: 1fr; } }',
            },
          ],
        },
      ],
    },
  ],
};
