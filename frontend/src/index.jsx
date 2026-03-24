import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Edge 엄격 모드 등 localStorage 접근이 차단된 환경을 위한 전역 폴백
// 1순위: cookie (새로고침 후에도 유지, 보안정책에 가장 관대함)
// 2순위: sessionStorage (탭 열린 동안 유지)
// 3순위: 메모리 (세션 중에만 유지)
(function patchLocalStorage() {
  try {
    window.localStorage.setItem('__test__', '1');
    window.localStorage.removeItem('__test__');
    // localStorage 정상 → 패치 불필요
  } catch {
    // localStorage 차단됨 → cookie 기반 폴백 시도
    const cookieBackend = {
      getItem(key) {
        try {
          const m = document.cookie.match(new RegExp('(?:^|;\\s*)ls_' + key + '=([^;]*)'));
          return m ? decodeURIComponent(m[1]) : null;
        } catch { return null; }
      },
      setItem(key, value) {
        try {
          // max-age 7일, SameSite=Lax
          document.cookie = 'ls_' + key + '=' + encodeURIComponent(value)
            + ';path=/;max-age=604800;SameSite=Lax';
        } catch { /* ignore */ }
      },
      removeItem(key) {
        try {
          document.cookie = 'ls_' + key + '=;path=/;max-age=0';
        } catch { /* ignore */ }
      },
      clear() { /* 필요한 키만 제거하므로 생략 */ },
      key: () => null,
      get length() { return 0; },
    };

    // cookie가 작동하는지 확인
    let backend = cookieBackend;
    try {
      document.cookie = 'ls___test__=1;path=/;max-age=5';
      if (!cookieBackend.getItem('__test__')) throw new Error();
      cookieBackend.removeItem('__test__');
    } catch {
      // cookie도 안 되면 sessionStorage 시도
      try {
        window.sessionStorage.setItem('__test__', '1');
        window.sessionStorage.removeItem('__test__');
        backend = window.sessionStorage;
      } catch {
        // 최후 수단: 메모리 폴백 (새로고침 시 초기화)
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
    }

    const safe = {
      getItem: k => backend.getItem(k),
      setItem: (k, v) => backend.setItem(k, String(v)),
      removeItem: k => backend.removeItem(k),
      clear: () => backend.clear?.(),
      key: i => backend.key?.(i) ?? null,
      get length() { return backend.length ?? 0; },
    };
    try {
      Object.defineProperty(window, 'localStorage', { value: safe, writable: false });
    } catch { /* 이미 패치됐거나 브라우저가 재정의를 막는 경우 무시 */ }
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
