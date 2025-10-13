#!/usr/bin/env node

/**
 * 应用迁移脚本
 * 单一职责：仅执行目录的物理迁移，不做任何其他操作
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 执行单个应用的迁移
 * @param {string} from - 源目录
 * @param {string} to - 目标目录
 * @returns {Object} 迁移结果
 */
export function migrateApp(from, to) {
  const fromPath = join(process.cwd(), from);
  const toPath = join(process.cwd(), to);

  // 检查源目录是否存在
  if (!existsSync(fromPath)) {
    return {
      from,
      to,
      success: false,
      error: `源目录不存在: ${from}`
    };
  }

  // 检查目标目录是否已存在
  if (existsSync(toPath)) {
    return {
      from,
      to,
      success: false,
      error: `目标目录已存在: ${to}`
    };
  }

  try {
    // 使用 git mv 保留历史记录
    console.log(`📦 迁移: ${from} → ${to}`);
    execSync(`git mv "${from}" "${to}"`, { stdio: 'inherit' });

    return {
      from,
      to,
      success: true,
      message: '迁移成功'
    };
  } catch (error) {
    return {
      from,
      to,
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量迁移应用
 * @param {Array} migrations - 迁移配置数组
 * @returns {Array} 迁移结果数组
 */
export function migrateApps(migrations) {
  console.log('\n🚀 开始迁移应用目录...\n');

  const results = migrations.map(({ from, to }) => {
    const result = migrateApp(from, to);

    if (result.success) {
      console.log(`✅ ${result.message}\n`);
    } else {
      console.error(`❌ 失败: ${result.error}\n`);
    }

    return result;
  });

  // 统计结果
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('📊 迁移统计:');
  console.log(`  成功: ${successful}`);
  console.log(`  失败: ${failed}`);
  console.log();

  return results;
}

// 主函数：如果直接运行此脚本
async function main() {
  // 基于审计结果，只需要迁移 image-build-app
  const migrations = [
    {
      from: 'image-build-app',
      to: 'apps/image-build'
    }
  ];

  console.log('📋 迁移计划:');
  migrations.forEach(m => {
    console.log(`  - ${m.from} → ${m.to}`);
  });
  console.log();

  // 确认执行
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('确认执行迁移？(y/n): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ 迁移已取消');
    process.exit(0);
  }

  // 执行迁移
  const results = migrateApps(migrations);

  // 如果所有迁移成功，提示下一步
  if (results.every(r => r.success)) {
    console.log('✨ 所有迁移完成！');
    console.log('\n💡 下一步:');
    console.log('  1. 运行 update-workspace.mjs 更新配置');
    console.log('  2. 运行 cleanup-dirs.mjs 清理空目录');
    console.log('  3. 验证构建是否正常');
  }
}

// 判断是否直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}