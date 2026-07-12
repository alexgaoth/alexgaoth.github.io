// Single source of truth for "now" data.
// Both HomePreviewRail (static preview) and NowPage (fallback) import from here.
// profile.json fetched at runtime can override NowPage's display, but this is the fallback.

export const NOW_FALLBACK = {
  date: "may 16, 2026",
  location: "la jolla, california",
  why: "home for summer · sdx @ ucsd",
  tz: "pdt",
  tzIana: "America/Los_Angeles",
  building: [
    { name: "signalor.app", detail: "v0.3 · google analytics for brands · in production", tag: "live" },
    { name: "sdx @ ucsd", detail: "design-engineering club · 3 brand pitches this week", tag: "wip" },
    { name: "this very site", detail: "preview rail redesign · the page you are on", tag: "wip" },
  ],
  learning: [
    { name: "rust", detail: "borrow checker, finally" },
    { name: "தமிழ் / tamil", detail: "reading aloud, slowly" },
    { name: "writing more clearly", detail: "fewer words, harder meaning" },
  ],
  consuming: [
    { kind: "sound", val: "soldier of heaven — sabaton", meta: "on repeat" },
    { kind: "read",  val: "the undiscovered self — c.g. jung", meta: "ch. 4 of 7" },
    { kind: "watch", val: "xavier: renegade angel", meta: "s2" },
    { kind: "play",  val: "none actually", meta: "—" },
  ],
  writing: [
    { state: "wip",  val: "a note on metaphor as compression" },
    { state: "open", val: "the politics of attention" },
    { state: "stuck", val: "a story about the fall of nineveh" },
  ],
  quickThoughts: [
    {
      thought: "the borrow checker is just the compiler asking you to think about ownership explicitly. it's not hard, it's unfamiliar.",
      date: "may 15, 2026",
    },
    {
      thought: "every abstraction is a lie that happens to be useful.",
      date: "may 12, 2026",
    },
  ],
};

// Flat format consumed by HomePreviewRail, derived from NOW_FALLBACK so the two stay in sync.
export const NOWDATA = {
  building: NOW_FALLBACK.building.map(b => b.name),
  learning: NOW_FALLBACK.learning.map(l => l.name),
  consuming: NOW_FALLBACK.consuming,
  writing:   NOW_FALLBACK.writing,
  location:  [NOW_FALLBACK.location, NOW_FALLBACK.why],
  thisWeek: [
    { day: "mon", val: "signalor v0.3.2 shipped",          tag: "+340 −120" },
    { day: "tue", val: "sdx pitches · 3 brands",            tag: "4 hrs" },
    { day: "wed", val: "jung — finished chapter 4",          tag: "read" },
    { day: "thu", val: "this site preview rail redesign",    tag: "wip" },
    { day: "fri", val: "open",                               tag: "—" },
  ],
};
