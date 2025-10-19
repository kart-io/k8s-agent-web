/**
 * K8s 资源操作通用 Composable
 * 处理资源的 CRUD 操作、确认对话框等通用逻辑
 */

import type { ResourceActionConfig } from '#/types/k8s-resource-base';

import { message, Modal } from 'ant-design-vue';

export interface UseResourceActionsOptions {
  /** 资源类型标识 */
  resourceType: string;
  /** 资源显示名称 */
  resourceLabel: string;
  /** 重新加载回调 */
  onReload?: () => void;
}

export function useResourceActions(options: UseResourceActionsOptions) {
  const { resourceType: _resourceType, resourceLabel, onReload } = options;

  /**
   * 查看资源详情
   */
  function handleView(row: any, content?: string) {
    const defaultContent = content || generateDefaultViewContent(row);

    Modal.info({
      title: `${resourceLabel} 详情`,
      width: 700,
      content: defaultContent,
    });
  }

  /**
   * 生成默认的详情内容
   */
  function generateDefaultViewContent(row: any): string {
    const lines: string[] = [];

    if (row.metadata) {
      lines.push(`名称: ${row.metadata.name || '-'}`);
      if (row.metadata.namespace) {
        lines.push(`命名空间: ${row.metadata.namespace}`);
      }
      if (row.metadata.creationTimestamp) {
        lines.push(`创建时间: ${row.metadata.creationTimestamp}`);
      }
    }

    if (row.status) {
      lines.push(`状态: ${JSON.stringify(row.status, null, 2)}`);
    }

    return lines.join('\n');
  }

  /**
   * 编辑资源
   */
  function handleEdit(row: any, callback?: (row: any) => void) {
    if (callback) {
      callback(row);
    } else {
      message.info(`编辑 ${resourceLabel} "${row.metadata.name}" (功能开发中)`);
    }
  }

  /**
   * 删除资源
   */
  function handleDelete(row: any, callback?: (row: any) => Promise<void>) {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${resourceLabel} "${row.metadata.name}" 吗？此操作不可恢复。`,
      async onOk() {
        try {
          if (callback) {
            await callback(row);
          } else {
            // 默认处理
            message.success(`${resourceLabel} "${row.metadata.name}" 删除成功`);
          }
          onReload?.();
        } catch (error: any) {
          message.error(`删除失败: ${error.message}`);
        }
      },
    });
  }

  /**
   * 扩缩容（仅适用于 Deployment、StatefulSet 等）
   */
  function handleScale(
    row: any,
    callback?: (row: any, replicas: number) => Promise<void>,
  ) {
    const currentReplicas = row.spec?.replicas || 0;

    Modal.confirm({
      title: '扩缩容',
      content: `当前副本数: ${currentReplicas}。请在功能完善后输入新的副本数。`,
      async onOk() {
        try {
          if (callback) {
            // TODO: 实际应该有一个输入框让用户输入新的副本数
            await callback(row, currentReplicas);
          } else {
            message.info(
              `扩缩容 ${resourceLabel} "${row.metadata.name}" (功能开发中)`,
            );
          }
          onReload?.();
        } catch (error: any) {
          message.error(`扩缩容失败: ${error.message}`);
        }
      },
    });
  }

  /**
   * 重启（仅适用于 Deployment、StatefulSet 等）
   */
  function handleRestart(row: any, callback?: (row: any) => Promise<void>) {
    Modal.confirm({
      title: '确认重启',
      content: `确定要重启 ${resourceLabel} "${row.metadata.name}" 吗？`,
      async onOk() {
        try {
          if (callback) {
            await callback(row);
          } else {
            message.success(`${resourceLabel} "${row.metadata.name}" 重启成功`);
          }
          onReload?.();
        } catch (error: any) {
          message.error(`重启失败: ${error.message}`);
        }
      },
    });
  }

  /**
   * 查看日志（仅适用于 Pod）
   */
  function handleLogs(row: any, callback?: (row: any) => void) {
    if (callback) {
      callback(row);
    } else {
      message.info(
        `查看 ${resourceLabel} "${row.metadata.name}" 日志 (功能开发中)`,
      );
    }
  }

  /**
   * 进入容器（仅适用于 Pod）
   */
  function handleExec(row: any, callback?: (row: any) => void) {
    if (callback) {
      callback(row);
    } else {
      message.info(
        `进入 ${resourceLabel} "${row.metadata.name}" 容器 (功能开发中)`,
      );
    }
  }

  /**
   * 创建资源
   */
  function handleCreate(callback?: () => void) {
    if (callback) {
      callback();
    } else {
      message.info(`创建 ${resourceLabel} (功能开发中)`);
    }
  }

  /**
   * 批量删除
   */
  function handleBatchDelete(
    rows: any[],
    callback?: (rows: any[]) => Promise<void>,
  ) {
    if (!rows || rows.length === 0) {
      message.warning('请选择要删除的资源');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${rows.length} 个 ${resourceLabel} 吗？此操作不可恢复。`,
      async onOk() {
        try {
          if (callback) {
            await callback(rows);
          } else {
            message.success(`已删除 ${rows.length} 个 ${resourceLabel}`);
          }
          onReload?.();
        } catch (error: any) {
          message.error(`批量删除失败: ${error.message}`);
        }
      },
    });
  }

  /**
   * 根据操作配置创建操作处理器
   */
  function createActionHandler(action: ResourceActionConfig) {
    return (row: any) => {
      if (action.show && !action.show(row)) {
        return;
      }
      action.handler(row);
    };
  }

  return {
    // 单个资源操作
    handleView,
    handleEdit,
    handleDelete,
    handleScale,
    handleRestart,
    handleLogs,
    handleExec,
    handleCreate,

    // 批量操作
    handleBatchDelete,

    // 工具函数
    createActionHandler,
  };
}
