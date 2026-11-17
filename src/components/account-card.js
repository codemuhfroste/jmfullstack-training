/**
 * components/account-card.js — the "Account" card on the profile page.
 *
 * Signed out: log in / create account. Signed in: sync status, log out,
 * change password, delete account. On a deployment without the API it
 * explains that progress is kept in this browser only.
 */

import { el, setChildren, icon, toast } from '../ui.js';

const SYNC_TEXT = {
  idle: '',
  syncing: 'Saving your progress…',
  synced: 'All progress is saved to your account.',
  offline: 'You are offline. Progress is kept on this device and will sync when you are back.',
  error: 'Progress could not be saved to your account.',
};

/**
 * @param {{ account: ReturnType<import('../account.js').createAccount>, router: { go(path: string): void } }} ctx
 * @returns {{ el: HTMLElement, destroy(): void }}
 */
export function accountCard({ account, router }) {
  const body = el('div', { class: 'account-body' });
  const root = el('section', { class: 'card account-card' }, el('h2', { class: 'card-heading' }, icon('user', 16), 'Account'), body);
  let mode = 'login';

  /** A labelled input. */
  function field(label, attrs) {
    const input = el('input', { class: 'input', ...attrs });
    return { input, row: el('div', { class: 'field' }, el('label', { for: attrs.id }, label), input) };
  }

  /** Run an async form action with the button disabled and errors shown. */
  function submitter(form, errorEl, action) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type=submit]');
      button.disabled = true;
      errorEl.hidden = true;
      const result = await action();
      button.disabled = false;
      if (!result.ok) {
        errorEl.textContent = result.error;
        errorEl.hidden = false;
      }
    });
  }

  // ---- signed out ---------------------------------------------------------
  function renderSignedOut() {
    const signingUp = mode === 'signup';
    const username = field('Username', { id: 'account-username', type: 'text', name: 'username', autocomplete: 'username', autocapitalize: 'off', spellcheck: false, required: true, minlength: '3', maxlength: '20' });
    const password = field('Password', { id: 'account-password', type: 'password', name: 'password', autocomplete: signingUp ? 'new-password' : 'current-password', required: true, minlength: signingUp ? '8' : '1', maxlength: '200' });
    const code = field('Invite code', { id: 'account-code', type: 'text', name: 'code', autocomplete: 'off', required: true });
    const error = el('p', { class: 'form-error', role: 'alert', hidden: true });

    const form = el(
      'form',
      { class: 'account-form' },
      username.row,
      password.row,
      signingUp && account.status.inviteOnly ? code.row : null,
      signingUp ? el('p', { class: 'muted small' }, 'Use at least 8 characters. There is no "forgot password" email, so choose something you will remember.') : null,
      error,
      el('button', { class: 'btn btn-primary', type: 'submit' }, signingUp ? 'Create account' : 'Log in'),
    );

    submitter(form, error, async () => {
      const details = { username: username.input.value, password: password.input.value, code: code.input.value };
      const result = signingUp ? await account.signup(details) : await account.login(details);
      if (result.ok) {
        toast(signingUp ? 'Account created. Your progress is now saved to it.' : 'Welcome back. Your progress is in sync.', 'good');
        router.go('/profile'); // progress may have changed: redraw the page
      }
      return result;
    });

    const tab = (id, label) =>
      el(
        'button',
        {
          class: mode === id ? 'active' : '',
          type: 'button',
          'aria-pressed': String(mode === id),
          onclick: () => {
            mode = id;
            render();
          },
        },
        label,
      );

    setChildren(
      body,
      el('p', { class: 'muted' }, 'Log in to keep your progress on every device and to appear on the leaderboard. Progress made on this device is added to your account.'),
      account.status.error ? el('p', { class: 'form-error' }, account.status.error) : null,
      el('div', { class: 'segmented account-tabs' }, tab('login', 'Log in'), tab('signup', 'Create account')),
      form,
    );
  }

  // ---- signed in ----------------------------------------------------------
  function renderSignedIn() {
    const { user, sync, error: syncError } = account.status;
    const logoutError = el('p', { class: 'form-error', role: 'alert', hidden: true });

    const logoutBtn = el(
      'button',
      {
        class: 'btn',
        type: 'button',
        onclick: async () => {
          logoutBtn.disabled = true;
          const result = await account.logout();
          if (result.ok) {
            toast('Logged out. Your progress is safe in your account.');
            router.go('/profile');
          } else {
            logoutBtn.disabled = false;
            logoutError.textContent = result.error;
            logoutError.hidden = false;
          }
        },
      },
      'Log out',
    );

    // Change password
    const current = field('Current password', { id: 'account-current', type: 'password', autocomplete: 'current-password', required: true });
    const next = field('New password', { id: 'account-new', type: 'password', autocomplete: 'new-password', required: true, minlength: '8', maxlength: '200' });
    const changeError = el('p', { class: 'form-error', role: 'alert', hidden: true });
    const changeForm = el('form', { class: 'account-form' }, current.row, next.row, changeError, el('button', { class: 'btn btn-sm', type: 'submit' }, 'Change password'));
    submitter(changeForm, changeError, async () => {
      const result = await account.changePassword({ password: current.input.value, newPassword: next.input.value });
      if (result.ok) {
        changeForm.reset();
        toast('Password changed. Other devices have been logged out.', 'good');
      }
      return result;
    });

    // Delete account
    const confirm = field('Your password, to confirm', { id: 'account-delete', type: 'password', autocomplete: 'current-password', required: true });
    const deleteError = el('p', { class: 'form-error', role: 'alert', hidden: true });
    const deleteForm = el(
      'form',
      { class: 'account-form' },
      el('p', { class: 'muted small' }, 'This removes your account, your saved progress and your place on the leaderboard from the server. It cannot be undone. Progress already in this browser stays here.'),
      confirm.row,
      deleteError,
      el('button', { class: 'btn btn-danger btn-sm', type: 'submit' }, 'Delete my account'),
    );
    submitter(deleteForm, deleteError, async () => {
      const result = await account.deleteAccount({ password: confirm.input.value });
      if (result.ok) {
        toast('Your account has been deleted.');
        router.go('/profile');
      }
      return result;
    });

    setChildren(
      body,
      el('p', { class: 'account-who' }, 'Logged in as ', el('strong', {}, `@${user.username}`)),
      el('p', { class: `sync-line sync-${sync}`, role: 'status' }, el('span', { class: 'sync-dot' }), syncError && sync === 'error' ? syncError : SYNC_TEXT[sync]),
      el(
        'div',
        { class: 'account-actions' },
        el('a', { class: 'btn btn-primary', href: '#/leaderboard' }, icon('trophy', 16), 'Leaderboard'),
        sync === 'offline' || sync === 'error' ? el('button', { class: 'btn', type: 'button', onclick: () => account.syncNow() }, 'Try again') : null,
        logoutBtn,
      ),
      logoutError,
      el('details', { class: 'account-more' }, el('summary', {}, 'Change password'), changeForm),
      el('details', { class: 'account-more' }, el('summary', {}, 'Delete account'), deleteForm),
    );
  }

  let shownFor = null;

  function render() {
    const { checked, available, user } = account.status;
    if (!checked) {
      setChildren(body, el('p', { class: 'muted' }, 'Checking your account…'));
    } else if (!available) {
      setChildren(body, el('p', { class: 'muted' }, 'Accounts are not available here, so your progress is saved in this browser only. Everything else works as usual.'));
    } else if (user) {
      renderSignedIn();
    } else {
      renderSignedOut();
    }
    shownFor = `${checked}|${available}|${user?.username}|${account.status.sync}|${account.status.error}`;
  }

  // Redraw on status changes, but never while someone is typing in a form.
  const unsubscribe = account.subscribe(() => {
    const key = `${account.status.checked}|${account.status.available}|${account.status.user?.username}|${account.status.sync}|${account.status.error}`;
    if (key === shownFor) return;
    if (root.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
    render();
  });

  render();
  return { el: root, destroy: unsubscribe };
}
