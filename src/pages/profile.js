/**
 * pages/profile.js — who you are, what you have earned, and settings.
 */

import { el, icon, progressBar, courseMark, avatar, AVATAR_COUNT, shortDate, toast } from '../ui.js';
import { courses } from '../courses/index.js';
import { BADGES } from '../store.js';
import { accountCard } from '../components/account-card.js';

export function profilePage(_params, { store, router, account }) {
  const accountSection = accountCard({ account, router });
  const stats = store.stats();
  const level = store.level();
  const profile = store.state.profile;

  // ---- Identity -----------------------------------------------------------
  const avatarSlot = el('div', { class: 'profile-avatar' }, avatar(profile, 'xl'));
  const refreshAvatar = () => avatarSlot.replaceChildren(avatar(store.state.profile, 'xl'));

  const nameInput = el('input', {
    class: 'input',
    id: 'profile-name',
    type: 'text',
    maxlength: '24',
    autocomplete: 'nickname',
    placeholder: 'Your name',
    value: profile.name,
    oninput: (event) => {
      store.setProfile({ name: event.target.value.slice(0, 24) });
      refreshAvatar();
    },
  });

  const swatches = el(
    'div',
    { class: 'swatches', role: 'radiogroup', 'aria-label': 'Avatar colour' },
    Array.from({ length: AVATAR_COUNT }, (_, i) =>
      el(
        'button',
        {
          class: `swatch ${profile.avatar === i ? 'active' : ''}`,
          type: 'button',
          role: 'radio',
          'aria-checked': String(profile.avatar === i),
          'aria-label': `Colour ${i + 1}`,
          onclick: (event) => {
            store.setProfile({ avatar: i });
            for (const node of swatches.children) {
              node.classList.toggle('active', node === event.currentTarget);
              node.setAttribute('aria-checked', String(node === event.currentTarget));
            }
            refreshAvatar();
          },
        },
        avatar({ name: store.state.profile.name, avatar: i }, 'sm'),
      ),
    ),
  );

  const identity = el(
    'section',
    { class: 'card profile-card' },
    avatarSlot,
    el(
      'div',
      { class: 'profile-main' },
      el('p', { class: 'eyebrow' }, `Level ${level.level}`),
      el('h1', {}, level.title),
      progressBar(level.pct, 'xp'),
      el('p', { class: 'muted small' }, `${stats.xp} XP · ${level.toNext} XP to level ${level.level + 1}`),
      el('div', { class: 'field' }, el('label', { for: 'profile-name' }, 'Display name'), nameInput),
      el('div', { class: 'field' }, el('span', { class: 'field-label' }, 'Avatar colour'), swatches),
    ),
  );

  // ---- Numbers ------------------------------------------------------------
  const tile = (label, value, sub) => el('div', { class: 'card tile' }, el('p', { class: 'tile-label' }, label), el('p', { class: 'tile-value' }, value), el('p', { class: 'tile-sub muted' }, sub));
  const tiles = el(
    'section',
    { class: 'tiles' },
    tile('Lessons', `${stats.completed}/${stats.total}`, 'completed'),
    tile('Day streak', stats.streak, stats.streak === 1 ? 'day in a row' : 'days in a row'),
    tile('First-try passes', stats.firstTries, 'right on the first check'),
    tile('Solved unaided', stats.noHelp, 'no hints, no solution'),
    tile('Checks run', stats.checks, `${stats.failedChecks} did not pass`),
    tile('Hints used', stats.hints, 'that is what they are for'),
  );

  // ---- Courses ------------------------------------------------------------
  const courseList = el(
    'section',
    { class: 'card' },
    el('h2', { class: 'card-heading' }, 'Courses'),
    courses.map((course) => {
      const progress = store.courseProgress(course);
      return el(
        'a',
        { class: 'level-row', href: `#/course/${course.id}`, style: `--course:${course.color}` },
        courseMark(course, 'sm'),
        el('span', { class: 'level-name' }, course.title),
        progressBar(progress.pct, 'course small'),
        el('span', { class: 'muted small level-count' }, `${progress.done}/${progress.total}`),
      );
    }),
  );

  // ---- Badges -------------------------------------------------------------
  const badgeGrid = el(
    'section',
    { class: 'card' },
    el('div', { class: 'card-heading-row' }, el('h2', { class: 'card-heading' }, 'Badges'), el('span', { class: 'muted small' }, `${store.earnedBadges().length} of ${BADGES.length} earned`)),
    el(
      'ul',
      { class: 'badge-grid' },
      BADGES.map((badge) => {
        const earnedOn = store.state.badges[badge.id];
        return el(
          'li',
          { class: `badge-card ${earnedOn ? 'earned' : 'locked'}` },
          el('span', { class: 'badge-icon' }, earnedOn ? badge.icon : icon('lock', 20)),
          el('strong', {}, badge.title),
          el('span', { class: 'muted small' }, badge.description),
          earnedOn ? el('span', { class: 'badge-date small' }, `Earned ${shortDate(earnedOn)}`) : null,
        );
      }),
    ),
  );

  // ---- Settings -----------------------------------------------------------
  const unlockToggle = el('input', {
    type: 'checkbox',
    id: 'unlock-all',
    checked: store.state.settings.unlockAll,
    onchange: (event) => {
      store.setSetting('unlockAll', event.target.checked);
      toast(event.target.checked ? 'Every lesson is now open.' : 'Lessons unlock one at a time again.');
    },
  });

  const settings = el(
    'section',
    { class: 'card' },
    el('h2', { class: 'card-heading' }, 'Settings'),
    el(
      'label',
      { class: 'setting', for: 'unlock-all' },
      unlockToggle,
      el('span', {}, el('strong', {}, 'Unlock all lessons'), el('br'), el('span', { class: 'muted small' }, 'Skip the order and open any lesson straight away. XP and badges work the same.')),
    ),
    el(
      'div',
      { class: 'setting' },
      el('span', {}, el('strong', {}, 'Reset progress'), el('br'), el('span', { class: 'muted small' }, 'Clears completed lessons, XP, badges, drafts and activity, here and in your account. Your name and settings stay.')),
      el(
        'button',
        {
          class: 'btn btn-danger btn-sm',
          type: 'button',
          onclick: () => {
            if (window.confirm('Clear all progress, XP, badges and saved code? This cannot be undone.')) {
              store.resetProgress();
              router.go('/profile');
              toast('Progress cleared.');
            }
          },
        },
        'Reset progress',
      ),
    ),
    el('p', { class: 'muted small' }, account.status.user ? 'Progress is saved in this browser and in your account.' : 'Without an account, everything is saved in this browser only and nothing leaves your device.'),
  );

  return {
    el: el('section', { class: 'page page-profile' }, identity, accountSection.el, tiles, el('div', { class: 'two-col' }, courseList, settings), badgeGrid),
    unmount: () => accountSection.destroy(),
  };
}
