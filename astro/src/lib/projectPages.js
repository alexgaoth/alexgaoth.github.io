// Project groups: several content.js cards folded into one card on
// /projects, each group with its own subpage at /projects/<slug>. Member
// cards carry `group: <slug>`; the group's own copy lives in
// content.projects.groups.
import { content } from '../data/content.js';

export { projectSlug } from './slug.js';

export function getProjectGroups() {
  return (content.projects.groups || []).map((group) => ({
    ...group,
    members: content.projects.content.filter((p) => p.group === group.slug),
  }));
}
