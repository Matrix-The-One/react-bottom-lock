import type { Ref, RefCallback } from 'react';

export function mergeRefs<T>(
  ...refs: Array<Ref<T> | RefCallback<T> | undefined>
) {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;

      if (typeof ref === 'function') {
        ref(value);
        continue;
      }

      ref.current = value;
    }
  };
}
