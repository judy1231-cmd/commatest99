import { useNavigate } from 'react-router-dom';

function MypageHome() {
  const navigate = useNavigate();
  // /my 로 리다이렉트
  navigate('/my', { replace: true });
  return null;
}

export default MypageHome;
