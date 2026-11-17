/**
 * router.js — a minimal hash router.
 *
 * Routes are matched against the part of the URL after `#`, e.g.
 *   #/                    → dashboard
 *   #/exercise/03-fizzbuzz → exercise page
 *   #/playground          → terminal
 *
 * Hash routing works on any static host (Vercel, GitHub Pages) with no
 * rewrite rules, because the server only ever sees `/`.
 *
 * A "page" is an object `{ el, mount?(), unmount?() }`. The router removes
 * the previous page's element, appends the new one, then calls mount().
 */

/**
 * @param {{ pattern: RegExp, page: (params: Record<string,string>) => object }[]} routes
 * @param {{ outlet: HTMLElement, onNavigate?: (path: string) => void }} options
 */
export function createRouter(routes, { outlet, onNavigate }) {
  let current = null;

  function resolve(hash) {
    const path = hash.replace(/^#/, '') || '/';
    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match) return { route, params: match.groups || {}, path };
    }
    return { route: routes[0], params: {}, path: '/' }; // fallback: first route
  }

  function render() {
    const { route, params, path } = resolve(location.hash);

    current?.unmount?.();
    outlet.replaceChildren();

    current = route.page(params);
    outlet.append(current.el);
    current.mount?.();

    outlet.scrollTop = 0;
    onNavigate?.(path);
  }

  window.addEventListener('hashchange', render);

  return {
    start: render,
    /** Navigate programmatically, e.g. router.go('/exercise/03-fizzbuzz'). */
    go(path) {
      const target = `#${path}`;
      if (location.hash === target) render();
      else location.hash = target;
    },
    get currentPage() {
      return current;
    },
  };
}
