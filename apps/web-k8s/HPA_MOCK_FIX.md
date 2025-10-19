# HPA API Mock 映射修复

## 问题描述

HPA 页面 (http://localhost:5668/k8s/hpa) 请求了两个 API：

1. Mock API - 尝试查找 `getMockHorizontalpodautoscalerList`（不存在）
2. 真实 API - 回退到真实 API 请求（因为 mock 函数未找到）

## 根本原因

mock.ts 中使用缩写命名：

- `getMockHPAList` ✓ (实际存在)
- `getMockPVList` ✓ (实际存在)
- `getMockPVCList` ✓ (实际存在)

但 `mock-resource-factory.ts` 的 `getMockFunctionName` 函数会将资源类型直接转换：

- `'horizontalpodautoscaler'` → `getMockHorizontalpodautoscalerList` ✗ (不存在)
- `'persistentvolume'` → `getMockPersistentVolumeList` ✗ (不存在)
- `'persistentvolumeclaim'` → `getMockPersistentVolumeClaimList` ✗ (不存在)

导致无法找到对应的 mock 函数，回退到真实 API。

## 解决方案

在 `mock-resource-factory.ts` 中添加特殊缩写映射：

```typescript
function getMockFunctionName(resourceType: string, operation: string): string {
  // 特殊缩写映射
  const abbreviationMap: Record<string, string> = {
    persistentvolume: 'PV',
    persistentvolumeclaim: 'PVC',
    horizontalpodautoscaler: 'HPA',
  };

  // 检查是否有特殊缩写
  const abbreviation = abbreviationMap[resourceType.toLowerCase()];
  if (abbreviation) {
    return `getMock${abbreviation}${operation.charAt(0).toUpperCase() + operation.slice(1)}`;
  }

  // 标准命名转换
  const capitalizedType = resourceType
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return `getMock${capitalizedType}${operation.charAt(0).toUpperCase() + operation.slice(1)}`;
}
```

## 修复效果

**修复前**:

- `'horizontalpodautoscaler'` → `getMockHorizontalpodautoscalerList` → 未找到 → 回退真实 API ✗

**修复后**:

- `'horizontalpodautoscaler'` → `getMockHPAList` → 找到 → 使用 mock 数据 ✓
- `'persistentvolume'` → `getMockPVList` → 找到 → 使用 mock 数据 ✓
- `'persistentvolumeclaim'` → `getMockPVCList` → 找到 → 使用 mock 数据 ✓

## 验证方法

重启开发服务器后访问以下页面：

1. **HPA 页面**: http://localhost:5668/k8s/hpa
   - 控制台应显示：`[K8s Mock] Using getMockHPAList`
   - 不应看到网络请求

2. **PV 页面**: http://localhost:5668/k8s/storage/persistent-volumes
   - 控制台应显示：`[K8s Mock] Using getMockPVList`

3. **PVC 页面**: http://localhost:5668/k8s/storage/persistent-volume-claims
   - 控制台应显示：`[K8s Mock] Using getMockPVCList`

## 影响范围

修复了 3 个资源的 mock 映射：

- ✅ HorizontalPodAutoscaler (HPA)
- ✅ PersistentVolume (PV)
- ✅ PersistentVolumeClaim (PVC)

其他 27 个资源不受影响，继续使用标准命名。

---

**修复文件**: `src/api/k8s/mock-resource-factory.ts` **修复日期**: 2025-10-18 **状态**: ✅ 已修复
