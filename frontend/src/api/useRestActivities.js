import { useState, useEffect } from 'react';

/**
 * 특정 휴식 유형의 활동 목록을 API에서 불러오는 커스텀 훅
 * GET /api/rest-types → typeName 매칭으로 ID 획득
 * GET /api/rest-types/{id}/activities → 활동 목록 반환
 */
export function useRestActivities(typeName) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const typesRes = await fetch('/api/rest-types');
        const typesData = await typesRes.json();
        if (!typesData.success || cancelled) return;

        const matched = typesData.data.find(t => t.typeName === typeName);
        if (!matched) return;

        const actsRes = await fetch(`/api/rest-types/${matched.id}/activities`);
        const actsData = await actsRes.json();
        if (!cancelled && actsData.success) {
          setActivities(actsData.data || []);
        }
      } catch {
        // 서버 미연결 시 빈 목록 유지
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [typeName]);

  return { activities, loading };
}
