import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const places = [
  { name: '조용한 숲속 북카페', category: '카페/독서', location: '서울 종로구', submitter: 'admin_seoul', date: '2023.10.24', status: '대기', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlkWXkQeEdsN3rMbEq-HJoAWXbm_heXj0lDotkOIIjTSe-pZt2eul98AjGvgtnd732G4g2aBUabGuHOpsjpJT10IoeI8RGLYbWM0geVdd4naFyqxM9kVql1oNkrql7qKYSSH_KCqP8-icc4I9yK6T0U8Io5aUiPGh4sNJvozK_JK4x2_jfHanVCm0G2WBY5GyFeIPwEzhRIvTsY9ikPHrD72ariDFiVnLPaJW_EfoD8EmXI6v-SUMNPfGTBj0P48ISouBCD68cVcQ' },
  { name: '명상 스테이 \'고요\'', category: '숙박/명상', location: '강원 평창군', submitter: 'peace_maker', date: '2023.10.23', status: '대기', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo' },
  { name: '도심 속 작은 정원', category: '공원', location: '서울 성동구', submitter: 'city_nature', date: '2023.10.22', status: '승인', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4' },
];

function PlaceApproval() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="장소 승인 관리" subtitle="등록 신청된 휴식 장소를 검토하고 승인하세요." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '승인 대기', value: '45', color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: '이번 달 승인', value: '128', color: 'text-primary', bg: 'bg-accent-mint' },
              { label: '이번 달 반려', value: '12', color: 'text-red-500', bg: 'bg-red-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-5 border border-slate-200`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((place, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-44 overflow-hidden">
                  <img alt={place.name} className="w-full h-full object-cover" src={place.img} />
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${place.status === '대기' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {place.status}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{place.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-accent-mint text-teal-600 text-[11px] font-bold rounded-full">{place.category}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="material-icons-round text-[12px]">location_on</span>
                      {place.location}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    <span>신청자: {place.submitter}</span> · <span>{place.date}</span>
                  </div>
                  {place.status === '대기' && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all">승인</button>
                      <button className="flex-1 py-2 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-all">반려</button>
                    </div>
                  )}
                  {place.status === '승인' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <span className="material-icons-round text-lg">check_circle</span>
                      승인 완료
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PlaceApproval;
