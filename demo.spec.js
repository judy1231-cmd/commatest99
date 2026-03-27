const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // ── 1. 로그인 ──────────────────────────────────────────────
  await page.goto('http://192.168.0.15:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.fill('input[type="text"], input[placeholder*="아이디"], input[placeholder*="이메일"]', 'judy1231');
  await page.waitForTimeout(500);
  await page.fill('input[type="password"]', 'sarang@1231');
  await page.waitForTimeout(500);
  await page.click('button[type="submit"], button:has-text("로그인")');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // ── 2. 휴식 유형 진단 이동 ────────────────────────────────
  await page.goto('http://192.168.0.15:3000/rest-test');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 인트로 스크롤
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // 진단 시작
  await page.click('button:has-text("진단 시작하기")');
  await page.waitForTimeout(1500);

  // ── 3. 12문항 응답 ────────────────────────────────────────
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1200);

    // JS로 직접 선택지 3번째 버튼 클릭 (React 이벤트 트리거)
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')].filter(b =>
        b.className.includes('w-full') && b.className.includes('text-left')
      );
      if (buttons.length >= 3) buttons[2].click();
      else if (buttons.length > 0) buttons[buttons.length - 1].click();
    });
    await page.waitForTimeout(1000);

    // 다음/결과보기 버튼 활성화 대기
    await page.waitForFunction(() => {
      const btn = [...document.querySelectorAll('button')].find(b =>
        (b.textContent.includes('다음') || b.textContent.includes('결과')) && !b.disabled
      );
      return !!btn;
    }, { timeout: 8000 });

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b =>
        (b.textContent.includes('다음') || b.textContent.includes('결과')) && !b.disabled
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
  }

  // ── 4. 로딩 & 결과 ───────────────────────────────────────
  await page.waitForTimeout(3000);

  // 결과 페이지 스크롤
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  console.log('✅ 휴식유형진단 완료');
  // 브라우저는 닫지 않고 유지
})();
