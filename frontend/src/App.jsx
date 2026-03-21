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
import CommunityWrite from './pages/user/CommunityWrite';
import CommunityDetail from './pages/user/CommunityDetail';
import Challenge from './pages/user/Challenge';
import HeartRateCheck from './pages/user/HeartRateCheck';
import RestTypeTest from './pages/user/RestTypeTest';
import StressTest from './pages/user/StressTest';
import RestRecord from './pages/user/RestRecord';
import MapPage from './pages/user/MapPage';
import PlaceDetail from './pages/user/PlaceDetail';
import Settings from './pages/user/Settings';
import SettingsProfile from './pages/user/SettingsProfile';
import SettingsSecurity from './pages/user/SettingsSecurity';
import SettingsPreferences from './pages/user/SettingsPreferences';
import Notifications from './pages/user/Notifications';

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

// Admin - Users
import AdminUserDetail from './pages/admin/users/AdminUserDetail';
import AdminUserStatus from './pages/admin/users/AdminUserStatus';
import AdminUserLogs from './pages/admin/users/AdminUserLogs';

// Admin - Diagnosis
import AdminDiagnosisList from './pages/admin/diagnosis/AdminDiagnosisList';
import AdminDiagnosisNew from './pages/admin/diagnosis/AdminDiagnosisNew';

// Admin - Contents
import AdminContentsList from './pages/admin/contents/AdminContentsList';
import AdminContentsNew from './pages/admin/contents/AdminContentsNew';
import AdminContentsEdit from './pages/admin/contents/AdminContentsEdit';
import AdminContentsCategory from './pages/admin/contents/AdminContentsCategory';

// Admin - Tags / Recommend / Records / Stats
import AdminTagList from './pages/admin/tags/AdminTagList';
import AdminRecommend from './pages/admin/recommend/AdminRecommend';
import AdminRecords from './pages/admin/records/AdminRecords';
import AdminStats from './pages/admin/stats/AdminStats';

// Admin - Managers
import AdminManagerList from './pages/admin/managers/AdminManagerList';
import AdminManagerLogs from './pages/admin/managers/AdminManagerLogs';

// Diagnosis Pages
import DiagnosisHome from './pages/user/diagnosis/DiagnosisHome';
import DiagnosisStart from './pages/user/diagnosis/DiagnosisStart';
import DiagnosisQuiz from './pages/user/diagnosis/DiagnosisQuiz';
import DiagnosisResult from './pages/user/diagnosis/DiagnosisResult';

// Contents Pages
import ContentsList from './pages/user/contents/ContentsList';
import ContentsDetail from './pages/user/contents/ContentsDetail';

// Recommend Pages
import RecommendHome from './pages/user/recommend/RecommendHome';
import RecommendHistory from './pages/user/recommend/RecommendHistory';

// Records Pages
import RecordsRest from './pages/user/records/RecordsRest';
import RecordsEmotion from './pages/user/records/RecordsEmotion';
import RecordsDiagnosis from './pages/user/records/RecordsDiagnosis';

// Stats Pages
import StatsEmotion from './pages/user/stats/StatsEmotion';
import StatsRest from './pages/user/stats/StatsRest';
import StatsDiagnosis from './pages/user/stats/StatsDiagnosis';

// Mypage Pages
import MypageHome from './pages/user/mypage/MypageHome';
import MypagePassword from './pages/user/mypage/MypagePassword';
import MypageStatus from './pages/user/mypage/MypageStatus';
import MypageWithdraw from './pages/user/mypage/MypageWithdraw';

// Auth Pages
import AuthSignup from './pages/user/auth/AuthSignup';
import AuthLogin from './pages/user/auth/AuthLogin';
import AuthVerifyEmail from './pages/user/auth/AuthVerifyEmail';
import AuthFindPassword from './pages/user/auth/AuthFindPassword';

// Support Pages
import SupportFaq from './pages/user/support/SupportFaq';

// OAuth Callback
import OAuthCallback from './pages/user/OAuthCallback';
import KakaoConfirm from './pages/user/KakaoConfirm';
import GoogleConfirm from './pages/user/GoogleConfirm';
import NaverConfirm from './pages/user/NaverConfirm';

// 404
import NotFound from './pages/NotFound';

