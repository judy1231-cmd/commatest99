import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Edge 엄격 모드 등 localStorage 접근이 차단된 환경을 위한 전역 폴백
// 1순위: sessionStorage (새로고침해도 탭 닫기 전까지 유지)
// 2순위: 메모리 (세션 중에만 유지)
(function patchLocalStorage() {
  try {
    window.localStorage.setItem('__test__', '1');
    window.localStorage.removeItem('__test__');
    // localStorage 정상 → 패치 불필요
  } catch {
    // localStorage 차단됨 → sessionStorage 시도
    let backend;
    try {
      window.sessionStorage.setItem('__test__', '1');
      window.sessionStorage.removeItem('__test__');
      backend = window.sessionStorage;
    } catch {
      // sessionStorage도 차단됨 → 메모리 폴백
      const mem = {};
      backend = {
        getItem: k => mem[k] ?? null,
        setItem: (k, v) => { mem[k] = String(v); },
        removeItem: k => { delete mem[k]; },
        clear: () => { Object.keys(mem).forEach(k => delete mem[k]); },
        key: i => Object.keys(mem)[i] ?? null,
        get length() { return Object.keys(mem).length; },
      };
    }
    const safe = {
      getItem: k => backend.getItem(k),
      setItem: (k, v) => backend.setItem(k, String(v)),
      removeItem: k => backend.removeItem(k),
      clear: () => backend.clear(),
      key: i => backend.key(i),
      get length() { return backend.length; },
    };
    try {
      Object.defineProperty(window, 'localStorage', { value: safe, writable: false });
    } catch {
      // defineProperty 실패 시 무시 (이미 패치됐을 경우)
    }
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
