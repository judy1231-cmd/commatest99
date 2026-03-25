import { Navigate } from 'react-router-dom';
// Navigate: 특정 경로로 즉시 리다이렉트하는 컴포넌트.
// window.location.href = '/login' 보다 React Router 방식이 더 적합하다.

// 로그인 필요 페이지 보호 — JWT accessToken 기반
function PrivateRoute({ children }) {
// children: 보호할 페이지 컴포넌트. 예: <MyPage />, <RestRecord />
  const token = localStorage.getItem('accessToken');
  // 로그인 여부를 accessToken 존재 여부로 판단한다.
  // 토큰 만료 여부는 여기서 확인하지 않는다. 만료된 토큰은 API 호출 시 fetchWithAuth가 처리한다.

  if (!token) {
    return <Navigate to="/login" replace />;
    // 토큰이 없으면 로그인 페이지로 이동한다.
    // replace: 브라우저 히스토리를 교체해서 뒤로가기를 눌러도 이 보호 페이지로 돌아오지 않는다.
  }
  return children;
  // 토큰이 있으면 원래 보여주려던 페이지를 렌더링한다.
}

// 관리자 전용 페이지 보호
export function AdminRoute({ children }) {
// 일반 PrivateRoute와 다르게 role까지 확인한다.
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // localStorage.getItem('user')가 null이면 '{}' (빈 객체 문자열)을 파싱해서 {} 를 얻는다.
  // null을 직접 파싱하면 에러가 난다.

  if (!token || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
    // 토큰이 없거나 ADMIN이 아니면 관리자 로그인 페이지로 이동.
    // 일반 사용자가 /admin 경로에 접근하는 걸 막는다.
  }
  return children;
}

export default PrivateRoute;
// named export(AdminRoute)와 default export(PrivateRoute) 둘 다 내보낸다.
// import PrivateRoute, { AdminRoute } from './common/PrivateRoute' 로 가져온다.
