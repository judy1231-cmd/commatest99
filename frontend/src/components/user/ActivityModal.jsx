import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 활동 ID → YouTube 검색 쿼리 매핑
const YOUTUBE_QUERIES = {
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
};

function ActivityModal({ activity, typeColor, typeName, onClose }) {
  const navigate = useNavigate();

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const query = YOUTUBE_QUERIES[activity.id] || `${activity.activityName} relaxation guide`;
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&index=0`;
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
        {/* 핸들 바 (모바일) */}
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

        {/* 유튜브 iframe */}
        <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={activity.activityName}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* 가이드 내용 + 버튼 */}
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

          {/* YouTube 직접 보기 링크 */}
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 mb-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <span className="material-icons text-[18px] text-red-500">play_circle</span>
            YouTube에서 더 보기
          </a>

          {/* 기록하기 */}
          <button
            onClick={handleRecord}
            className="w-full py-4 rounded-2xl text-white font-bold text-[15px] shadow-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
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
