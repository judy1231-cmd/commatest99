import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute, { AdminRoute } from './components/common/PrivateRoute';
import { fetchWithAuth } from './api/fetchWithAuth';

// User Pages
import MainDashboard from './pages/user/MainDashboard';
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';
import SignupComplete from './pages/user/SignupComplete';
import PasswordReset from './pages/user/PasswordReset';
import MyPage from './pages/user/MyPage';
import Community from './pages/user/Community';
import Challenge from './pages/user/Challenge';
import HeartRateCheck from './pages/user/HeartRateCheck';
import RestTypeTest from './pages/user/RestTypeTest';
import RestRecord from './pages/user/RestRecord';
import MapPage from './pages/user/MapPage';

// Rest Category Pages
import RestPhysical from './pages/user/RestPhysical';
import RestMental from './pages/user/RestMental';
import RestSensory from './pages/user/RestSensory';
import RestEmotional from './pages/user/RestEmotional';
import RestSocial from './pages/user/RestSocial';
import RestNature from './pages/user/RestNature';
import RestCreative from './pages/user/RestCreative';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PlaceApproval from './pages/admin/PlaceApproval';
import ChallengeManagement from './pages/admin/ChallengeManagement';
import CommunityManagement from './pages/admin/CommunityManagement';
import Analytics from './pages/admin/Analytics';
import SystemSettings from './pages/admin/SystemSettings';

// 404
import NotFound from './pages/NotFound';

function App() {
  // 앱 초기화 시 토큰 유효성 검증
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetchWithAuth('/api/auth/me').then((data) => {
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }).catch(() => {
      // fetchWithAuth 내부에서 refresh 실패 시 자동 로그아웃 처리됨
    });
  }, []);

  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/" element={<MainDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-complete" element={<SignupComplete />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/community" element={<Community />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/rest-test" element={<RestTypeTest />} />
      <Route path="/rest/physical" element={<RestPhysical />} />
      <Route path="/rest/mental" element={<RestMental />} />
      <Route path="/rest/sensory" element={<RestSensory />} />
      <Route path="/rest/emotional" element={<RestEmotional />} />
      <Route path="/rest/social" element={<RestSocial />} />
      <Route path="/rest/nature" element={<RestNature />} />
      <Route path="/rest/creative" element={<RestCreative />} />

      {/* 로그인 필요 라우트 */}
      <Route path="/my" element={<PrivateRoute><MyPage /></PrivateRoute>} />
      <Route path="/heartrate" element={<PrivateRoute><HeartRateCheck /></PrivateRoute>} />
      <Route path="/rest-record" element={<PrivateRoute><RestRecord /></PrivateRoute>} />
      <Route path="/challenge" element={<PrivateRoute><Challenge /></PrivateRoute>} />

      {/* 관리자 로그인 (공개) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 관리자 전용 라우트 */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/places" element={<AdminRoute><PlaceApproval /></AdminRoute>} />
      <Route path="/admin/challenges" element={<AdminRoute><ChallengeManagement /></AdminRoute>} />
      <Route path="/admin/community" element={<AdminRoute><CommunityManagement /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
