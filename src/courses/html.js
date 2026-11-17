/**
 * HTML course — structure and grading. Lesson text lives in ./html/*.md.
 *
 * Checks run inside the preview iframe (see runners/web.js), so each `test`
 * must be self-contained and use only its arguments:
 *   doc  the learner's document      h    helpers (q, all, text, css, px, …)
 *   win  its window                  src  { 'index.html': '…source…' }
 * Return true to pass, or a string explaining what is missing.
 */

export default {
  id: 'html',
  title: 'HTML',
  layer: 'Structure',
  mark: '</>',
  color: '#ff7a59',
  kind: 'web',
  tagline: 'Give a page its bones.',
  description: 'Every site starts here. Learn the tags that turn plain text into headings, lists, links, images and forms.',
  chapters: [
    {
      id: 'first-page',
      title: 'Your first page',
      summary: 'Tags, elements and the skeleton every page shares.',
      lessons: [
        {
          id: 'first-tags',
          checks: [
            {
              label: 'An <h1> heading that says "Brewline"',
              test: (doc, win, h) => {
                const heading = h.q('h1');
                if (!heading) return 'There is no <h1> element yet.';
                return h.text(heading).toLowerCase().includes('brewline') || 'The <h1> should contain the text Brewline.';
              },
            },
            {
              label: 'A <p> paragraph with a short description',
              test: (doc, win, h) => {
                const paragraph = h.q('p');
                if (!paragraph) return 'There is no <p> element yet.';
                return h.text(paragraph).length >= 10 || 'Write a few more words inside the <p>.';
              },
            },
          ],
        },
        {
          id: 'page-skeleton',
          checks: [
            {
              label: 'Starts with <!DOCTYPE html>',
              test: (doc, win, h, src) => /^\s*<!doctype html>/i.test(src['index.html']) || 'The very first line should be <!DOCTYPE html>.',
            },
            {
              label: '<html> has lang="en"',
              test: (doc, win, h, src) =>
                (/<html\b/i.test(src['index.html']) && (doc.documentElement.getAttribute('lang') || '').startsWith('en')) || 'Add <html lang="en"> around the page.',
            },
            {
              label: '<head> contains a <title>',
              test: (doc, win, h, src) => (/<head\b/i.test(src['index.html']) && doc.title.trim().length > 0) || 'Add <head> with a <title> that has some text.',
            },
            {
              label: 'The heading and paragraph are inside <body>',
              test: (doc, win, h, src) => (/<body\b/i.test(src['index.html']) && Boolean(h.q('body h1') && h.q('body p'))) || 'Wrap the <h1> and <p> in <body> … </body>.',
            },
          ],
        },
        {
          id: 'headings-emphasis',
          checks: [
            { label: 'Exactly one <h1>', test: (doc, win, h) => h.all('h1').length === 1 || 'A page should have one <h1>.' },
            { label: 'An <h2> for the "Today\'s special" section', test: (doc, win, h) => h.all('h2').some((el) => h.text(el).length > 0) || 'Add an <h2> heading with some text.' },
            { label: 'A paragraph with a <strong> phrase', test: (doc, win, h) => h.all('p strong').some((el) => h.text(el).length > 0) || 'Wrap a phrase inside a <p> in <strong> … </strong>.' },
            { label: 'A paragraph with an <em> phrase', test: (doc, win, h) => h.all('p em').some((el) => h.text(el).length > 0) || 'Wrap a phrase inside a <p> in <em> … </em>.' },
          ],
        },
      ],
    },
    {
      id: 'content',
      title: 'Real content',
      summary: 'Lists, links, images and the regions of a page.',
      lessons: [
        {
          id: 'lists',
          checks: [
            { label: 'A <ul> with at least 3 items', test: (doc, win, h) => h.all('ul > li').length >= 3 || 'Add a <ul> containing three or more <li> elements.' },
            { label: 'An <ol> with at least 3 items', test: (doc, win, h) => h.all('ol > li').length >= 3 || 'Add an <ol> containing three or more <li> elements.' },
            { label: 'No list item is empty', test: (doc, win, h) => (h.all('li').length > 0 && h.all('li').every((el) => h.text(el).length > 0)) || 'Every <li> needs some text.' },
          ],
        },
        {
          id: 'links-images',
          checks: [
            {
              label: 'An image showing img/cup.svg',
              test: (doc, win, h) => h.all('img').some((el) => (el.getAttribute('src') || '').trim() === 'img/cup.svg') || 'Add <img src="img/cup.svg" …>.',
            },
            {
              label: 'The image has a descriptive alt text',
              test: (doc, win, h) => h.all('img').some((el) => (el.getAttribute('alt') || '').trim().length >= 3) || 'Describe the image in its alt attribute.',
            },
            {
              label: 'A link to menu.html',
              test: (doc, win, h) => h.all('a').some((el) => (el.getAttribute('href') || '').trim() === 'menu.html' && h.text(el).length > 0) || 'Add <a href="menu.html">See the menu</a>.',
            },
            {
              label: 'An https:// link that opens in a new tab',
              test: (doc, win, h) =>
                h.all('a').some((el) => /^https:\/\//.test((el.getAttribute('href') || '').trim()) && el.getAttribute('target') === '_blank') ||
                'One link needs an href starting with https:// and target="_blank".',
            },
          ],
        },
        {
          id: 'semantic-layout',
          checks: [
            { label: 'A <header> containing the <h1>', test: (doc, win, h) => Boolean(h.q('header h1')) || 'Put the <h1> inside a <header>.' },
            { label: 'A <nav> in the header with at least 2 links', test: (doc, win, h) => h.all('header nav a[href]').length >= 2 || 'Add a <nav> with two or more <a href="…"> links inside the <header>.' },
            { label: 'A <main> with an <h2> section', test: (doc, win, h) => Boolean(h.q('main h2')) || 'Move the <h2> section inside a <main>.' },
            { label: 'A <footer> with some text', test: (doc, win, h) => h.text(h.q('footer')).length > 0 || 'Add a <footer> with a line of text.' },
          ],
        },
      ],
    },
    {
      id: 'input',
      title: 'Asking for input',
      summary: 'Forms: the bridge between a page and a server.',
      lessons: [
        {
          id: 'order-form',
          challenge: true,
          checks: [
            { label: 'A <form> element', test: (doc, win, h) => Boolean(h.q('form')) || 'Start with <form> … </form>.' },
            {
              label: 'A text input named "name" with a linked label',
              test: (doc, win, h) => {
                const input = h.q('form input[name="name"]');
                if (!input) return 'Add <input type="text" name="name"> inside the form.';
                if (input.type !== 'text') return 'The name field should have type="text".';
                return (Boolean(input.id) && h.all('label').some((label) => label.htmlFor === input.id)) || 'Give the input an id and point a <label for="…"> at it.';
              },
            },
            {
              label: 'A <select> named "drink" with at least 3 options',
              test: (doc, win, h) => {
                const select = h.q('form select[name="drink"]');
                if (!select) return 'Add <select name="drink"> inside the form.';
                return select.options.length >= 3 || 'The drop-down needs three or more <option> elements.';
              },
            },
            {
              label: 'A number input named "qty" with min="1"',
              test: (doc, win, h) => {
                const input = h.q('form input[name="qty"]');
                if (!input) return 'Add an input with name="qty" inside the form.';
                if (input.type !== 'number') return 'The quantity field should have type="number".';
                return input.getAttribute('min') === '1' || 'Add min="1" so nobody can order zero drinks.';
              },
            },
            {
              label: 'A submit button',
              test: (doc, win, h) => h.all('form button, form input').some((el) => el.type === 'submit') || 'Add <button type="submit">…</button> inside the form.',
            },
          ],
        },
      ],
    },
  ],
};
