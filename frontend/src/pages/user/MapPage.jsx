import UserNavbar from '../../components/user/UserNavbar';

const places = [
  { name: '서울 숲 거울연못', category: '숲/공원', rating: 4.8, distance: '1.2km', desc: '도심 속 힐링 산책로', icon: 'park', color: 'bg-soft-mint text-emerald-600' },
  { name: '다도 공간 \'휴\'', category: '카페/서점', rating: 4.9, distance: '0.8km', desc: '고요한 전통 다도 체험', icon: 'local_cafe', color: 'bg-warm-beige text-amber-600' },
  { name: '난지 한강공원', category: '워터사이드', rating: 4.7, distance: '3.5km', desc: '넓은 잔디밭과 한강 뷰', icon: 'water', color: 'bg-pale-blue text-blue-600' },
  { name: '북촌 한옥마을', category: '문화/역사', rating: 4.6, distance: '2.1km', desc: '조선 시대 고즈넉한 골목길', icon: 'museum', color: 'bg-accent-pink text-rose-600' },
];

const categories = ['전체', '숲/공원', '카페/서점', '워터사이드', '문화/역사', '스파/힐링'];

function MapPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <UserNavbar />
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="장소 또는 카테고리 검색"
                type="text"
              />
            </div>
          </div>
          {/* Categories */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((cat, i) => (
                <button key={i} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Place List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {places.map((place, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${place.color} flex items-center justify-center shrink-0`}>
                    <span className="material-icons">{place.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 truncate">{place.name}</h3>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="material-icons text-amber-400 text-sm">star</span>
                        <span className="text-xs font-bold text-slate-600">{place.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-primary font-medium">{place.category}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{place.desc}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span className="material-icons text-[12px]">near_me</span>
                      {place.distance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-100 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <span className="material-icons text-6xl mb-4 block">map</span>
            <p className="font-semibold">지도 영역</p>
            <p className="text-sm">Kakao Map / Naver Map 연동 예정</p>
          </div>
          {/* Map Overlay Pins */}
          {places.map((place, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-xl px-3 py-2 shadow-hover border border-slate-200 flex items-center gap-2 cursor-pointer hover:shadow-lg transition-all"
              style={{ top: `${20 + i * 20}%`, left: `${25 + i * 15}%` }}
            >
              <span className={`material-icons text-sm ${place.color.split(' ')[1]}`}>{place.icon}</span>
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{place.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
