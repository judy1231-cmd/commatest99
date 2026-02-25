import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-black text-4xl">,</span>
        </div>
        <h1 className="text-6xl font-black text-slate-800 mb-3">404</h1>
        <p className="text-slate-500 text-lg mb-2">페이지를 찾을 수 없어요</p>
        <p className="text-slate-400 text-sm mb-8">주소가 잘못되었거나 삭제된 페이지예요.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <span className="material-icons text-lg">home</span>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
