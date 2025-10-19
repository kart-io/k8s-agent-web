#!/usr/bin/env node

/**
 * 工作空间配置更新脚本
 * 单一职责：仅更新 pnpm-workspace.yaml 配置文件
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 更新 pnpm-workspace.yaml 配置
 * @param {Array} removePaths - 要移除的路径
 * @param {Array} addPaths - 要添加的路径（如果不存在）
 * @returns {object} 更新结果
 */
export function updateWorkspaceConfig(removePaths = [], addPaths = []) {
  const configPath = join(process.cwd(), 'pnpm-workspace.yaml');

  try {
    // 读取现有配置
    const content = readFileSync(configPath, 'utf8');
    const lines = content.split('\n');

    // 标记需要移除的行
    const updatedLines = lines
      .map((line) => {
        // 检查是否是需要移除的路径
        for (const path of removePaths) {
          if (line.includes(`- ${path}`)) {
            console.log(`  🗑️  移除: ${line.trim()}`);
            return null; // 标记为删除
          }
        }
        return line;
      })
      .filter((line) => line !== null); // 过滤掉标记为删除的行

    // 添加新路径（如果需要）
    // 注意：apps/* 通常已经存在，所以这里主要是确认
    const modified = lines.length !== updatedLines.length;

    // 保存更新后的配置
    if (modified) {
      writeFileSync(configPath, updatedLines.join('\n'));
      console.log('✅ pnpm-workspace.yaml 已更新');
    } else {
      console.log('ℹ️  pnpm-workspace.yaml 无需更新');
    }

    return {
      success: true,
      modified,
      removedCount: lines.length - updatedLines.length,
    };
  } catch (error) {
    console.error(`❌ 更新失败: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 更新应用的 package.json
 * @param {string} appPath - 应用路径
 * @returns {object} 更新结果
 */
export function updatePackageJson(appPath) {
  const packagePath = join(process.cwd(), appPath, 'package.json');

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const oldName = packageJson.name;

    // 更新包名（移除 -app 后缀）
    if (packageJson.name && packageJson.name.includes('-app')) {
      packageJson.name = packageJson.name.replace('-app', '');
      writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
      console.log(`  📝 更新包名: ${oldName} → ${packageJson.name}`);
      return { success: true, oldName, newName: packageJson.name };
    }

    return { success: true, message: '包名无需更新' };
  } catch (error) {
    // 如果没有 package.json 文件，这不是错误
    if (error.code === 'ENOENT') {
      console.log(`  ℹ️  ${appPath} 没有 package.json`);
      return { success: true, noPackageJson: true };
    }

    console.error(`  ❌ 更新失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 主函数：如果直接运行此脚本
async function main() {
  console.log('\n📋 更新工作空间配置...\n');

  // 基于审计结果的配置
  const removePaths = [
    'image-build-app', // 已迁移
    'agent-app', // 空目录
    'dashboard-app', // 空目录
    'cluster-app', // 空目录
    'monitor-app', // 空目录
    'shared', // 无用目录
  ];

  console.log('将从 pnpm-workspace.yaml 移除以下路径:');
  removePaths.forEach((p) => console.log(`  - ${p}`));
  console.log();

  // 更新 workspace 配置
  const result = updateWorkspaceConfig(removePaths, []);

  if (result.success) {
    console.log(`\n📊 更新统计:`);
    console.log(`  移除了 ${result.removedCount} 个路径`);

    // 更新已迁移应用的 package.json
    console.log('\n📦 更新应用配置:');
    updatePackageJson('apps/image-build');

    console.log('\n✨ 配置更新完成！');
    console.log('\n💡 下一步:');
    console.log('  1. 运行 cleanup-dirs.mjs 清理空目录');
    console.log('  2. 运行 pnpm install 刷新依赖');
    console.log('  3. 运行 pnpm build 验证构建');
  }
}

// 判断是否直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
