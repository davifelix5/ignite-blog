import { NextApiHandler } from 'next';
import * as prismicNext from '@prismicio/next';

const exitPreview: NextApiHandler = async (req, res) => {
  prismicNext.exitPreview({ req, res });
};

export default exitPreview;
