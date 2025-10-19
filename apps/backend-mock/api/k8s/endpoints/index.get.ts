/**
 * GET /api/k8s/endpoints
 * 获取 Endpoints 列表
 */
import { defineEventHandler, getQuery } from 'h3';

import { filterByKeyword, mockEndpoints, paginate } from '../_utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const namespace = query.namespace as string;
  const keyword = (query.keyword as string) || '';

  // 过滤数据
  let filteredEndpoints = [...mockEndpoints];

  if (namespace && namespace !== 'all') {
    filteredEndpoints = filteredEndpoints.filter(
      (e) => e.namespace === namespace,
    );
  }

  if (keyword) {
    filteredEndpoints = filterByKeyword(filteredEndpoints, keyword, [
      'name',
      'namespace',
    ]);
  }

  // 分页
  const result = paginate(filteredEndpoints, page, pageSize);

  return {
    code: 0,
    data: {
      ...result,
    },
    message: 'success',
  };
});
