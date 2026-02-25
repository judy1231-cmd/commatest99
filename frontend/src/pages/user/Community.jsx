import { useState } from 'react';
import UserNavbar from '../../components/user/UserNavbar';

const posts = [
  {
    author: '김지한', tag: '신체적 휴식', tagColor: 'bg-soft-mint text-emerald-700',
    time: '2시간 전 • 서울 숲', title: '도심 속에서 찾은 완벽한 오후의 숲멍',
    content: '오늘은 점심 시간을 이용해 근처 공원에 다녀왔어요. 바람 소리와 나뭇잎 흔들리는 소리만으로도 충분한 휴식이 되네요.',
    likes: 124, comments: 18,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn8a4RvTgzi3b-bkgK5Fcry1BqTGBeth9Cem5eMGbtg_7iiTNJFwHKeHMRgZ1qb17nfA_uyEtdUpLSwQVrTpANynahEq_muKn9dhbZNg1c7IGDAjtMWKWjm7-EBnBSy1k73T5CmwFEbblepK4aJVW0qcxf-RK5EEXZwJrBlEd2nutDJQncEyMKA_ZUZjOcODr7MlpXkUYzt3QPaXlTA4fc-QVLzwjb6fuaKfcnIlx_k4wI--sTQo8nh44xjB-Oj-NZpf5HN9fupiI',
  },
  {
    author: '이지은', tag: '감각적 휴식', tagColor: 'bg-pale-blue text-blue-700',
    time: '5시간 전 • 홈 스윗 홈', title: '비 오는 날, 따뜻한 차 한 잔과 독서',
    content: '비가 와서 나가지 않고 집에서 온전히 나만의 시간을 보냈어요. 따뜻한 얼그레이 향이 방 안 가득 퍼지는 이 순간이 진정한 감각적 휴식인 것 같아요.',
    likes: 89, comments: 12,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBti-wG2cCvXTNRM14BHYPCY8GAA94NO6quZNtPC9Yib9kFi3BZLXQDHwHL6Rms-eomVbKTQH5LBAX5ksNA21lMTkgTc4OkS1UecSaliw93h37WI-3qBQSvuvWu7mYOqX6WZanLEJrCRh_OZoh32mKk1Ycyo4GCBW1g6L0qBX-atRjjEWBWwP4jV7a5IXBvM5d0xcLO5XpPZ9K593t8IZk1DzwVRNNVharMgsSLEmtfV3DljJZ5WxfiknfmEW4-kxgXWSrfUWaS1nE',
  },
];

