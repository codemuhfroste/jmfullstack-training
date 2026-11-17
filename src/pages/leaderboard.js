/**
 * pages/leaderboard.js — everyone with an account, ranked by XP.
 */

import { el, setChildren, icon, avatar, plural } from '../ui.js';
import { levelInfo } from '../gamify.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export function leaderboardPage(_params, { account }) {
  const content = el('div', { class: 'leaderboard-content' });
  const root = el(
    'section',
    { class: 'page page-leaderboard' },
    el(
      'header',
      { class: 'card hero' },
      el(
        'div',
        { class: 'hero-main' },
        el('p', { class: 'eyebrow' }, 'Leaderboard'),
        el('h1', {}, 'Learn together.'),
        el('p', { class: 'muted hero-text' }, 'Everyone with an account here, ranked by XP. Finish lessons to climb, and keep your streak alive to show you are still at it.'),
      ),
    ),
    content,
  );

  const message = (title, text, action = null) => setChildren(content, el('div', { class: 'card empty-state' }, el('h2', {}, title), el('p', { class: 'muted' }, text), action));

  function row(player, index) {
    const level = levelInfo(player.xp);
    return el(
      'li',
      { class: `card player ${player.you ? 'you' : ''}` },
      el('span', { class: 'player-rank', 'aria-label': `Rank ${index + 1}` }, MEDALS[index] || index + 1),
      avatar({ name: player.name || player.username, avatar: player.avatar }),
      el(
        'span',
        { class: 'player-name' },
        el('strong', {}, player.name || player.username, player.you ? el('span', { class: 'chip chip-xp you-chip' }, 'You') : null),
        el('span', { class: 'muted small' }, `@${player.username} · Level ${level.level} ${level.title}`),
      ),
      el('span', { class: 'player-stat', title: 'Day streak' }, el('span', { 'aria-hidden': 'true' }, '🔥'), player.streak, el('span', { class: 'sr-only' }, ' day streak')),
      el('span', { class: 'player-stat muted', title: 'Lessons completed' }, plural(player.lessons, 'lesson')),
      el('span', { class: 'player-xp' }, icon('bolt', 15), player.xp, el('span', { class: 'small' }, ' XP')),
    );
  }

  let alive = true;

  async function load() {
    const { checked, available, user } = account.status;
    if (!checked) return message('Loading…', 'Checking your account.');
    if (!available) return message('Not available here', 'This copy of FSTraining runs without accounts, so there is no leaderboard. Your progress is still saved in this browser.');
    if (!user) return message('Log in to see the leaderboard', 'Create a free account to save your progress and see how your friends are doing.', el('a', { class: 'btn btn-primary', href: '#/profile' }, 'Log in or create an account'));

    message('Loading…', 'Fetching the latest scores.');
    await account.syncNow(); // so your own row is up to date
    const result = await account.leaderboard();
    if (!alive) return;
    if (!result.ok) return message('Could not load the leaderboard', result.error, el('button', { class: 'btn', type: 'button', onclick: load }, 'Try again'));

    setChildren(
      content,
      el('ol', { class: 'players' }, result.players.map(row)),
      result.players.length === 1 ? el('p', { class: 'muted leaderboard-note' }, 'It is just you so far. Share the site with your friends so they can join.') : null,
    );
  }

  // The account check may still be running when the page opens.
  const unsubscribe = account.subscribe((status) => {
    const key = `${status.checked}|${status.user?.username}`;
    if (alive && content.dataset.for !== key) {
      content.dataset.for = key;
      load();
    }
  });

  return {
    el: root,
    mount() {
      content.dataset.for = `${account.status.checked}|${account.status.user?.username}`;
      load();
    },
    unmount() {
      alive = false;
      unsubscribe();
    },
  };
}
