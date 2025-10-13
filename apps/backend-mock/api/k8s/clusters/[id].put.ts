/**
 * 更新集群
 */
import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from 'h3';

import { mockClusters } from '../_utils';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const index = mockClusters.findIndex((c) => c.id === id);

  if (index === -1) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: '集群不存在',
    };
  }

  mockClusters[index] = {
    ...mockClusters[index],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  };

  return {
    code: 0,
    data: mockClusters[index],
    message: 'success',
  };
});