const hotPlaces = [
  { name: '청평호 산책길', info: '리뷰 240+ • 신체적 휴식', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1p7_BZVLDjI8RVIzB-EfgaL7Ysl4b3S1mI1eEbaumkMj0eKcVxZSpRoyTQJcwJ5GguGENQZZAdoIO9-quuqrZY3-KhjjMNv0hLmsLuEySKlnr92En6LLGW16Gm6u4j4Uj5YEsE7EN9Aw6KaBm4oTCV-QIi5DyMaQuIY0FoQDbvgr2Z9T9HpgoYMj3fz6r4MlJvR-Se2ASQ3WbIK1e7P0cUFnkLvid-hJV7eJYQhHKcXmevPVdu8hf9qEtYiM5ce508NjY8LxJ8cs' },
  { name: '침묵의 스테이 \'결\'', info: '리뷰 150+ • 정신적 휴식', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUf8qZrYHa8LwF4lPLT1s_ZP1lDiKZQ0Ouy0BzLIsjJtsuT36tuLUU1pZWEovBEcRtDzm_Qs8MeZ9jdDSgS18GbwicDcboWbF3o3Br_9gbNBNPbZcQKXzAOCwe-Y1HXC9kuu6grrH5jDKQzs_hzJMUN_uKo4mX3wW-i493KtMUr5pNqosmob3EsY60mlPIUgt66Qhl95fAFZzsuuhGMDONFEspj4QSzpiHiug_oq4UbT8bn3efscZdBOVQjntSXu7ejqzna18AQLE' },
  { name: '오션뷰 카페 루노', info: '리뷰 410+ • 감각적 휴식', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbk7oYJie4aphcaz39R1zMdV5KAhp-kNDyd0-eR7SmGU5pnaRFi5HGjTqrhn9iMNFB_Ycsb7DcqTDkjvwifJ5oay-mg-8thUJZE81_XW18IEAc0qhpTPHZJklqA6neKs97XTRRsBbVCQ1um13p304YdX4UWsDvv9FyeATmujEeGbq6eZND2786IzfqJVDABUtIIDnwog_q1A5Utlvi2cmcOoR177VoUmp3Yj_0rwhKvxjFrvqDEcbiUtwzMWVkFSRgpQ2z4Tlgrp8' },
];

function Community() {
  const [sort, setSort] = useState('latest');

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-12 gap-10 pb-24 md:pb-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 space-y-8">
          <div className="flex flex-col gap-1.5">
            <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">카테고리</p>
            {[
              { icon: 'grid_view', label: '전체보기', active: true },
              { icon: 'wb_sunny', label: '신체적 휴식' },
              { icon: 'self_improvement', label: '정신적 휴식' },
              { icon: 'visibility_off', label: '감각적 휴식' },
              { icon: 'favorite', label: '감정적 휴식' },
              { icon: 'forum', label: '사회적 휴식' },
            ].map((item, i) => (
              <button key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors w-full ${item.active ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
          <button className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-xl">edit</span>
            <span className="text-sm">글쓰기</span>
          </button>
        </aside>

        {/* Feed */}
        <section className="col-span-12 md:col-span-9 lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-slate-800">인기 휴식 피드</h1>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setSort('latest')} className={`text-xs px-4 py-1.5 rounded-md font-medium transition-all ${sort === 'latest' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>최신순</button>
              <button onClick={() => setSort('popular')} className={`text-xs px-4 py-1.5 rounded-md font-medium transition-all ${sort === 'popular' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>인기순</button>
            </div>
          </div>
          <div className="space-y-8">
            {posts.map((post, i) => (
              <article key={i} className="bg-white border border-[#F0F2F0] rounded-[24px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all group">
                <div className="p-6 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden ring-2 ring-slate-50 flex items-center justify-center">
                    <span className="material-icons text-slate-400">person</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[15px] text-slate-800">{post.author}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${post.tagColor}`}>{post.tag}</span>
                    </div>
                    <p className="text-[12px] text-slate-400">{post.time}</p>
                  </div>
                  <button className="ml-auto text-slate-300 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
                <div className="px-6 pb-4">
                  <h2 className="text-lg font-bold mb-2.5 text-slate-800 group-hover:text-[#4ADE80] transition-colors leading-snug">{post.title}</h2>
                  <p className="text-[14px] text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
                </div>
                <div className="mx-6 mb-6 rounded-2xl overflow-hidden h-72">
                  <img alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" src={post.img} />
                </div>
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                  <div className="flex gap-6">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                      <span className="material-symbols-outlined text-[22px]">favorite</span>
                      <span className="text-[13px] font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#4ADE80] transition-colors">
                      <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                      <span className="text-[13px] font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <button className="text-slate-400 hover:text-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[22px]">bookmark</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8">
          <div className="bg-white border border-[#F0F2F0] rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ADE80] text-xl">trending_up</span>
              <span className="text-sm">실시간 핫플레이스</span>
            </h3>
            <div className="space-y-5">
              {hotPlaces.map((place, i) => (
                <div key={i} className="flex gap-3.5 items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    <img alt={place.name} className="w-full h-full object-cover" src={place.img} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[14px] font-bold text-slate-800 truncate group-hover:text-[#4ADE80] transition-colors">{place.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{place.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-soft-mint/60 border border-green-100/50 rounded-3xl p-6 relative overflow-hidden">
            <h3 className="font-bold text-[13px] text-green-700 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              오늘의 휴식 팁
            </h3>
            <p className="text-[13.5px] leading-[1.6] text-slate-600">
              "20-20-20 규칙: 20분마다 20피트 밖을 20초간 바라보세요. 디지털 기기로 지친 시각 신경을 위한 최고의 휴식입니다."
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Community;
