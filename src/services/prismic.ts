import * as Prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import { CreateClientConfig } from '@prismicio/next';

export const repoName = process.env.PRISMIC_REPO_NAME;

export const apiEndpoint = Prismic.getRepositoryEndpoint(repoName);

export function linkResolver(document) {
  if (document.type === 'post') {
    return `/post/${document.uid}`;
  }
  return '/';
}

export function createClient(config: CreateClientConfig = {}): Prismic.Client {
  const client = Prismic.createClient(apiEndpoint);

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  });

  return client;
}
