#!/usr/bin/env node

/**
 * 目录清理脚本
 * 单一职责：仅删除空目录和无用目录
 */

import { rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

/**
 * 检查目录是否为空或只包含临时文件
 * @param {string} dir - 目录路径
 * @returns {Object} 检查结果
 */
export function checkDirectory(dir) {
  const fullPath = join(process.cwd(), dir);

  if (!existsSync(fullPath)) {
    return {
      exists: false,
      empty: false,
      canDelete: false,
      reason: '目录不存在'
    };
  }

  const files = readdirSync(fullPath);

  // 完全空目录
  if (files.length === 0) {
    return {
      exists: true,
      empty: true,
      canDelete: true,
      reason: '空目录'
    };
  }

  // 只包含 node_modules
  if (files.length === 1 && files[0] === 'node_modules') {
    return {
      exists: true,
      empty: false,
      canDelete: true,
      reason: '仅包含 node_modules'
    };
  }

  // 只包含 dist 和/或 node_modules
  const tempOnly = files.every(f => ['node_modules', 'dist', '.DS_Store'].includes(f));
  if (tempOnly) {
    return {
      exists: true,
      empty: false,
      canDelete: true,
      reason: '仅包含临时文件'
    };
  }

  return {
    exists: true,
    empty: false,
    canDelete: false,
    reason: '包含源文件',
    files
  };
}

/**
 * 删除目录
 * @param {string} dir - 目录路径
 * @returns {Object} 删除结果
 */
export function deleteDirectory(dir) {
  const fullPath = join(process.cwd(), dir);
  const check = checkDirectory(dir);

  if (!check.exists) {
    return {
      success: true,
      message: '目录不存在，无需删除'
    };
  }

  if (!check.canDelete) {
    return {
      success: false,
      error: `不能删除：${check.reason}`
    };
  }

  try {
    console.log(`  🗑️  删除 ${dir} (${check.reason})`);

    // 使用 git rm 如果目录在 git 中
    try {
      execSync(`git ls-files "${dir}" --error-unmatch 2>/dev/null`, { stdio: 'pipe' });
      // 如果目录在 git 中，使用 git rm
      execSync(`git rm -rf "${dir}"`, { stdio: 'inherit' });
    } catch {
      // 目录不在 git 中，直接删除
      rmSync(fullPath, { recursive: true, force: true });
    }

    return {
      success: true,
      message: `已删除 ${dir}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量清理目录
 * @param {Array} dirs - 目录列表
 * @returns {Array} 清理结果
 */
export function cleanupDirectories(dirs) {
  console.log('\n🧹 开始清理目录...\n');

  const results = dirs.map(dir => {
    const result = deleteDirectory(dir);

    if (result.success) {
      console.log(`  ✅ ${result.message}`);
    } else {
      console.error(`  ❌ ${dir}: ${result.error}`);
    }

    return { dir, ...result };
  });

  // 统计结果
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 清理统计:');
  console.log(`  成功: ${successful}`);
  console.log(`  失败: ${failed}`);

  return results;
}

// 主函数：如果直接运行此脚本
async function main() {
  console.log('\n🔍 检查待清理目录...\n');

  // 基于审计结果的清理列表
  const dirsToClean = [
    'agent-app',
    'dashboard-app',
    'cluster-app',
    'monitor-app',
    'shared',
    // 暂时保留 main-app 和 system-app（包含 dist）
  ];

  // 先检查每个目录
  console.log('目录状态:');
  const checks = dirsToClean.map(dir => {
    const check = checkDirectory(dir);
    console.log(`  ${dir}: ${check.canDelete ? '✅ 可删除' : '❌ 不可删除'} (${check.reason})`);
    return { dir, ...check };
  });

  const deletable = checks.filter(c => c.canDelete);

  if (deletable.length === 0) {
    console.log('\n没有需要清理的目录');
    return;
  }

  console.log(`\n将删除 ${deletable.length} 个目录`);

  // 确认执行
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('确认删除？(y/n): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ 清理已取消');
    process.exit(0);
  }

  // 执行清理
  const results = cleanupDirectories(deletable.map(d => d.dir));

  if (results.every(r => r.success)) {
    console.log('\n✨ 清理完成！');
    console.log('\n💡 下一步:');
    console.log('  1. 更新 .gitignore 文件');
    console.log('  2. 运行 pnpm build 验证构建');
    console.log('  3. 提交更改');
  }
}

// 判断是否直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}