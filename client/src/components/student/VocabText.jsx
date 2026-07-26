// VocabText.jsx — the tap-for-plain-words vocabulary layer (spec §2, build
// spec §2). Any of the five required terms, wherever it appears in
// student-visible text, is underlined and made tappable; tapping reveals a
// 5th-grade-level definition (the exact strings from usCorpsOfDiscovery.js's
// VOCAB export).
//
// It underlines the FIRST occurrence of each distinct term within a given block
// of text (a plain, render-stable rule — no cross-render state to glitch). A
// term that returns in a later leg is underlined again there too.

import { useState } from 'react';

// Plain-words definitions (spec §2), at a 5th grade reading level — copied
// verbatim from usCorpsOfDiscovery.js's VOCAB export.
export const VOCAB = {
  expedition:  { term: 'expedition',  def: 'A long journey with a mission.' },
  keelboat:    { term: 'keelboat',    def: 'A big flat river boat, pushed and pulled upstream.' },
  portage:     { term: 'portage',     def: 'Carrying boats and cargo overland around water you cannot sail.' },
  interpreter: { term: 'interpreter', def: 'A person who translates between two languages.' },
  pirogue:     { term: 'pirogue',     def: 'A large canoe-style boat.' },
};

// Word-boundaried so "portage" never matches inside a longer word, and each
// pattern covers the plain plural (expeditions, keelboats, portages,
// interpreters, pirogues) that actually shows up in the leg text.
const PATTERNS = [
  { key: 'expedition',  re: /\bexpeditions?\b/i },
  { key: 'keelboat',    re: /\bkeelboats?\b/i },
  { key: 'portage',     re: /\bportages?\b/i },
  { key: 'interpreter', re: /\binterpreters?\b/i },
  { key: 'pirogue',     re: /\bpirogues?\b/i },
];

const COMBINED = new RegExp(PATTERNS.map((p) => `(?:${p.re.source})`).join('|'), 'gi');

function keyForMatch(matched) {
  const lower = matched.toLowerCase();
  if (lower.startsWith('expedition')) return 'expedition';
  if (lower.startsWith('keelboat')) return 'keelboat';
  if (lower.startsWith('portage')) return 'portage';
  if (lower.startsWith('interpreter')) return 'interpreter';
  if (lower.startsWith('pirogue')) return 'pirogue';
  return null;
}

export default function VocabText({ text, className }) {
  if (!text) return null;
  const nodes = [];
  const usedKeys = new Set();
  let last = 0;
  let m;
  COMBINED.lastIndex = 0;
  while ((m = COMBINED.exec(text)) !== null) {
    const matched = m[0];
    const key = keyForMatch(matched);
    // Only the first occurrence of each distinct term in this block is a bubble.
    if (key && !usedKeys.has(key)) {
      usedKeys.add(key);
      if (m.index > last) nodes.push(text.slice(last, m.index));
      nodes.push(<VocabBubble key={`${key}-${m.index}`} matched={matched} entry={VOCAB[key]} />);
      last = m.index + matched.length;
    }
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span className={className}>{nodes}</span>;
}

function VocabBubble({ matched, entry }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="vocab-wrap">
      <button
        type="button"
        className="vocab-term"
        aria-expanded={open}
        title={entry.def}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        {matched}
      </button>
      {open && (
        <span className="vocab-bubble" role="tooltip">
          <b>{entry.term}</b> — {entry.def}
          <button type="button" className="vocab-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>×</button>
        </span>
      )}
    </span>
  );
}
