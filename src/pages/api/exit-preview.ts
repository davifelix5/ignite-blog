import { NextApiHandler } from 'next';

const exitPreview: NextApiHandler = async (req, res) => {
  res.clearPreviewData();
  res.writeHead(307, { location: '/' });
  res.end();
};

export default exitPreview;
