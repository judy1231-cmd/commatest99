/**
 * 인증이 필요한 API 호출 유틸
 * - Authorization 헤더 자동 추가
 * - 401 응답 시 refreshToken으로 accessToken 갱신 후 재시도
 * - 갱신 실패 시 로그아웃 처리 (localStorage 클리어 + /login 리다이렉트)
 */

let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(newToken) {
  refreshQueue.forEach(({ resolve }) => resolve(newToken));
  refreshQueue = [];
}

function rejectRefreshQueue(error) {
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

function forceLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('리프레시 토큰 없음');
  }

  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  localStorage.setItem('accessToken', data.data.accessToken);
  return data.data.accessToken;
}

/**
 * fetch wrapper with automatic token refresh
 * @param {string} url - API URL (예: '/api/auth/me')
 * @param {object} options - fetch options (method, body 등)
 * @returns {Promise<object>} parsed JSON response
 */
export async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // 401이면 토큰 갱신 시도
  if (res.status === 401 && localStorage.getItem('refreshToken')) {
    try {
      let newToken;

      if (isRefreshing) {
        // 이미 갱신 중이면 큐에 등록하고 대기
        newToken = await new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        });
      } else {
        isRefreshing = true;
        try {
          newToken = await refreshAccessToken();
          processRefreshQueue(newToken);
        } catch (refreshError) {
          rejectRefreshQueue(refreshError);
          forceLogout();
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      // 새 토큰으로 원래 요청 재시도
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch (e) {
      forceLogout();
      throw e;
    }
  }

  return res.json();
}

export default fetchWithAuth;
