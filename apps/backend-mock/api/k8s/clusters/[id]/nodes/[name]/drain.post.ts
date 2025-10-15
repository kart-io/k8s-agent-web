/**
 * 驱逐节点 (Drain)
 * POST /api/k8s/clusters/:clusterId/nodes/:name/drain
 */
import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from 'h3';

import { mockNodes } from '../../../../_utils';

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name');
  const options = await readBody(event);

  // 查找节点
  const node = mockNodes.find((n) => n.metadata.name === name);

  if (!node) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: `节点 ${name} 不存在`,
    };
  }

  // 模拟驱逐操作延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 自动封锁节点
  if (!node.spec) {
    node.spec = {};
  }
  node.spec.unschedulable = true;

  return {
    code: 0,
    data: {
      success: true,
      message: `节点 ${name} 上的所有 Pod 已成功驱逐`,
    },
    message: 'success',
  };
});
