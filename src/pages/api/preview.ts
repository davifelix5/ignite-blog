import * as prismicNext from '@prismicio/next';
import { NextApiHandler } from 'next';
import { createClient, linkResolver } from '../../services/prismic';

const preview: NextApiHandler = async (req, res) => {
  const client = createClient({ req });

  await prismicNext.setPreviewData({ req, res });

  await prismicNext.redirectToPreviewURL({ req, res, client, linkResolver });
};

export default preview;
