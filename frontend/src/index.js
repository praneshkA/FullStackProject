import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ensure this file exists and is correctly styled
import App from './App'; // Ensure App component is correctly defined
import reportWebVitals from './reportWebVitals'; // Optional for performance monitoring
import ShopContextProvider from './Context/ShopContext'; // Ensure this path is correct

// Ensure 'root' element exists before rendering
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found! Make sure you have <div id='root'></div> in index.html");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ShopContextProvider>  {/* Wrap with Context Provider */}
      <App />
    </ShopContextProvider>
  </React.StrictMode>
);

// Log web vitals for performance monitoring (Optional)
reportWebVitals(console.log);