import { Navigate } from 'react-router-dom';

// 로그인 필요 페이지 보호 — JWT accessToken 기반
function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 관리자 전용 페이지 보호
export function AdminRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default PrivateRoute;
