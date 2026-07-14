// Serves /profile.json from the repo-root copy — the one Alex edits from
// mobile (a commit that also triggers this rebuild, so it can't go stale).
// Post-cutover this retires main-section/public/profile.json: one canonical
// copy instead of three (SEO-PLAN Phase 3 "now data cleanup").
import profile from '../../../profile.json';

export function GET() {
  return new Response(JSON.stringify(profile, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
