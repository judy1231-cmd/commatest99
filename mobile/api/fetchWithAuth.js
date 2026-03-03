/**
 * 인증이 필요한 API 호출 유틸 (React Native 버전)
 * - AsyncStorage로 localStorage 대체
 * - Authorization 헤더 자동 추가
 * - 401 응답 시 refreshToken으로 accessToken 갱신 후 재시도
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// 백엔드 서버 주소 (개발: 로컬 or 터널링 주소)
const BASE_URL = 'http://localhost:8080';

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

async function forceLogout() {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  // expo-router에서 navigation은 컴포넌트 레벨에서 처리
}

async function refreshAccessToken() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('리프레시 토큰 없음');
  }

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  await AsyncStorage.setItem('accessToken', data.data.accessToken);
  return data.data.accessToken;
}

/**
 * fetch wrapper with automatic token refresh
 * @param {string} path - API 경로 (예: '/api/auth/me')
 * @param {object} options - fetch options
 * @returns {Promise<object>} parsed JSON response
 */
export async function fetchWithAuth(path, options = {}) {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const url = `${BASE_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // 401이면 토큰 갱신 시도
  if (res.status === 401) {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      await forceLogout();
      throw new Error('인증이 필요합니다');
    }

    try {
      let newToken;

      if (isRefreshing) {
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
          await forceLogout();
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch (e) {
      await forceLogout();
      throw e;
    }
  }

  return res.json();
}

export default fetchWithAuth;
