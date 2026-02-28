import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const FIELD_OPTIONS = [
  { key: 'art',    label: '미술·드로잉', emoji: '🎨', desc: '손으로 그리고 만들기' },
  { key: 'music',  label: '음악',        emoji: '🎵', desc: '듣거나 연주하거나' },
  { key: 'write',  label: '글쓰기',      emoji: '✍️', desc: '생각을 문장으로' },
  { key: 'cook',   label: '요리·베이킹', emoji: '🍳', desc: '맛있게 만들고 먹기' },
  { key: 'craft',  label: '공예·DIY',    emoji: '🧶', desc: '손끝으로 만드는 것들' },
];

const TIME_OPTIONS = [
  { key: 'short',  label: '30분',  emoji: '⚡' },
  { key: 'medium', label: '1시간', emoji: '🕐' },
  { key: 'long',   label: '반나절', emoji: '🌅' },
];

const CREATIVE_PLACES = [
  { name: '드로잉 유튜브 따라하기', location: '집에서', desc: '준비물: 스케치북과 연필 하나. 30분이면 한 장 완성', field: ['art'], time: ['short','medium'], tags: ['드로잉', '무료', '집에서'], icon: 'brush', color: '#F97316' },
  { name: '수채화 원데이클래스', location: '홍대·성수동', desc: '강사와 함께 2시간. 완성작을 집에 가져갈 수 있어', field: ['art'], time: ['long'], tags: ['수채화', '원데이', '초보가능'], icon: 'palette', color: '#f97316' },
  { name: '피아노 연습 (유튜브)', location: '집에서', desc: '악보 없이 코드만으로 팝송 배우기. 30분도 충분', field: ['music'], time: ['short','medium'], tags: ['피아노', '유튜브', '혼자'], icon: 'piano', color: '#6366f1' },
  { name: '재즈바 라이브 감상', location: '이태원·홍대', desc: '연주를 들으며 영감 충전. 악기 없이도 음악적 충전 가능', field: ['music'], time: ['medium','long'], tags: ['재즈', '라이브', '분위기'], icon: 'music_note', color: '#8b5cf6' },
  { name: '에세이 쓰기 (메모앱)', location: '카페·집 어디서든', desc: '오늘 하루 인상적인 장면 하나 200자로 써보기', field: ['write'], time: ['short'], tags: ['에세이', '200자', '즉시가능'], icon: 'edit', color: '#0891b2' },
  { name: '북카페에서 독서+글쓰기', location: '동네 북카페', desc: '책 읽고 느낀 점 노트에 쓰기. 생각이 정리되는 느낌', field: ['write'], time: ['long'], tags: ['북카페', '독서', '글쓰기'], icon: 'menu_book', color: '#14b8a6' },
  { name: '간단한 집밥 요리', location: '집에서', desc: '레시피 보며 파스타·볶음밥 도전. 만들고 먹으면 행복', field: ['cook'], time: ['medium'], tags: ['집밥', '파스타', '성취감'], icon: 'restaurant', color: '#10b981' },
  { name: '베이킹 클래스', location: '동네 베이킹 스튜디오', desc: '마카롱·쿠키·케이크 만들기. 달콤한 결과물이 기다려', field: ['cook'], time: ['long'], tags: ['베이킹', '마카롱', '선물용'], icon: 'cake', color: '#f43f5e' },
  { name: '도자기 공방 체험', location: '성수동·이태원', desc: '흙을 손으로 빚는 촉각적 집중. 완성된 작품은 소유 가능', field: ['craft'], time: ['long'], tags: ['도자기', '공방', '촉각'], icon: 'water_drop', color: '#b45309' },
  { name: '뜨개질·자수 입문', location: '집에서·공방', desc: '바늘 잡는 법부터 유튜브로. 반복 동작이 명상처럼 작용', field: ['craft'], time: ['medium','long'], tags: ['뜨개질', '자수', '집중'], icon: 'texture', color: '#8b5cf6' },
];

