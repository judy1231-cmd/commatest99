import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Edge 엄격 모드 등 localStorage 접근이 차단된 환경을 위한 전역 폴백
(function patchLocalStorage() {
  try {
    window.localStorage.setItem('__test__', '1');
    window.localStorage.removeItem('__test__');
  } catch {
    const mem = {};
    const safe = {
      getItem: k => mem[k] ?? null,
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: k => { delete mem[k]; },
      clear: () => { Object.keys(mem).forEach(k => delete mem[k]); },
      key: i => Object.keys(mem)[i] ?? null,
      get length() { return Object.keys(mem).length; },
    };
    Object.defineProperty(window, 'localStorage', { value: safe, writable: false });
  }
}());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
