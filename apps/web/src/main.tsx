import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';

import './index.css'

import App from './App.tsx'
import { AuthProvider } from './app/providers/AuthProvider';
import AppToaster from './components/ui/AppToaster';
import { queryClient } from './lib/query-client.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <AppToaster />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);

// createRoot(document.getElementById('root')!).render(
//   <AuthProvider>
//     <App />
//   </AuthProvider>,
// );
