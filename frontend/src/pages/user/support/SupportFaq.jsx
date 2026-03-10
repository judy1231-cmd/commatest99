import { useState } from 'react';
import UserNavbar from '../../../components/user/UserNavbar';

const CATEGORIES = ['전체', '서비스 이용', '계정', '진단', '기타'];

const FAQ_LIST = [
  {
    category: '서비스 이용',
    question: '쉼표(,) 서비스는 어떻게 이용하나요?',
    answer: '쉼표는 심박수 측정과 설문을 통해 나의 스트레스 상태를 진단하고, 그에 맞는 휴식 활동과 장소를 추천해주는 서비스예요. 진단 → 추천 → 기록 → 통계 순으로 이용할 수 있어요.',
  },
  {
    category: '서비스 이용',
    question: '휴식 기록은 어떻게 남기나요?',
    answer: '상단 메뉴의 [휴식 콘텐츠] > [휴식 기록]에서 기록을 추가할 수 있어요. 휴식 유형, 시작/종료 시간, 메모, 감정 점수를 함께 기록하면 나중에 통계로 확인할 수 있어요.',
  },
  {
    category: '서비스 이용',
    question: '감정 기록은 어떤 용도인가요?',
    answer: '매일의 감정 상태를 1~10점으로 기록하고, 태그와 메모를 추가할 수 있어요. 기간별 감정 변화를 통계 차트로 확인해 자신의 감정 흐름을 파악하는 데 도움이 돼요.',
  },
  {
    category: '서비스 이용',
    question: '추천 장소/활동이 마음에 들지 않으면 어떻게 하나요?',
    answer: '진단 결과에 따라 추천이 달라지기 때문에, 심박 측정과 설문을 다시 진행하면 다른 추천 결과를 받을 수 있어요. 추천 기록은 [추천 기록] 메뉴에서 확인할 수 있어요.',
  },
  {
    category: '계정',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 화면 하단의 [비밀번호 찾기]를 클릭해주세요. 가입한 이메일로 인증 코드를 보내드리며, 코드 확인 후 새 비밀번호로 변경할 수 있어요.',
  },
  {
    category: '계정',
    question: '이메일을 변경할 수 있나요?',
    answer: '현재 이메일 변경 기능은 제공되지 않아요. 이메일 변경이 필요하다면 기존 계정을 탈퇴 후 새 이메일로 재가입해주세요.',
  },
  {
    category: '계정',
    question: '소셜 로그인(카카오/구글)으로 가입하면 비밀번호가 있나요?',
    answer: '소셜 로그인으로 가입한 계정은 별도의 비밀번호가 설정되지 않아요. 로그인 시 카카오 또는 구글 계정 인증을 사용하며, 비밀번호 변경 기능을 이용할 수 없어요.',
  },
  {
    category: '계정',
    question: '회원 탈퇴 후 데이터는 어떻게 되나요?',
    answer: '회원 탈퇴 즉시 모든 데이터(진단 기록, 휴식 기록, 감정 기록, 통계 등)가 삭제되며 복구가 불가능해요. 탈퇴 전에 필요한 데이터를 미리 확인해주세요.',
  },
  {
    category: '진단',
    question: '심박 측정은 어떤 기기로 할 수 있나요?',
    answer: '현재 Apple Watch와 Galaxy Watch를 지원해요. Apple Watch는 단축어 앱을 통해, Galaxy Watch는 Google Fit 연동을 통해 심박수 데이터를 전송할 수 있어요. 기기가 없는 경우 설문만으로도 진단이 가능해요.',
  },
  {
    category: '진단',
    question: '진단 결과는 어디서 확인하나요?',
    answer: '진단 완료 후 결과 페이지에서 바로 확인할 수 있어요. 이전 진단 결과는 [진단 기록] 메뉴에서 언제든지 다시 볼 수 있어요.',
  },
  {
    category: '진단',
    question: '진단 결과가 항상 같게 나와요. 왜 그런가요?',
    answer: '설문 응답 패턴이 비슷할 경우 동일한 유형이 나올 수 있어요. 심박 측정을 함께 사용하거나, 현재 상태에 맞게 솔직하게 응답하면 더 다양한 결과를 받을 수 있어요.',
  },
  {
    category: '기타',
    question: '서비스 이용 중 오류가 발생하면 어떻게 하나요?',
    answer: '페이지를 새로고침하거나 로그아웃 후 다시 로그인해보세요. 문제가 지속된다면 하단의 문의하기를 통해 알려주시면 빠르게 처리해드릴게요.',
  },
  {
    category: '기타',
    question: '쉼표 서비스는 무료인가요?',
    answer: '네, 현재 쉼표의 모든 기능은 무료로 이용할 수 있어요. 향후 프리미엄 기능이 추가될 수 있으며, 변경 사항은 사전에 공지해드릴게요.',
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-100 last:border-none">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <div className="flex items-start gap-3">
          <span className="text-primary font-bold text-sm mt-0.5 shrink-0">Q</span>
          <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
            {item.question}
          </span>
        </div>
        <span
          className="material-icons text-slate-400 shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="flex items-start gap-3 pb-4">
          <span className="text-slate-400 font-bold text-sm shrink-0">A</span>
          <p className="text-sm text-slate-500 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function SupportFaq() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = activeCategory === '전체'
    ? FAQ_LIST
    : FAQ_LIST.filter((f) => f.category === activeCategory);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setOpenIndex(null);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">자주 묻는 질문</h1>
          <p className="text-sm text-slate-400 mt-0.5">궁금한 점을 빠르게 찾아보세요</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ 아코디언 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 mb-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-300">
              <span className="material-icons text-4xl mb-2 block">help_outline</span>
              <p className="text-sm">해당 카테고리의 질문이 없어요.</p>
            </div>
          ) : (
            filtered.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))
          )}
        </div>

        {/* 문의하기 안내 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-icons text-primary text-2xl">mail_outline</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 mb-0.5">더 궁금한 점이 있으신가요?</p>
            <p className="text-xs text-slate-400">
              원하는 답변을 찾지 못하셨다면 이메일로 문의해주세요.
            </p>
            <a
              href="mailto:support@comma.com"
              className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-1.5 hover:underline"
            >
              support@comma.com
              <span className="material-icons text-xs">open_in_new</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SupportFaq;
