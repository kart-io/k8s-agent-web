import { exec } from 'node:child_process';
import { promisify } from 'node:util';

/**
 * 获取 Deployment 列表 - 真实 K8s API 版本
 */
import { defineEventHandler, getQuery } from 'h3';

const execAsync = promisify(exec);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const namespace = (query.namespace as string) || 'default';

  try {
    // 使用 kubectl 获取真实的 Deployment 数据
    const { stdout } = await execAsync(
      `kubectl get deployments -n ${namespace} -o json`,
    );

    const data = JSON.parse(stdout);
    const items = data.items || [];

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);

    return {
      code: 0,
      data: {
        apiVersion: 'apps/v1',
        kind: 'DeploymentList',
        metadata: {},
        items: paginatedItems,
        total: items.length,
      },
      message: 'success',
    };
  } catch (error: any) {
    console.error('[K8s API] Error fetching deployments:', error);
    return {
      code: -1,
      data: null,
      message: `Failed to fetch deployments: ${error.message}`,
    };
  }
});
