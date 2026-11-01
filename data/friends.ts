import { Friend } from '../types';

/**
 * The "friends" wall at the bottom of the index: 88x31 web buttons linking to friends' sites.
 *
 * To add someone, add one line. Save their button into /public/buttons/ rather
 * than hotlinking it — a copy can't break when they redesign, and visitors
 * don't ping a dozen other servers on every page load. No button yet? Leave
 * `button` out and a text tile in this site's style stands in.
 */
export const friends: Friend[] = [
  // { name: 'Jane Doe', url: 'https://jane.dev', button: '/buttons/jane.png' },
  // { name: 'Sam Lee', url: 'https://samlee.me' },  // no button → text tile
];

/**
 * My own button (drawn by scripts/button.mjs), served from a stable URL so
 * other sites can link back. Keep the path fixed: friends' sites point at it.
 */
export const me: Friend = {
  name: 'Ethan Tran',
  url: 'https://www.ethantran.ca',
  button: '/button.png',
};
