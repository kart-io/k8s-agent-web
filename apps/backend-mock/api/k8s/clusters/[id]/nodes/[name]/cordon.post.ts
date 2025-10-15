/**
 * 封锁节点 (Cordon)
 * POST /api/k8s/clusters/:clusterId/nodes/:name/cordon
 */
import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3';

import { mockNodes } from '../../../../_utils';

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name');

  // 查找节点
  const node = mockNodes.find((n) => n.metadata.name === name);

  if (!node) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: `节点 ${name} 不存在`,
    };
  }

  // 标记为不可调度
  if (!node.spec) {
    node.spec = {};
  }
  node.spec.unschedulable = true;

  return {
    code: 0,
    data: node,
    message: `节点 ${name} 已封锁`,
  };
});
