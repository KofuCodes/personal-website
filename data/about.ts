import { AboutItem } from '../types';

/**
 * The "About" list on the home page — one entry per line, rendered with a ✦ marker.
 *
 * Each entry is a list of parts (see AboutPart in types.ts): plain strings,
 * emoji, brand icons pulled from a site's favicon via { domain, name } (the
 * icon and name render together, kept on one line), or internal links. To add
 * a line, copy an entry and edit — the icons need no assets.
 */
export const aboutItems: AboutItem[] = [
  {
    parts: [
      'Favorite game: ',
      { domain: 'leagueoflegends.com', name: 'League of Legends' },
      ' — I can quit whenever I want.',
    ],
  },
  {
    parts: [
      'I document cities on a ',
      { emoji: '📷' },
      ' Sony Cybershot — favorites live in the ',
      { text: 'gallery', to: '/photography' },
      '.',
    ],
    sub: ['urban architecture, travel, and the details most people overlook.'],
  },
  {
    parts: [
      'Currently learning ',
      { domain: 'ros.org', name: 'ROS 2' },
      ' and control systems.',
    ],
  },
  {
    parts: [
      'Currently reading about ',
      { emoji: '📚' },
      ' RLMs and recursive self-improvement.',
    ],
  },
  {
    parts: [
      'My favorite model is ',
      { domain: 'claude.ai', name: 'Claude Opus 5' },
      '.',
    ],
  },
  {
    parts: [
      'My current goal is to contribute to ',
      { domain: 'nvidia.com', name: 'NVIDIA' },
      '.',
    ],
  },
];
