import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root');

if (root) {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (error) {
    console.error('Error rendering React app:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    root.innerHTML = `<p>An error occurred while rendering the app. Error details: ${error}</p>`;
  }
} else {
  console.error('Root element not found');
  document.body.innerHTML = '<p>Root element not found. Cannot render React app.</p>';
}