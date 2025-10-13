#!/usr/bin/env node

/**
 * 迁移流程编排脚本
 * 单一职责：仅负责编排各个独立脚本的执行顺序
 */

import { generateAuditReport } from './audit-apps.mjs';
import { migrateApps } from './migrate-apps.mjs';
import { updateWorkspaceConfig, updatePackageJson } from './update-workspace.mjs';
import { cleanupDirectories } from './cleanup-dirs.mjs';

/**
 * 执行完整的迁移流程
 * @returns {Object} 执行结果
 */
export async function orchestrateMigration() {
  console.log('\n🎯 开始执行架构优化流程\n');
  console.log('=' .repeat(60));

  const results = {
    audit: null,
    migration: null,
    config: null,
    cleanup: null,
    success: true
  };

  try {
    // 步骤 1: 审计
    console.log('\n📋 步骤 1/4: 审计应用目录');
    console.log('-'.repeat(40));
    const auditReport = generateAuditReport();
    results.audit = auditReport;

    console.log(`  发现 ${auditReport.summary.total} 个目录`);
    console.log(`  需迁移: ${auditReport.summary.toMigrate} 个`);
    console.log(`  可删除: ${auditReport.summary.toDelete} 个`);

    // 步骤 2: 迁移
    const toMigrate = auditReport.results
      .filter(app => app.action === 'migrate')
      .map(app => ({
        from: app.appDir,
        to: `apps/${app.appDir.replace('-app', '')}`
      }));

    if (toMigrate.length > 0) {
      console.log('\n📦 步骤 2/4: 迁移应用');
      console.log('-'.repeat(40));
      const migrationResults = migrateApps(toMigrate);
      results.migration = migrationResults;

      if (!migrationResults.every(r => r.success)) {
        throw new Error('部分迁移失败');
      }
    } else {
      console.log('\n⏭️  步骤 2/4: 跳过（无需迁移）');
      results.migration = [];
    }

    // 步骤 3: 更新配置
    console.log('\n⚙️  步骤 3/4: 更新配置');
    console.log('-'.repeat(40));

    // 准备要移除的路径
    const pathsToRemove = [
      ...toMigrate.map(m => m.from),
      ...auditReport.results
        .filter(app => app.action === 'delete')
        .map(app => app.appDir),
      'shared'  // 额外的无用目录
    ];

    const configResult = updateWorkspaceConfig(pathsToRemove, []);
    results.config = configResult;

    // 更新已迁移应用的 package.json
    toMigrate.forEach(({ to }) => {
      updatePackageJson(to);
    });

    // 步骤 4: 清理
    const toDelete = auditReport.results
      .filter(app => app.action === 'delete')
      .map(app => app.appDir);

    if (toDelete.length > 0) {
      console.log('\n🧹 步骤 4/4: 清理空目录');
      console.log('-'.repeat(40));
      const cleanupResults = cleanupDirectories(toDelete);
      results.cleanup = cleanupResults;
    } else {
      console.log('\n⏭️  步骤 4/4: 跳过（无需清理）');
      results.cleanup = [];
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ 架构优化流程完成！');
    console.log('='.repeat(60));

    // 生成总结
    printSummary(results);

    return results;
  } catch (error) {
    console.error('\n❌ 流程执行失败:', error.message);
    results.success = false;
    results.error = error.message;
    return results;
  }
}

/**
 * 打印执行总结
 * @param {Object} results - 执行结果
 */
function printSummary(results) {
  console.log('\n📊 执行总结:');
  console.log('-'.repeat(40));

  if (results.audit) {
    console.log('✅ 审计: 完成');
  }

  if (results.migration && results.migration.length > 0) {
    const successful = results.migration.filter(r => r.success).length;
    console.log(`✅ 迁移: ${successful}/${results.migration.length} 成功`);
  }

  if (results.config) {
    console.log(`✅ 配置: ${results.config.modified ? '已更新' : '无需更新'}`);
  }

  if (results.cleanup && results.cleanup.length > 0) {
    const successful = results.cleanup.filter(r => r.success).length;
    console.log(`✅ 清理: ${successful}/${results.cleanup.length} 成功`);
  }

  console.log('\n💡 下一步建议:');
  console.log('  1. 运行 pnpm install 刷新依赖');
  console.log('  2. 运行 pnpm build 验证构建');
  console.log('  3. 提交更改到 Git');
  console.log('  4. 开始应用代码重构（如果需要）');
}

// 主函数：如果直接运行此脚本
async function main() {
  console.log('🚀 架构优化自动化流程');
  console.log('━'.repeat(60));
  console.log('此脚本将自动执行以下操作:');
  console.log('  1. 审计应用目录');
  console.log('  2. 迁移需要保留的应用');
  console.log('  3. 更新配置文件');
  console.log('  4. 清理空目录');
  console.log('━'.repeat(60));

  // 确认执行
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('\n确认执行自动化流程？(y/n): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ 流程已取消');
    process.exit(0);
  }

  // 执行编排流程
  const results = await orchestrateMigration();

  process.exit(results.success ? 0 : 1);
}

// 判断是否直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}