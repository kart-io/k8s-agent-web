/**
 * 删除集群
 */
import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3';

import { mockClusters } from '../_utils';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  const index = mockClusters.findIndex((c) => c.id === id);

  if (index === -1) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: '集群不存在',
    };
  }

  mockClusters.splice(index, 1);

  return {
    code: 0,
    message: 'success',
  };
});
