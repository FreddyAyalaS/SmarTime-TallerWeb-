// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </React.StrictMode>
);
const userPreferences = JSON.parse(localStorage.getItem('userPreferences'));

if (userPreferences?.darkMode) {
  document.body.classList.add('dark');
} else {
  document.body.classList.remove('dark');
}