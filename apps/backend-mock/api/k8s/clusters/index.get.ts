/**
 * 获取集群列表
 */
import { defineEventHandler, getQuery } from 'h3';

import { filterByKeyword, initMockData, mockClusters, paginate } from '../_utils';

// 初始化数据（仅在首次加载时）
if (mockClusters.length === 0) {
  initMockData();
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const keyword = (query.keyword as string) || '';
  const status = query.status as string;

  // 过滤数据
  let filteredClusters = [...mockClusters];

  if (keyword) {
    filteredClusters = filterByKeyword(filteredClusters, keyword, [
      'name',
      'description',
      'apiServer',
    ]);
  }

  if (status) {
    filteredClusters = filteredClusters.filter((c) => c.status === status);
  }

  // 分页
  const result = paginate(filteredClusters, page, pageSize);

  return {
    code: 0,
    data: result,
    message: 'success',
  };
});
