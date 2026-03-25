/**
 * 인증이 필요한 API 호출 유틸
 * - Authorization 헤더 자동 추가
 * - 401 응답 시 refreshToken으로 accessToken 갱신 후 재시도
 * - 갱신 실패 시 로그아웃 처리 (localStorage 클리어 + /login 리다이렉트)
 */
// 이 파일이 무슨 역할을 하는지 JSDoc으로 설명한다.

let isRefreshing = false;
// 토큰 갱신이 현재 진행 중인지 나타내는 플래그.
// 여러 요청이 동시에 401을 받을 때, 갱신을 딱 한 번만 실행하기 위한 장치.

let refreshQueue = [];
// 갱신 중에 들어온 다른 요청들의 resolve/reject를 임시로 모아두는 배열.
// 갱신이 완료되면 이 배열의 모든 요청에 새 토큰을 전달한다.

function processRefreshQueue(newToken) {
// 갱신 성공 시: 대기 중인 모든 요청에 새 토큰을 전달하고 대기를 해제한다.
  refreshQueue.forEach(({ resolve }) => resolve(newToken));
  // 각 요청의 Promise.resolve()를 호출해서 대기를 풀고 재시도하게 한다.
  refreshQueue = [];
  // 처리 완료 후 배열을 비운다.
}

function rejectRefreshQueue(error) {
// 갱신 실패 시: 대기 중인 모든 요청에 실패를 전파한다.
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

function forceLogout() {
// 강제 로그아웃: localStorage를 비우고 로그인 페이지로 이동.
// Refresh Token이 만료됐거나 서버에서 거부했을 때 호출된다.
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
  // 페이지 전체를 로그인 페이지로 이동한다.
}

async function refreshAccessToken() {
// Refresh Token으로 새 Access Token을 받아오는 함수.
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('리프레시 토큰 없음');
    // Refresh Token도 없으면 갱신 불가. forceLogout으로 이어진다.
  }

  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
    // Refresh Token을 서버에 보내서 새 Access Token을 요청한다.
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message);
    // 서버가 실패 응답을 보내면 예외를 던진다. (토큰 만료, 위변조 등)
  }

  localStorage.setItem('accessToken', data.data.accessToken);
  // 새 Access Token을 localStorage에 저장한다.
  return data.data.accessToken;
  // 새 토큰을 반환해서 재시도 요청에 사용할 수 있게 한다.
}

/**
 * fetch wrapper with automatic token refresh
 * @param {string} url - API URL (예: '/api/auth/me')
 * @param {object} options - fetch options (method, body 등)
 * @returns {Promise<object>} parsed JSON response
 */
export async function fetchWithAuth(url, options = {}) {
// 메인 함수. 모든 인증 API 요청에 이 함수를 사용한다.
// 기본 fetch와 사용법은 같지만, 토큰 관리를 자동으로 해준다.
  const accessToken = localStorage.getItem('accessToken');
  // 현재 저장된 Access Token을 읽는다.

  const headers = {
    'Content-Type': 'application/json',
    // 요청 바디가 JSON임을 서버에 알린다.
    ...options.headers,
    // 호출자가 추가로 넘긴 헤더를 합친다. (덮어쓸 수 있다)
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
    // Access Token이 있으면 Authorization 헤더에 "Bearer 토큰값" 형식으로 추가.
    // 서버의 JwtInterceptor가 이 헤더를 읽어서 인증한다.
  }

  let res = await fetch(url, { ...options, headers });
  // 실제 API 요청 실행

  // 401이면 토큰 갱신 시도
  if (res.status === 401 && localStorage.getItem('refreshToken')) {
  // 401 Unauthorized: Access Token이 만료됐거나 유효하지 않다.
  // Refresh Token이 있으면 갱신을 시도한다.
    try {
      let newToken;

      if (isRefreshing) {
      // 다른 요청이 이미 갱신 중이면, 갱신이 끝날 때까지 기다린다.
        newToken = await new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
          // 이 요청의 resolve/reject를 큐에 넣는다.
          // processRefreshQueue 또는 rejectRefreshQueue가 호출되면 여기서 깨어난다.
        });
      } else {
        isRefreshing = true;
        // 갱신 시작 플래그 설정. 다른 요청이 중복 갱신을 못 하게 막는다.
        try {
          newToken = await refreshAccessToken();
          // 실제 토큰 갱신 API 호출
          processRefreshQueue(newToken);
          // 대기 중이던 다른 요청들에게 새 토큰 전달
        } catch (refreshError) {
          rejectRefreshQueue(refreshError);
          // 갱신 실패 → 대기 중이던 요청들도 모두 실패 처리
          forceLogout();
          // 강제 로그아웃
          throw refreshError;
        } finally {
          isRefreshing = false;
          // 갱신 완료(성공이든 실패든) 후 플래그 초기화
        }
      }

      // 새 토큰으로 원래 요청 재시도
      headers['Authorization'] = `Bearer ${newToken}`;
      // 새 토큰으로 Authorization 헤더를 교체
      res = await fetch(url, { ...options, headers });
      // 새 토큰으로 원래 요청을 다시 보낸다.
    } catch (e) {
      forceLogout();
      throw e;
    }
  }

  return res.json();
  // 최종 응답을 JSON으로 파싱해서 반환. { success, data, message } 형태.
}

export default fetchWithAuth;
// default export: import fetchWithAuth from './api/fetchWithAuth' 로 가져온다.
