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

// Only wrap with ConvexProvider if Convex is configured
// Otherwise render App directly (it will use local state via QuotationContext)
const app = <App />;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {isConvexConfigured && convex ? (
        <ConvexProvider client={convex}>
          {app}
        </ConvexProvider>
      ) : (
        app
      )}
    </ErrorBoundary>
  </React.StrictMode>
);