function App() {
  // 앱 초기화 시 저장된 테마 복원
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, []);

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
      <Route path="/community/write" element={<PrivateRoute><CommunityWrite /></PrivateRoute>} />
      <Route path="/community/:id" element={<CommunityDetail />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/places/:id" element={<PlaceDetail />} />
      <Route path="/rest-test" element={<RestTypeTest />} />
      <Route path="/stress-test" element={<StressTest />} />
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
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/settings/profile" element={<PrivateRoute><SettingsProfile /></PrivateRoute>} />
      <Route path="/settings/security" element={<PrivateRoute><SettingsSecurity /></PrivateRoute>} />
      <Route path="/settings/preferences" element={<PrivateRoute><SettingsPreferences /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

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

      {/* 관리자 - 사용자 */}
      <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
      <Route path="/admin/users/:id/status" element={<AdminRoute><AdminUserStatus /></AdminRoute>} />
      <Route path="/admin/users/:id/logs" element={<AdminRoute><AdminUserLogs /></AdminRoute>} />

      {/* 관리자 - 진단 */}
      <Route path="/admin/diagnosis" element={<AdminRoute><AdminDiagnosisList /></AdminRoute>} />
      <Route path="/admin/diagnosis/new" element={<AdminRoute><AdminDiagnosisNew /></AdminRoute>} />

      {/* 관리자 - 콘텐츠 */}
      <Route path="/admin/contents" element={<AdminRoute><AdminContentsList /></AdminRoute>} />
      <Route path="/admin/contents/new" element={<AdminRoute><AdminContentsNew /></AdminRoute>} />
      <Route path="/admin/contents/:id/edit" element={<AdminRoute><AdminContentsEdit /></AdminRoute>} />
      <Route path="/admin/contents/category" element={<AdminRoute><AdminContentsCategory /></AdminRoute>} />

      {/* 관리자 - 태그 / 추천 / 기록 / 통계 */}
      <Route path="/admin/tags" element={<AdminRoute><AdminTagList /></AdminRoute>} />
      <Route path="/admin/recommend" element={<AdminRoute><AdminRecommend /></AdminRoute>} />
      <Route path="/admin/records" element={<AdminRoute><AdminRecords /></AdminRoute>} />
      <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />

      {/* 관리자 - 관리자 계정 */}
      <Route path="/admin/managers" element={<AdminRoute><AdminManagerList /></AdminRoute>} />
      <Route path="/admin/managers/logs" element={<AdminRoute><AdminManagerLogs /></AdminRoute>} />

      {/* 진단 */}
      <Route path="/diagnosis" element={<DiagnosisHome />} />
      <Route path="/diagnosis/start" element={<PrivateRoute><DiagnosisStart /></PrivateRoute>} />
      <Route path="/diagnosis/quiz" element={<PrivateRoute><DiagnosisQuiz /></PrivateRoute>} />
      <Route path="/diagnosis/result" element={<PrivateRoute><DiagnosisResult /></PrivateRoute>} />

      {/* 휴식 콘텐츠 */}
      <Route path="/contents" element={<ContentsList />} />
      <Route path="/contents/:id" element={<ContentsDetail />} />

      {/* 맞춤 추천 */}
      <Route path="/recommend" element={<PrivateRoute><RecommendHome /></PrivateRoute>} />
      <Route path="/recommend/history" element={<PrivateRoute><RecommendHistory /></PrivateRoute>} />

      {/* 기록 */}
      <Route path="/records/rest" element={<PrivateRoute><RecordsRest /></PrivateRoute>} />
      <Route path="/records/emotion" element={<PrivateRoute><RecordsEmotion /></PrivateRoute>} />
      <Route path="/records/diagnosis" element={<PrivateRoute><RecordsDiagnosis /></PrivateRoute>} />

      {/* 통계 */}
      <Route path="/stats/emotion" element={<PrivateRoute><StatsEmotion /></PrivateRoute>} />
      <Route path="/stats/rest" element={<PrivateRoute><StatsRest /></PrivateRoute>} />
      <Route path="/stats/diagnosis" element={<PrivateRoute><StatsDiagnosis /></PrivateRoute>} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<PrivateRoute><MypageHome /></PrivateRoute>} />
      <Route path="/mypage/password" element={<PrivateRoute><MypagePassword /></PrivateRoute>} />
      <Route path="/mypage/status" element={<PrivateRoute><MypageStatus /></PrivateRoute>} />
      <Route path="/mypage/withdraw" element={<PrivateRoute><MypageWithdraw /></PrivateRoute>} />

      {/* 인증 */}
      <Route path="/auth/signup" element={<AuthSignup />} />
      <Route path="/auth/login" element={<AuthLogin />} />
      <Route path="/auth/verify-email" element={<AuthVerifyEmail />} />
      <Route path="/auth/find-password" element={<AuthFindPassword />} />

      {/* 소셜 로그인 콜백 / 가입 확인 */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/kakao/confirm" element={<KakaoConfirm />} />
      <Route path="/google/confirm" element={<GoogleConfirm />} />
      <Route path="/naver/confirm" element={<NaverConfirm />} />

      {/* 고객지원 */}
      <Route path="/support/faq" element={<SupportFaq />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
