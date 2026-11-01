import React from 'react';
import { friends, me } from '../data/friends';
import { Friend } from '../types';
import QuietHeader from './QuietHeader';

/**
 * "Friends": a wall of 88x31 web buttons, the old-web way of linking to the
 * people you like. Mine leads, the way most button walls start with their
 * own — it's also the one friends copy onto their sites (README → Friends).
 */

// Buttons are pixel art (mine included): keep their pixels square when a
// retina screen scales them up, instead of smearing them.
const Button: React.FC<{ friend: Friend }> = ({ friend }) =>
  friend.button ? (
    <img
      src={friend.button}
      width={88}
      height={31}
      alt={friend.name}
      loading="lazy"
      decoding="async"
      className="block h-[31px] w-[88px] [image-rendering:pixelated]"
    />
  ) : (
    // No button yet: a text tile on the same 88x31 footprint, so the wall stays a grid
    <span className="flex h-[31px] w-[88px] items-center justify-center border border-ink-300 bg-paper-100 px-1.5 text-[13px] leading-none text-ink-700">
      <span className="truncate">{friend.name}</span>
    </span>
  );

const Friends: React.FC = () => (
  <section className="mt-7 reveal" aria-label="Friends">
    <QuietHeader label="friends" />
    <ul className="flex flex-wrap gap-2">
      {[me, ...friends].map((f) => (
        <li key={f.url}>
          <a
            href={f.url}
            title={f.name}
            {...(f === me ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className="block outline-none transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_3px_8px_-3px_rgba(27,31,34,0.45)] focus-visible:ring-2 focus-visible:ring-beak focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Button friend={f} />
          </a>
        </li>
      ))}
    </ul>
  </section>
);

export default Friends;
