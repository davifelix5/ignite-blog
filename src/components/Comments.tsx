import { useUtterances } from '../hooks/useUtternaces';

const commentNodeId = 'utternaces-commnets';

export default function Comments() {
  useUtterances(commentNodeId);

  return <div id={commentNodeId} />;
}
