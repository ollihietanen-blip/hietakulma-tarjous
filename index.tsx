import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { convex, isConvexConfigured } from './lib/convexClient';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

let rootElement = document.getElementById('root');
if (!rootElement) {
  // Create root element if it doesn't exist (shouldn't happen, but safety check)
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

const root = ReactDOM.createRoot(rootElement);

// Always wrap with ConvexProvider to prevent useQuery errors
// If Convex is not configured, a dummy client is used
// The hooks will check isConvexConfigured and return null if not configured
const app = <App />;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        {app}
      </ConvexProvider>
    </ErrorBoundary>
  </React.StrictMode>
);