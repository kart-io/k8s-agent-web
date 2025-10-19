import { exec } from 'node:child_process';
import { promisify } from 'node:util';

/**
 * 获取集群选择器列表 - 真实 K8s 配置
 */
import { defineEventHandler } from 'h3';

const execAsync = promisify(exec);

export default defineEventHandler(async () => {
  try {
    // 获取当前 kubectl 上下文信息
    const { stdout: contextsOutput } = await execAsync(
      'kubectl config get-contexts -o name',
    );
    const contexts = contextsOutput.trim().split('\n').filter(Boolean);

    // 获取当前激活的上下文
    const { stdout: currentOutput } = await execAsync(
      'kubectl config current-context',
    );
    const currentContext = currentOutput.trim();

    // 为每个上下文创建集群选项
    const options = contexts.map((context) => ({
      label: context,
      value: context,
      id: context,
      name: context,
      // 标记当前激活的集群
      active: context === currentContext,
    }));

    return {
      code: 0,
      data: options,
      message: 'success',
    };
  } catch (error: any) {
    console.error('[K8s API] Error fetching cluster options:', error);

    // 如果 kubectl 命令失败，返回默认的集群选项
    return {
      code: 0,
      data: [
        {
          label: 'minikube',
          value: 'minikube',
          id: 'minikube',
          name: 'minikube',
          active: true,
        },
      ],
      message: 'success (using default)',
    };
  }
});
