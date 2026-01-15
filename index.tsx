import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { convex, isConvexConfigured } from './convex/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Only wrap with ConvexProvider if Convex is configured
// Otherwise render App directly (it will use local state via QuotationContext)
const app = <App />;

root.render(
  <React.StrictMode>
    {isConvexConfigured && convex ? (
      <ConvexProvider client={convex}>
        {app}
      </ConvexProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);