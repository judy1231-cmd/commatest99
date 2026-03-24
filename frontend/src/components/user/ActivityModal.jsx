import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const YOUTUBE_QUERIES = {
  ko: {
    1:  '전신 스트레칭 15분 따라하기',
    2:  '가벼운 산책 걷기 명상',
    3:  '하타 요가 초보 20분',
    4:  '명상 10분 가이드',
    5:  '4 7 8 호흡법 불안 완화',
    6:  '차 마시기 힐링 명상',
    7:  '디지털 디톡스 스마트폰 끄기',
    8:  '눈 감고 쉬기 바디스캔 이완',
    9:  '아로마테라피 에센셜오일 힐링',
    10: '감정 일기 쓰기 정서 치유',
    11: '스트레스 해소 힐링 음악',
    12: '소중한 사람과 대화 관계',
    13: '친구와 수다 힐링 일상',
    14: '혼자 카페 가기 힐링',
    15: '보드게임 소모임 즐기기',
    16: '공원 산책 자연 힐링',
    17: '등산 초보 힐링 자연',
    18: '숲 속 힐링 삼림욕 자연치유',
    19: '그림 그리기 취미 힐링 초보',
    20: '자유 글쓰기 일기 감정 치유',
    21: '요리 베이킹 힐링 따라하기',
  },
  en: {
    1:  'full body stretch routine 15 minutes',
    2:  'mindful walking meditation relaxation',
    3:  'hatha yoga beginner 20 minutes',
    4:  'guided meditation 10 minutes calm',
    5:  '4 7 8 breathing technique anxiety relief',
    6:  'tea meditation mindfulness relaxing',
    7:  'digital detox mindfulness screen free',
    8:  'eyes closed body scan relaxation',
    9:  'aromatherapy essential oils relaxation guide',
    10: 'journaling for mental health emotions',
    11: 'relaxing music therapy stress relief',
    12: 'meaningful conversation connection wellbeing',
    13: 'social connection friendship wellbeing',
    14: 'cafe ambience relaxing music study',
    15: 'board games fun social group',
    16: 'park walking nature therapy mindfulness',
    17: 'hiking nature therapy mental health',
    18: 'forest bathing shinrin yoku healing',
    19: 'drawing for relaxation beginners art therapy',
    20: 'free writing journaling therapy mental health',
    21: 'relaxing cooking baking therapy satisfying',
  },
};

function ActivityModal({ activity, typeColor, typeName, onClose }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState('ko');

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const query = YOUTUBE_QUERIES[lang][activity.id] || activity.activityName;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  const handleRecord = () => {
    onClose();
    navigate('/rest-record', {
      state: {
        prefill: {
          restType: typeName,
          activityName: activity.activityName,
          duration: activity.durationMinutes,
        }
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
            >
              {activity.durationMinutes}분
            </span>
            <h3 className="text-[17px] font-extrabold text-slate-800">{activity.activityName}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span className="material-icons text-slate-500 text-[18px]">close</span>
          </button>
        </div>

        {/* 언어 토글 */}
        <div className="flex items-center gap-2 px-5 mb-3">
          <span className="text-[11px] text-slate-400 font-semibold">영상 언어</span>
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            <button
              onClick={() => setLang('ko')}
              className={`px-3 py-1.5 text-[12px] font-bold transition-colors ${
                lang === 'ko' ? 'text-white' : 'bg-white text-slate-400'
              }`}
              style={lang === 'ko' ? { backgroundColor: typeColor } : {}}
            >
              🇰🇷 한국어
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-[12px] font-bold transition-colors ${
                lang === 'en' ? 'text-white' : 'bg-white text-slate-400'
              }`}
              style={lang === 'en' ? { backgroundColor: typeColor } : {}}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* YouTube 검색 카드 */}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mx-5 mb-1 rounded-2xl overflow-hidden relative group"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)' }}
        >
          <div className="flex flex-col items-center justify-center py-9 gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-[15px] mb-1">{activity.activityName} 영상 보기</p>
              <p className="text-white/50 text-[12px]">
                {lang === 'ko' ? '🇰🇷 한국어 영상 검색 열기 →' : '🇺🇸 English video search →'}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: typeColor }} />
        </a>

        {/* 가이드 + 기록하기 */}
        <div className="px-5 py-4">
          {activity.guideContent && (
            <div
              className="flex gap-2 rounded-xl px-4 py-3 mb-4"
              style={{ backgroundColor: `${typeColor}0d`, borderLeft: `3px solid ${typeColor}` }}
            >
              <span className="material-icons text-sm shrink-0 mt-0.5" style={{ color: typeColor }}>tips_and_updates</span>
              <p className="text-[13px] text-slate-600 leading-relaxed">{activity.guideContent}</p>
            </div>
          )}

          <button
            onClick={handleRecord}
            className="w-full py-4 rounded-2xl text-white font-bold text-[15px] transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ backgroundColor: typeColor, boxShadow: `0 8px 20px ${typeColor}40` }}
          >
            <span className="material-icons text-[18px]">edit_note</span>
            이 활동으로 휴식 기록하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityModal;
