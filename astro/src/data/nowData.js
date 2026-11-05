// Single source of truth for "now" data.
// Both HomePreviewRail (static preview) and NowPage (fallback) import from here.
// profile.json fetched at runtime can override NowPage's display, but this is the fallback.

export const NOW_FALLBACK = {
  date: "nov 3, 2026",
  location: "san francisco, california",
  why: "mts intern · hypercubic (yc f25)",
  tz: "pdt",
  tzIana: "America/Los_Angeles",
  building: [
    { name: "awesome-reverse-engineered", detail: "17k reverse-engineered tools · search site, skill, mcp · nightly refresh", tag: "live" },
    { name: "oats", detail: "on-device conversation map · mac app", tag: "live" },
    { name: "signalor.app", detail: "consumer sentiment data for investors · yc w27 applied", tag: "live" },
    { name: "sublationism.com", detail: "the manifesto, formerly gaoism · formal reading in lean 4", tag: "wip" },
  ],
  learning: [
    { name: "rust", detail: "ferrodoc shipped; still learning" },
    { name: "தமிழ் / tamil", detail: "" },
    { name: "speaking better", detail: "" },
  ],
  consuming: [
    { kind: "sound", val: "soldier of heaven — sabaton", meta: "on repeat" },
    { kind: "read", val: "the undiscovered self — c.g. jung", meta: "ch. 4 of 7" },
    { kind: "watch", val: "xavier: renegade angel", meta: "s2" },
    { kind: "play", val: "EU4", meta: "full achievement soon" },
  ],
  writing: [
    { state: "shipped", val: "sublationism manifesto (was: ethics for the future / gaoism)" },
    { state: "wip", val: "sublationism in lean 4 — the mathematical decomposition of hegel, in practice" },
    { state: "stuck", val: "a story about the fall of nineveh" },
  ],
  quickThoughts: [
    { thought: "life is just a matter of playing a bunch of games. you need to play a game, but you can choose which one you partake in.", date: "aug 2026" },
    { thought: "one must essentially think that they're onto something most of the time to actually be onto something.", date: "aug 2026" },
    { thought: "the borrow checker is just the compiler asking you to think about ownership explicitly. it's not hard, it's unfamiliar.", date: "may 15, 2026" },
    { thought: "every abstraction is a lie that happens to be useful.", date: "may 12, 2026" },
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
