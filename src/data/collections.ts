import { getCollection } from 'astro:content';

export async function loadHomeCollections() {
  const recentPosts = (await getCollection('post', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 3);

  const recentProjects = (await getCollection('projects', ({ data }) => !data.draft))
    .sort((a, b) => (b.data.endDate?.valueOf() ?? 0) - (a.data.endDate?.valueOf() ?? 0));

  const recentPublications = (await getCollection('publication'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 3);

  return { recentPosts, recentProjects, recentPublications };
}
