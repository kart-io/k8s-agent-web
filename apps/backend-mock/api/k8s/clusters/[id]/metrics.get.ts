/**
 * 获取集群监控指标
 */
import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3';

import { generateClusterMetrics, mockClusters } from '../../_utils';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  const cluster = mockClusters.find((c) => c.id === id);

  if (!cluster) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: '集群不存在',
    };
  }

  const metrics = generateClusterMetrics();

  return {
    code: 0,
    data: metrics,
    message: 'success',
  };
});
