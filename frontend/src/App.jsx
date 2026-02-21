import { Routes, Route } from 'react-router-dom';

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
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PlaceApproval from './pages/admin/PlaceApproval';
import ChallengeManagement from './pages/admin/ChallengeManagement';
import CommunityManagement from './pages/admin/CommunityManagement';
import Analytics from './pages/admin/Analytics';
import SystemSettings from './pages/admin/SystemSettings';

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<MainDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-complete" element={<SignupComplete />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/community" element={<Community />} />
      <Route path="/challenge" element={<Challenge />} />
      <Route path="/heartrate" element={<HeartRateCheck />} />
      <Route path="/rest-test" element={<RestTypeTest />} />
      <Route path="/rest-record" element={<RestRecord />} />
      <Route path="/map" element={<MapPage />} />

      {/* Rest Category Routes */}
      <Route path="/rest/physical" element={<RestPhysical />} />
      <Route path="/rest/mental" element={<RestMental />} />
      <Route path="/rest/sensory" element={<RestSensory />} />
      <Route path="/rest/emotional" element={<RestEmotional />} />
      <Route path="/rest/social" element={<RestSocial />} />
      <Route path="/rest/nature" element={<RestNature />} />
      <Route path="/rest/creative" element={<RestCreative />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/places" element={<PlaceApproval />} />
      <Route path="/admin/challenges" element={<ChallengeManagement />} />
      <Route path="/admin/community" element={<CommunityManagement />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/settings" element={<SystemSettings />} />
    </Routes>
  );
}

export default App;
