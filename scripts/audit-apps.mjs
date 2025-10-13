#!/usr/bin/env node

/**
 * 应用目录审计脚本
 * 单一职责：仅负责审计应用目录状态，不执行任何修改操作
 */

import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// 需要审计的应用目录列表
const LEGACY_APPS = [
  'main-app',
  'agent-app',
  'dashboard-app',
  'cluster-app',
  'system-app',
  'image-build-app',
  'monitor-app'
];

/**
 * 审计单个应用目录
 * @param {string} appDir - 应用目录名称
 * @returns {Object} 审计结果
 */
export function auditApp(appDir) {
  const fullPath = join(process.cwd(), appDir);

  // 检查目录是否存在
  if (!existsSync(fullPath)) {
    return {
      appDir,
      exists: false,
      hasSrc: false,
      hasPackageJson: false,
      hasDist: false,
      hasNodeModules: false,
      size: 0,
      files: 0,
      action: 'not_found',
      reason: '目录不存在'
    };
  }

  // 检查目录内容
  const hasSrc = existsSync(join(fullPath, 'src'));
  const hasPackageJson = existsSync(join(fullPath, 'package.json'));
  const hasDist = existsSync(join(fullPath, 'dist'));
  const hasNodeModules = existsSync(join(fullPath, 'node_modules'));

  // 获取目录大小和文件数量
  let size = 0;
  let files = [];

  try {
    files = readdirSync(fullPath);
    const stats = statSync(fullPath);
    size = stats.size;
  } catch (error) {
    console.error(`Error reading ${appDir}:`, error.message);
  }

  // 决定处理方案
  let action = 'skip';
  let reason = '仅包含临时文件';

  if (hasSrc || hasPackageJson) {
    action = 'migrate';
    reason = '包含源代码或配置';
  } else if (files.length === 0) {
    action = 'delete';
    reason = '空目录';
  } else if (files.length === 1 && (hasDist || hasNodeModules)) {
    action = 'delete';
    reason = '仅包含构建产物或依赖';
  }

  return {
    appDir,
    exists: true,
    hasSrc,
    hasPackageJson,
    hasDist,
    hasNodeModules,
    size,
    files: files.length,
    fileList: files.slice(0, 10), // 只显示前10个文件
    action,
    reason
  };
}

/**
 * 生成审计报告
 * @param {Array} apps - 应用目录列表
 * @returns {Object} 完整的审计报告
 */
export function generateAuditReport(apps = LEGACY_APPS) {
  const timestamp = new Date().toISOString();
  const results = apps.map(app => auditApp(app));

  // 统计信息
  const summary = {
    total: results.length,
    found: results.filter(r => r.exists).length,
    notFound: results.filter(r => !r.exists).length,
    toMigrate: results.filter(r => r.action === 'migrate').length,
    toDelete: results.filter(r => r.action === 'delete').length,
    toSkip: results.filter(r => r.action === 'skip').length
  };

  return {
    timestamp,
    summary,
    results
  };
}

/**
 * 打印审计报告到控制台
 * @param {Object} report - 审计报告
 */
function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 应用目录审计报告');
  console.log('='.repeat(60));
  console.log(`⏰ 审计时间: ${report.timestamp}`);

  console.log('\n📊 统计摘要:');
  console.log(`  总计: ${report.summary.total} 个目录`);
  console.log(`  存在: ${report.summary.found} 个`);
  console.log(`  不存在: ${report.summary.notFound} 个`);
  console.log(`  需迁移: ${report.summary.toMigrate} 个 🔄`);
  console.log(`  待删除: ${report.summary.toDelete} 个 🗑️`);
  console.log(`  跳过: ${report.summary.toSkip} 个 ⏭️`);

  console.log('\n📁 详细结果:');
  console.log('-'.repeat(60));

  // 创建表格
  console.table(
    report.results.map(r => ({
      '目录': r.appDir,
      '存在': r.exists ? '✅' : '❌',
      'src': r.hasSrc ? '✅' : '❌',
      'package.json': r.hasPackageJson ? '✅' : '❌',
      'dist': r.hasDist ? '✅' : '❌',
      'node_modules': r.hasNodeModules ? '✅' : '❌',
      '文件数': r.files,
      '操作': r.action,
      '原因': r.reason
    }))
  );

  // 列出需要迁移的目录
  const toMigrate = report.results.filter(r => r.action === 'migrate');
  if (toMigrate.length > 0) {
    console.log('\n✅ 需要迁移的应用:');
    toMigrate.forEach(app => {
      console.log(`  - ${app.appDir} → apps/${app.appDir.replace('-app', '')}`);
    });
  }

  // 列出需要删除的目录
  const toDelete = report.results.filter(r => r.action === 'delete');
  if (toDelete.length > 0) {
    console.log('\n🗑️  建议删除的目录:');
    toDelete.forEach(app => {
      console.log(`  - ${app.appDir} (${app.reason})`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * 保存审计报告到文件
 * @param {Object} report - 审计报告
 * @param {string} filename - 文件名
 */
async function saveReport(report, filename = 'audit-report.json') {
  const { writeFileSync } = await import('node:fs');
  const outputPath = join(process.cwd(), filename);

  try {
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 报告已保存到: ${outputPath}`);
  } catch (error) {
    console.error(`❌ 保存报告失败:`, error.message);
  }
}

// 主函数：如果直接运行此脚本
async function main() {
  console.log('🔍 开始审计应用目录...\n');

  const report = generateAuditReport();
  printReport(report);

  // 保存JSON格式的报告
  await saveReport(report);

  // 提供迁移建议
  if (report.summary.toMigrate > 0) {
    console.log('💡 下一步建议:');
    console.log('   1. 审查审计报告，确认迁移清单');
    console.log('   2. 运行 TASK-004 创建迁移脚本');
    console.log('   3. 执行迁移操作');
  }
}

// 判断是否直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}