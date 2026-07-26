// JournalPage.jsx — the journal-page unlock (build spec §3.2, §5): the money
// moment. One entry from `meta.journal[stepIndex]` (usCorpsOfDiscovery.js
// JOURNAL — real Lewis & Clark quotes, spelling preserved, with a kid-level
// gloss). Purely presentational, one-time, dismissible: MatchView tracks
// "already shown" locally and never re-shows a page once seen.
//
// The quote lives in an aged-paper inset INSIDE the illustration frame — never
// as the page's own background (Union Blue rule: no tan/parchment UI skin,
// Common Standards §2). The frame is the picture; the paper is a prop sitting
// on top of it, the way a document would sit in a display case.

import { Art } from '../../services/assets.jsx';

export default function JournalPage({ entry, onContinue }) {
  if (!entry) return null;
  return (
    <div className="journal-page">
      <div className="journal-kicker">📖 Journal unlocked</div>
      <div className="journal-frame">
        <Art name={entry.image} alt={entry.alt} className="journal-art" />
        <div className="journal-inset">
          <p className="journal-quote">&ldquo;{entry.quote}&rdquo;</p>
          <p className="journal-byline">{entry.author} · {entry.date} · {entry.place}</p>
        </div>
      </div>
      <p className="journal-gloss">{entry.gloss}</p>
      <button className="btn big" onClick={onContinue}>Continue</button>
    </div>
  );
}
