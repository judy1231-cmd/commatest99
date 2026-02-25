import { Navigate } from 'react-router-dom';

// 로그인 필요 페이지 보호
function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 관리자 전용 페이지 보호
export function AdminRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('isLoggedIn');
  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default PrivateRoute;
