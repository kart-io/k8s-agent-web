/**
 * 解除封锁节点 (Uncordon)
 * POST /api/k8s/clusters/:clusterId/nodes/:name/uncordon
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

  // 恢复可调度状态
  if (node.spec) {
    node.spec.unschedulable = false;
  }

  return {
    code: 0,
    data: node,
    message: `节点 ${name} 已解除封锁`,
  };
});
