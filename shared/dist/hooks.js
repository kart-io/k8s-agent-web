export { usePermission } from './hooks/usePermission.js';
export { useLoading } from './hooks/useLoading.js';
export { usePagination } from './hooks/usePagination.js';
export { debounce, useDebounce } from './hooks/useDebounce.js';
export { throttle, useThrottle } from './hooks/useThrottle.js';
export { useFieldDependencies, useFormErrors, useFormSubmit, useFormValidation } from './hooks/useFormValidation.js';
export { useVxeGrid, useVxeTable } from './hooks/useVxeTable.js';

const index = {
  usePermission,
  useLoading,
  usePagination,
  useDebounce,
  useThrottle,
  debounce,
  throttle,
  useFormValidation,
  useFormSubmit,
  useFormErrors,
  useFieldDependencies,
  useVxeTable,
  useVxeGrid
};

export { index as default };
//# sourceMappingURL=hooks.js.map