const activities = [
  {
    title: '미술 전시회 관람',
    desc: '말 없는 대화, 작가의 시선을 따라가보세요.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAodHKFi8pl6dpNOEfqfChRCsltjZH-oeoO0DYq-tUYyMEEmU5uPw5rFPdHxhWWbY2SZjpSh0dKPKfZASNu1EhENkSHS0_pe3Ae0yTS0Nmgd-4gcSweT3TgGYV-2A7L8GCq51P1PsBdyNEQ65vtpLWikF9BREkMWytua6K93_bcWGYFbqk8c5q3Sf38F9IpUxhgb_seknk_TegT1rmHx8zRFbBU3j9-7M1gXpMUujDcGSY-Ea9Qcwr4yKUkEZCuNyc2hIHzd7JoSZw',
  },
  {
    title: '단순한 창작 활동',
    desc: '결과물보다 과정에 집중하는 손놀림의 즐거움.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuAgKbF4JkaMjOCVIEkHJgwUZYZcxs52ZLxRgjgP8B2H2ITwepY9gpcZXr2n4hbJRMFw_em7ToZPVILRnpZKMd4GNkbep7K8-j4V7ZIcMbpmN9sfxxGYM78DKTAFQDmlL9G91BTiCwNT6SuHBPB4ViOHo4NCQJDix9wO12wsNWtL2ApZ-vgVndI5ub9KVf4CVnv2VJBQDSTFH7KHgSDw1kU-wqu0iFZLrtdUSl-kc5C1FX-IMHf3jzSH7IM0QQJtnz6TZ1iZQqpsk',
  },
  {
    title: '자연의 미학 관찰',
    desc: '나뭇잎의 결과 하늘의 색채를 가만히 바라보기.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs4ReVCuJDGwZdH4bGhDXHWWxJCUNmfNB8tHev0wNaLMwYBqZ4Rdj-SKJNECdojh0WNqXtx8g3LByhxWqMXXmo-dicCLrWATUDH0_TuZBr1NGbRqglA5ZjtrNUgzO_5Pp8cxe8SV4an_oDR1d0Yqr8p0g4noFYAiodMRFrXDe6yc0gkOUVTYieAGDjVnVzLpZ4-tsXuX4b-2u0rm4jiGQbouaW4B9aghqw4GCulo30gWKSZ0RV9odA-Q0y5kiZo1OLxAKvweSIdK0',
  },
];

