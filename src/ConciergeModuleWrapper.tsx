// src/components/ConciergeModuleWrapper.tsx
import React from 'react';
import ConciergeModule, { ConciergeModuleProps } from './ConciergeModule';
import { ConfigProvider } from './contexts/ConfigContext';

export default function ConciergeModuleWrapper(props: ConciergeModuleProps) {
  return (
    <ConfigProvider value={props.config || {}}>
      <ConciergeModule {...props} />
    </ConfigProvider>
  );
}
