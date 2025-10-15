/**
 * 获取 Node 列表
 * GET /api/k8s/clusters/:clusterId/nodes
 */
import { defineEventHandler, getQuery, getRouterParam } from 'h3';

import { mockNodes, paginate } from '../../../_utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  // 分页
  const { items, total } = paginate(mockNodes, page, pageSize);

  return {
    code: 0,
    data: {
      apiVersion: 'v1',
      kind: 'NodeList',
      metadata: {},
      items,
      total,
    },
    message: 'success',
  };
});
