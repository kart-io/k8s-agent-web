/**
 * 更新节点污点
 * PUT /api/k8s/clusters/:clusterId/nodes/:name/taints
 */
import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseStatus,
} from 'h3';

import { mockNodes } from '../../../../_utils';

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name');
  const body = await readBody(event);
  const { taints } = body;

  // 查找节点
  const node = mockNodes.find((n) => n.metadata.name === name);

  if (!node) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: `节点 ${name} 不存在`,
    };
  }

  // 更新污点
  if (!node.spec) {
    node.spec = {};
  }
  node.spec.taints = taints;

  return {
    code: 0,
    data: node,
    message: `节点 ${name} 的污点已更新`,
  };
});
