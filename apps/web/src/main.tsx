import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from './App.tsx'
import { AuthProvider } from './app/providers/AuthProvider';
import AppToaster from './components/ui/AppToaster';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <AppToaster />
    </AuthProvider>
  </StrictMode>,
);

// createRoot(document.getElementById('root')!).render(
//   <AuthProvider>
//     <App />
//   </AuthProvider>,
// );
