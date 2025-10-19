/**
 * 获取 Pod 列表
 */
import { defineEventHandler, getQuery } from 'h3';

import { filterByKeyword, mockPods, paginate } from '../_utils';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const namespace = query.namespace as string;
  const keyword = (query.keyword as string) || '';

  // 过滤数据
  let filteredPods = [...mockPods];

  if (namespace && namespace !== 'all') {
    filteredPods = filteredPods.filter(
      (p) => p.metadata.namespace === namespace,
    );
  }

  if (keyword) {
    filteredPods = filterByKeyword(filteredPods, keyword, [
      'metadata.name',
      'metadata.namespace',
    ]);
  }

  // 分页
  const result = paginate(filteredPods, page, pageSize);

  return {
    code: 0,
    data: {
      apiVersion: 'v1',
      kind: 'PodList',
      metadata: {},
      ...result,
    },
    message: 'success',
  };
});
