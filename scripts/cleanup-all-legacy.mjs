#!/usr/bin/env node

/**
 * 清理所有遗留目录
 * 基于最新发现：所有 *-app 目录都没有实际源代码
 */

import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const legacyDirs = [
  'main-app',
  'agent-app',
  'dashboard-app',
  'cluster-app',
  'system-app',
  'image-build-app',
  'monitor-app',
  'shared'
];

async function cleanupAllLegacy() {
  console.log('\n🧹 清理所有遗留目录');
  console.log('=' .repeat(60));
  console.log('\n📋 待清理目录:');

  legacyDirs.forEach(dir => {
    const exists = existsSync(join(process.cwd(), dir));
    console.log(`  ${dir}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
  });

  console.log('\n⚠️  注意: 这些目录都不包含源代码，只有:');
  console.log('  - node_modules (依赖)');
  console.log('  - dist (构建产物)');
  console.log('  - 空的 src 目录结构');

  // 确认执行
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('\n确认删除所有遗留目录？(y/n): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ 清理已取消');
    return;
  }

  console.log('\n🔥 开始清理...\n');

  let successCount = 0;
  let failCount = 0;

  for (const dir of legacyDirs) {
    const fullPath = join(process.cwd(), dir);

    if (!existsSync(fullPath)) {
      console.log(`  ⏭️  ${dir} - 不存在，跳过`);
      continue;
    }

    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✅ ${dir} - 已删除`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ ${dir} - 删除失败: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 清理结果:');
  console.log(`  成功: ${successCount}`);
  console.log(`  失败: ${failCount}`);
  console.log(`  跳过: ${legacyDirs.length - successCount - failCount}`);

  if (successCount > 0) {
    console.log('\n✨ 清理完成！');
    console.log('\n💡 下一步:');
    console.log('  1. 更新 .gitignore 添加这些目录');
    console.log('  2. 更新 pnpm-workspace.yaml 移除引用');
    console.log('  3. 运行 pnpm install 刷新');
    console.log('  4. 运行 pnpm build 验证构建');
  }
}

// 执行
cleanupAllLegacy().catch(console.error);