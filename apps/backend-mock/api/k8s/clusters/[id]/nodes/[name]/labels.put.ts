/**
 * 更新节点标签
 * PUT /api/k8s/clusters/:clusterId/nodes/:name/labels
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
  const { labels } = body;

  // 查找节点
  const node = mockNodes.find((n) => n.metadata.name === name);

  if (!node) {
    setResponseStatus(event, 404);
    return {
      code: 404,
      message: `节点 ${name} 不存在`,
    };
  }

  // 保留系统标签
  const systemLabels = {
    'kubernetes.io/hostname': node.metadata.labels?.['kubernetes.io/hostname'],
    'node-role.kubernetes.io/worker':
      node.metadata.labels?.['node-role.kubernetes.io/worker'],
  };

  // 更新标签
  node.metadata.labels = {
    ...systemLabels,
    ...labels,
  };

  return {
    code: 0,
    data: node,
    message: `节点 ${name} 的标签已更新`,
  };
});
