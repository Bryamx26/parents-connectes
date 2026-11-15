import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../design-system/tokens.css';
import '../../design-system/components.css';
import App from './App.jsx';
import { AuthProvider } from './lib/auth.jsx';
import { ConfirmProvider } from './lib/confirm.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </AuthProvider>
  </StrictMode>
);