const places = [
  { name: '국립현대미술관 (MMCA)', location: '서울특별시 종로구 삼청로 30', tags: ['미술', '산책'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS6DTNYuClfzjtJ3_KH8Jh9OKgqLbQc_6aILj9Vwi2NgaPG6WdMhQcm_pXTDGs5psilRvRu8gdWMPoeWaJpRk2YxbQaT8GH4VrYvjrQBNh0cbhGAkqJxbvMdUEMnJRkFVt5Gfvb0J7pqgXFDaxr-SVoEOLEfx8WKy3xLHGqiGv_lVrFxz_xEMPbKH0dPaJ-JCR7U38wnNFQcxBXrplIlkDJfuMcq7H8bqBVhKgjzv8qAeZE2x1lzC_pA4GjvkzA3FNq6k73eC8E' },
  { name: "성수동 도자기 공방 '흙과 빛'", location: '서울특별시 성동구 성수동', tags: ['공예', '원데이클래스'], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUTpqDR5c82O_ETRkCkEZnONo1I_8NlxQImaVwRW2vGQn9a_zDeC1M0BvqsWxrOtC2m7Qa6X9pAV7jJAgOSRBHfB0d2phiYrkIXtydr_DiRzcgX5EIKKrInQQ67PaROHqdrYBFjQAi0JXz4wgYcsMIwQ8nxhzJYeiLwRzsl_Dn9s1WVS_ciP-uIst_PjZ753WCXL7LQ_paTHfhki2ZPeS3bt9VBEc1ks2nutTjkqCwpYOiA9-eO_KCaUMCvuxnFQEebn8PX73rONE' },
];

const checklist = [
  '새로운 아이디어가 전혀 떠오르지 않음',
  '반복되는 일상이 견디기 힘들 만큼 지루함',
  '아름다운 것을 봐도 무감각하고 건조함',
  '작업에 대한 성취감보다 의무감이 더 큼',
];

function RestCreative() {
  const [field, setField] = useState('art');
  const [timeOpt, setTimeOpt] = useState('short');
  const filteredPlaces = CREATIVE_PLACES.filter(
    p => p.field.includes(field) && p.time.includes(timeOpt)
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-[1200px] mx-auto px-6 py-12 md:px-10 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-green-600 mb-10 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="mb-20">
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 min-h-[450px] flex flex-col justify-center items-center text-center p-8">
            <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-gradient-to-br from-green-100 to-gray-100" />
            <img
              alt="창조적 몰입"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3VlTBTZAgR99kObl5Uv_J58gbsCN7qdnIYbCEfU4Easq3nV0giNwMKQNMBApeNptcns_JLTOWORPfD3RbWOLPd32zbFgSZWu-2U_Es2ylXfHlot0ee7eTVkvsIclY5-3NTxSioFIMw9wGpVpflILRQ7mqN19YvSKmiM4XlI69moFSerJeXf4Mt8W5F1gglcTRxMV0UL-U13KOaDfui691nTJID8gOLve5G5W9SZrUaMbx71sNXhEMqdXvAWBrzQC1jVtlZcvaKns"
            />
            <div className="relative z-10 max-w-2xl">
              <span className="mb-4 inline-block rounded-full bg-white/80 px-4 py-1 text-sm font-bold tracking-widest text-green-600 uppercase">Shuimpyo Creative Rest</span>
              <h2 className="mb-6 text-4xl md:text-6xl font-bold tracking-tight text-gray-900">창조적 몰입</h2>
              <p className="text-lg md:text-xl leading-relaxed text-gray-700">성취와 압박에서 벗어나 아름다움을 감상하며<br className="hidden md:block" />창의적인 영감을 채우는 시간입니다.</p>
            </div>
          </div>
        </section>

        {/* Status + Effects */}
        <section className="mb-24">
          <div className="mb-10 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-3xl">psychology</span>
            <h3 className="text-2xl font-bold">상태 및 효과</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:border-green-200 transition-all">
              <div className="mb-6 h-48 w-full overflow-hidden rounded-xl">
                <img
                  alt="Burnout"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN66wo8HXGgbvkMqYAB7-_ZIlqRnzPwEmlsovj8_8VkAVQMPZw9nWj6zDaLsoP6xPq6wBJFTTVhpTO5xhb-MABqkwNRT7HO6nZSrRlzMtOujHZRU7OP-qWqqwpWzUUezxR-49DuUHWOVwJAVR44Zjp5sYsEUZAG0xzQBQtgSq-VuIhjUSH0EgVQigfueb5u8DNIG4W_Loa7k3o035bD21uf4DHhYJM-0Y-ma_Vkg8B8eOl6XH-PN3aj4JxFDf1sV4gFfYElEmxlNY"
                />
              </div>
              <h4 className="mb-3 text-xl font-bold text-gray-900">크리에이티브 번아웃이란?</h4>
              <p className="text-gray-600 leading-relaxed">창의적 에너지가 고갈되어 새로운 아이디어가 떠오르지 않고 일상이 무채색으로 느껴지는 상태입니다. 이는 단순히 피로한 것이 아니라, 영감이 마른 상태를 의미합니다.</p>
            </div>
            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:border-green-200 transition-all">
              <div className="mb-6 h-48 w-full overflow-hidden rounded-xl">
                <img
                  alt="Flow effect"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZXoOndl5OLL2-iHVd76-w8tkk9lsY5yuANamfJ2SHcE5Fy4YWAww5Q9e4awiEZWnzGpE-n4WVkDwak6uh1zg_U2mtehv479Kg71RadBUM6zIjXeZwtVDz4lGdDL7iltsyGWQL0rnsTatTmLaUb8uLZNqsxfZY6IkrhrrYcg5F3W7zc2oy1VHnNt6MVCplZcNX5op2xD77CAsKPjD4clsNKQAb0BHS6GPGyCFhJdUTcqc_xrXdccUixyMWdJmgla4Zy_y2qOc4GuY"
                />
              </div>
              <h4 className="mb-3 text-xl font-bold text-gray-900">몰입의 긍정적 효과</h4>
              <p className="text-gray-600 leading-relaxed">인지적 유연성이 향상되고 일상의 소소한 즐거움을 다시 발견하게 됩니다. 비워진 마음에 새로운 아이디어가 자연스럽게 흘러드는 경험을 할 수 있습니다.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Activities + Places + Checklist */}
          <div className="lg:col-span-2 space-y-24">
            <section>
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">추천 활동</h3>
                <p className="text-gray-500">오늘 당신의 영감을 깨울 작은 움직임들</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {activities.map((act, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                      <img alt={act.title} className="h-full w-full object-cover hover:scale-110 transition-transform" src={act.img} />
                    </div>
                    <p className="font-bold">{act.title}</p>
                    <p className="text-sm text-gray-500 leading-snug">{act.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">공간 추천</h3>
                <p className="text-gray-500">영감이 머무는 장소들</p>
              </div>
              <div className="space-y-4">
                {places.map((place, i) => (
                  <div key={i} className="flex items-center gap-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                      <img alt={place.name} className="h-full w-full object-cover" src={place.img} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{place.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{place.location}</p>
                      <div className="flex gap-2">
                        {place.tags.map((tag, j) => (
                          <span key={j} className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-600">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-green-400 p-2">map</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== 오늘 어떤 창작 활동을 할까요? ===== */}
            <section className="mb-16">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800">오늘 어떤 창작 활동을 할까요?</h3>
                <p className="text-gray-500 mt-2">분야와 시간을 선택하면 딱 맞는 활동을 추천해줄게요</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-bold text-slate-600 mb-3">창작 분야</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {FIELD_OPTIONS.map(opt => (
                    <button key={opt.key} onClick={() => setField(opt.key)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${field === opt.key ? 'bg-orange-500 border-orange-500 text-white' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                      <div className="text-2xl mb-2">{opt.emoji}</div>
                      <p className="font-bold text-xs">{opt.label}</p>
                      <p className={`text-[10px] mt-1 ${field === opt.key ? 'text-white/80' : 'opacity-70'}`}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-bold text-slate-600 mb-3">소요 시간</p>
                <div className="flex gap-3">
                  {TIME_OPTIONS.map(opt => (
                    <button key={opt.key} onClick={() => setTimeOpt(opt.key)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${timeOpt === opt.key ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                      <span>{opt.emoji}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPlaces.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <span className="text-4xl mb-3 block">🎨</span>
                  <p className="text-slate-500 font-medium">이 조건에 맞는 활동을 준비 중이에요</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlaces.map((place, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${place.color}20` }}>
                          <span className="material-icons text-base" style={{ color: place.color }}>{place.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                          <p className="text-xs text-slate-400">{place.location}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{place.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {place.tags.map((tag, j) => (
                          <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${place.color}15`, color: place.color }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <a href="/map?restType=creative" className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">
                  <span className="material-icons text-base">map</span>
                  지도에서 창작 공간 찾기
                </a>
              </div>
            </section>

            <section className="rounded-2xl bg-green-50 p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">영감이 메마른 신호</h3>
                <p className="text-green-700">당신의 마음은 지금 어떤가요?</p>
              </div>
              <div className="space-y-4">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-4 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded text-green-600 focus:ring-green-400 border-green-300" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-12">
            <div className="rounded-2xl bg-white p-6 shadow-xl border border-green-100">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500">auto_awesome</span>
                  AI Pick
                </h4>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Daily Suggest</span>
              </div>
              <div className="space-y-6">
                <div className="group relative overflow-hidden rounded-xl bg-gray-900 p-4">
                  <img
                    alt="Lo-fi"
                    className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-110 transition-transform"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjZItbHpSY-jHufmV1vFZ8OEewhqBYXriqUlWLj4ELwYsOIbKdIb24fp2Hqv6H6Y5ozmWE2a3bgSw11j61f7fAwyTW8FPofv_qTPq5rPh2wtSowsnSmt2r08H8_P9Ga_sdMXO12QqFKpEzlAiUJ3AUdgg0pbOnk_i51KVXtonN0EbZsmjeyhLsHIMGd1bBFexXKJYP-Hhj1JcpngroQTXWWrDmUYPFt65-IUb000INWvUwMJpmIB6I-rfdlu5s8W1io5lYb7AE3dA"
                  />
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-green-300 uppercase tracking-widest">Lo-fi Playlist</p>
                    <h5 className="text-white font-bold text-lg mb-4 leading-tight">숲속의 작업실에서<br />집중하는 시간</h5>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <div className="h-4 w-1 bg-green-400 rounded-full animate-pulse" />
                        <div className="h-6 w-1 bg-green-400 rounded-full" />
                        <div className="h-3 w-1 bg-green-400 rounded-full" />
                      </div>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-900">
                        <span className="material-symbols-outlined">play_arrow</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Process Video</p>
                  <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-200">
                    <img
                      alt="Art process"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3XByAN_K8P8D1b-HWc0sxG0T6wv4qQMmD9emXYg6TCc0KcWTEaT98ZFSX10RtskPMkJnK5kG3CCRIJNonpcjwqznSmT7AQ1c_e41Hcf8C5mQ51cu5Kya2aCmBdydvCXDVE-IkRXb2w6n78J_omMc2KHSRW2ZhOrxnYJBunwTvNeZBEL3GHbrCsjDZZfNGNaF2GKD3XfN9xcKmu7HNtiMMloI-hSI1EtX6_kh7VcxnXQjCqG6MSWP0YLHgGKF5BLGYLFJJHRYD334"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold">오일 파스텔로 그리는 초록</p>
                </div>

                <div className="relative py-6 px-4 text-center">
                  <p className="text-lg font-medium italic text-gray-800 leading-relaxed">
                    "창조성은 휴식에서 태어납니다. 비워야 채울 수 있습니다."
                  </p>
                  <p className="mt-4 text-xs text-gray-400 font-bold">— Shuimpyo Curator</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold">커뮤니티 소식</h4>
                <Link to="/community" className="text-xs text-green-600 font-bold hover:underline">더보기</Link>
              </div>
              <div className="space-y-4">
                {[
                  { user: '@morning_dew', time: '1시간 전', content: '오늘 삼청동 갤러리 다녀왔어요.' },
                  { user: '@creative_soul', time: '3시간 전', content: '아무 생각 없이 색칠하기 추천합니다!' },
                ].map((post, i) => (
                  <div key={i} className={`flex gap-4 items-start ${i > 0 ? 'border-t border-gray-100 pt-4' : ''}`}>
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{post.content}</p>
                      <p className="text-xs text-gray-400">{post.user} · {post.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default RestCreative;
