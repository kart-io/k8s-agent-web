import { exec } from 'node:child_process';
import { promisify } from 'node:util';

/**
 * 获取集群列表 - 真实 K8s 配置
 */
import { defineEventHandler, getQuery } from 'h3';

const execAsync = promisify(exec);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  try {
    // 获取所有 kubectl 上下文
    const { stdout: contextsOutput } = await execAsync(
      'kubectl config get-contexts -o name',
    );
    const contexts = contextsOutput.trim().split('\n').filter(Boolean);

    // 获取当前激活的上下文
    const { stdout: currentOutput } = await execAsync(
      'kubectl config current-context',
    );
    const currentContext = currentOutput.trim();

    // 为每个上下文创建集群对象
    const clusters = await Promise.all(
      contexts.map(async (context) => {
        const isActive = context === currentContext;

        // 尝试获取集群信息（仅对当前激活的集群）
        let nodeCount = 0;
        let podCount = 0;
        let namespaceCount = 0;
        let version = 'Unknown';
        let status = 'unknown';

        if (isActive) {
          try {
            // 获取节点数量
            const { stdout: nodesOutput } = await execAsync(
              'kubectl get nodes --no-headers 2>/dev/null | wc -l',
            );
            nodeCount = Number.parseInt(nodesOutput.trim(), 10) || 0;

            // 获取 Pod 数量（所有命名空间）
            const { stdout: podsOutput } = await execAsync(
              'kubectl get pods -A --no-headers 2>/dev/null | wc -l',
            );
            podCount = Number.parseInt(podsOutput.trim(), 10) || 0;

            // 获取命名空间数量
            const { stdout: nsOutput } = await execAsync(
              'kubectl get namespaces --no-headers 2>/dev/null | wc -l',
            );
            namespaceCount = Number.parseInt(nsOutput.trim(), 10) || 0;

            // 获取 K8s 版本
            const { stdout: versionOutput } = await execAsync(
              'kubectl version --short 2>/dev/null | grep "Server Version" || echo "Unknown"',
            );
            const versionMatch = versionOutput.match(/v\d+\.\d+\.\d+/);
            version = versionMatch ? versionMatch[0] : 'Unknown';

            status = nodeCount > 0 ? 'healthy' : 'unknown';
          } catch (error) {
            console.error(`Error getting cluster info for ${context}:`, error);
          }
        }

        return {
          id: context,
          name: context,
          description: isActive ? 'Active cluster' : 'Available cluster',
          apiServer: `kubectl context: ${context}`,
          version,
          status,
          nodeCount,
          podCount,
          namespaceCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          kubeconfig: context,
        };
      }),
    );

    // 分页
    const total = clusters.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedClusters = clusters.slice(start, end);

    return {
      code: 0,
      data: {
        items: paginatedClusters,
        total,
      },
      message: 'success',
    };
  } catch (error: any) {
    console.error('[K8s API] Error fetching clusters:', error);
    return {
      code: -1,
      data: { items: [], total: 0 },
      message: `Failed to fetch clusters: ${error.message}`,
    };
  }
});
