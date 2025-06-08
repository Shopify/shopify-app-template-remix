import React from 'react';
import { createRoot } from 'react-dom/client';
import { PreviewSystem } from './PreviewSystem';

const root = createRoot(document.getElementById('root')!);
root.render(<PreviewSystem />);