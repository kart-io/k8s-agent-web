/**
 * 创建集群
 */
import { defineEventHandler, readBody } from 'h3';

import { generateCluster, mockClusters } from '../_utils';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const newCluster = {
    ...generateCluster(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockClusters.push(newCluster);

  return {
    code: 0,
    data: newCluster,
    message: 'success',
  };
});
