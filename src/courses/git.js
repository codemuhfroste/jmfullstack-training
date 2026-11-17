/**
 * Git course — structure only. Git cannot run in the browser, so these are
 * quiz lessons (kind 'quiz'): each lesson's questions and answers live in the
 * "## Quiz" section of its .md file (format: see lesson-file.js).
 */

export default {
  id: 'git',
  title: 'Git',
  layer: 'Workflow',
  mark: 'git',
  color: '#c4d94a',
  kind: 'quiz',
  tagline: 'Never lose work again.',
  description: 'The tool every developer uses every day. Save snapshots of your project, try ideas on branches, and share your work through a remote.',
  chapters: [
    {
      id: 'saving',
      title: 'Saving your work',
      summary: 'Repositories, staging, commits and history.',
      lessons: [{ id: 'repositories' }, { id: 'staging-commits' }, { id: 'history' }],
    },
    {
      id: 'branching',
      title: 'Branching',
      summary: 'Parallel lines of work, and merging them.',
      lessons: [{ id: 'branches' }],
    },
    {
      id: 'sharing',
      title: 'Working with others',
      summary: 'Remotes, and the full daily workflow.',
      lessons: [{ id: 'remotes' }, { id: 'workflow', challenge: true }],
    },
  ],
};
