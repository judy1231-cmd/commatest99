/**
 * 사용자 행동 이벤트 수집 유틸
 * - 실패해도 조용히 무시 (서비스 영향 없음)
 */
export async function trackEvent(eventType, data = {}) {
  try {
    const token = localStorage.getItem('accessToken');
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ eventType, data }),
    });
  } catch {
    // 무시
  }
}

export function trackPageView(pageName) {
  trackEvent('page_view', { page: pageName });
}
