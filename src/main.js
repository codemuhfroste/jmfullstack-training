/**
 * main.js — wires the pieces together.
 *
 *   router ──► pages/home.js        dashboard: level, streak, the courses
 *          ──► pages/course.js      a course as a path of lessons
 *          ──► pages/lesson.js      learn + editor + checks ──► runners/
 *          ──► pages/playground.js  ungraded scratchpad      ──► runners/
 *          ──► pages/reviewer.js    study notes per course
 *          ──► pages/profile.js     stats, badges, settings
 *
 *          ──► pages/leaderboard.js everyone with an account, by XP
 *
 *   store.js (progress, XP, badges) ◄── every page
 *   account.js (login, sync)        ──► /api/* (Vercel functions) ──► Turso
 *   courses/ (lesson data)          ◄── store, pages
 *
 *   runners/web.js         sandboxed iframe      HTML, CSS, DOM lessons
 *   runners/javascript.js  Web Worker            JavaScript logic lessons
 *   runners/php.js         PHP 8.4 WebAssembly   via php-runner.js ► php-worker.js
 *   runners/sql.js         SQLite WebAssembly    via sql.js
 */

import './style.css';
import { PhpRunner } from './php-runner.js';
import { Repl } from './repl.js';
import { createStore } from './store.js';
import { createAccount } from './account.js';
import { createRouter } from './router.js';
import { courses } from './courses/index.js';
import { el, setChildren, icon, avatar } from './ui.js';
import { homePage } from './pages/home.js';
import { coursePage } from './pages/course.js';
import { lessonPage } from './pages/lesson.js';
import { playgroundPage } from './pages/playground.js';
import { profilePage } from './pages/profile.js';
import { reviewerIndexPage, reviewerPage } from './pages/reviewer.js';
import { leaderboardPage } from './pages/leaderboard.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Shared services
// ---------------------------------------------------------------------------
const store = createStore();
const account = createAccount(store);

// PHP is a 20 MB download, so it is only started when a PHP lesson, the PHP
// playground or the PHP console is opened.
let php = null;
let repl = null;
const getPhp = () => (php ??= new PhpRunner({ timeoutMs: 5000 }));
const getRepl = () => (repl ??= new Repl(getPhp()));

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------
const NAV = [
  { route: '/', label: 'Learn', icon: 'home', match: (path) => path === '/' || path.startsWith('/course') || path.startsWith('/lesson') },
  { route: '/reviewer', label: 'Reviewer', icon: 'book', match: (path) => path.startsWith('/reviewer') },
  { route: '/playground', label: 'Playground', icon: 'code', match: (path) => path.startsWith('/playground') },
  { route: '/leaderboard', label: 'Leaderboard', icon: 'trophy', match: (path) => path.startsWith('/leaderboard') },
];

$('brand-mark').append(icon('layers', 20));
const navLinks = NAV.map((item) => el('a', { href: `#${item.route}` }, icon(item.icon, 18), el('span', {}, item.label)));
$('nav').append(...navLinks);

function renderTopStats() {
  const level = store.level();
  const streak = store.streak();
  setChildren(
    $('top-stats'),
    el('span', { class: `stat-chip streak ${store.activeToday() ? 'lit' : ''}`, title: streak ? `${streak}-day streak` : 'No streak yet. Run some code today.' }, el('span', { 'aria-hidden': 'true' }, '🔥'), streak, el('span', { class: 'sr-only' }, ' day streak')),
    el('span', { class: 'stat-chip xp', title: `${store.xp()} XP in total` }, icon('bolt', 15), store.xp(), el('span', { class: 'sr-only' }, ' XP')),
    account.status.available && !account.status.user ? el('a', { class: 'stat-chip login', href: '#/profile' }, 'Log in') : null,
    el(
      'a',
      { class: 'stat-chip level', href: '#/profile', title: `Your profile · Level ${level.level} ${level.title}`, 'aria-label': 'Your profile' },
      avatar(store.state.profile, 'sm'),
      el('span', { class: 'level-text' }, `Lv ${level.level}`),
    ),
  );
}
store.subscribe(renderTopStats);
account.subscribe(renderTopStats);
renderTopStats();

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const ctx = { store, account, php: getPhp, repl: getRepl, router: null };

const pageName = (path) => (path.startsWith('/lesson') ? 'lesson' : path.startsWith('/playground') ? 'playground' : path.startsWith('/course') ? 'course' : path.startsWith('/profile') ? 'profile' : path.startsWith('/reviewer') ? 'reviewer' : path.startsWith('/leaderboard') ? 'leaderboard' : 'home');

const router = createRouter(
  [
    { pattern: /^\/$/, page: (params) => homePage(params, ctx) },
    { pattern: /^\/course\/(?<id>[^/]+)$/, page: (params) => coursePage(params, ctx) },
    { pattern: /^\/lesson\/(?<course>[^/]+)\/(?<id>[^/]+)$/, page: (params) => lessonPage(params, ctx) },
    { pattern: /^\/playground(?:\/(?<mode>[^/]+))?$/, page: (params) => playgroundPage(params, ctx) },
    { pattern: /^\/reviewer$/, page: (params) => reviewerIndexPage(params, ctx) },
    { pattern: /^\/reviewer\/(?<id>[^/]+)$/, page: (params) => reviewerPage(params, ctx) },
    { pattern: /^\/leaderboard$/, page: (params) => leaderboardPage(params, ctx) },
    { pattern: /^\/profile$/, page: (params) => profilePage(params, ctx) },
  ],
  {
    outlet: $('app'),
    onNavigate(path) {
      NAV.forEach((item, i) => {
        const on = item.match(path);
        navLinks[i].classList.toggle('active', on);
        if (on) navLinks[i].setAttribute('aria-current', 'page');
        else navLinks[i].removeAttribute('aria-current');
      });
      // Lets CSS give the lesson and playground pages a full-height layout.
      document.body.dataset.page = pageName(path);
      renderTopStats();
    },
  },
);
ctx.router = router;
router.start();

// Find out whether someone is logged in. If their saved progress was merged
// in, the page on screen is out of date, so draw it again.
account.init().then((status) => {
  if (status.user) router.go(location.hash.replace(/^#/, '') || '/');
});

// Small debugging hook (also used by the automated browser test):
//   fst.router.go('/lesson/php/03-fizzbuzz')
//   fst.page().setFile('main.php', '<?php ...'); fst.page().check()
//   await fst.verify()    // run every lesson's solution and starter code
window.fst = {
  store,
  account,
  router,
  courses,
  php: getPhp,
  page: () => router.currentPage,
  verify: (options) => import('./verify.js').then((module) => module.verifyAll(ctx, options)),
};
