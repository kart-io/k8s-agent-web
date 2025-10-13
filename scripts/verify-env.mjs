#!/usr/bin/env node
/**
 * 验证环境配置文件
 * Verify environment configuration files
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const envDir = join(rootDir, 'apps/web-antd');

const environments = [
  { name: 'Base', file: '.env', required: true },
  { name: 'Development', file: '.env.development', required: true },
  { name: 'Test', file: '.env.test', required: false },
  { name: 'Production', file: '.env.production', required: true },
];

console.log('\n🔍 验证环境配置文件 (Verifying Environment Configuration)\n');
console.log('━'.repeat(60));

let hasErrors = false;

for (const env of environments) {
  const filePath = join(envDir, env.file);
  const exists = existsSync(filePath);

  const status = exists ? '✅' : (env.required ? '❌' : '⚠️');
  const statusText = exists ? 'Found' : (env.required ? 'Missing (Required)' : 'Missing (Optional)');

  console.log(`${status} ${env.name.padEnd(12)} | ${env.file.padEnd(20)} | ${statusText}`);

  if (!exists && env.required) {
    hasErrors = true;
  }

  if (exists) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line =>
        line.trim() && !line.trim().startsWith('#')
      );

      const vars = {};
      lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim();
        }
      });

      // 检查关键变量
      const criticalVars = [
        'VITE_GLOB_API_URL',
      ];

      criticalVars.forEach(varName => {
        if (vars[varName]) {
          console.log(`   └─ ${varName}: ${vars[varName]}`);
        }
      });

      if (vars['VITE_NITRO_MOCK']) {
        console.log(`   └─ VITE_NITRO_MOCK: ${vars['VITE_NITRO_MOCK']}`);
      }
    } catch (error) {
      console.log(`   └─ ⚠️  Error reading file: ${error.message}`);
    }
  }
  console.log('');
}

console.log('━'.repeat(60));

if (hasErrors) {
  console.log('\n❌ 环境配置验证失败 (Environment configuration verification failed)');
  console.log('   请确保所有必需的环境文件存在');
  console.log('   Please ensure all required environment files exist\n');
  process.exit(1);
} else {
  console.log('\n✅ 环境配置验证成功 (Environment configuration verified successfully)');
  console.log('\n📝 使用说明 (Usage):');
  console.log('   开发环境 (Development): pnpm dev:antd');
  console.log('   测试环境 (Test):        pnpm vite --mode test');
  console.log('   生产构建 (Production):  pnpm build:antd\n');
}
