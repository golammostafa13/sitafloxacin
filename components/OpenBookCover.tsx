"use client";

import { OPEN_BOOK_EVENT } from "./ReadButton";

/** Makes the article cover tappable: it opens the reader with the book-opening animation. */
export default function OpenBookCover({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_BOOK_EVENT))} aria-label={label} className="block w-full cursor-pointer rounded-lg [perspective:1200px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint">
      {children}
    </button>
  );
}
