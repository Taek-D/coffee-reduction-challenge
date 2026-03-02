# 출시 전 종합 점검 보고서

**날짜:** 2026-03-03
**프로젝트:** 커피 줄이기 챌린지 (Apps-in-Toss)
**점검 범위:** 코드 품질 + 비게임 출시 체크리스트 15항목 + 정책 준수 + IAP + UI 상태 커버리지

---

## 점검 요약

| 영역 | PASS | WARN | FAIL | 비고 |
|------|------|------|------|------|
| 1. 코드 품질 자동 검증 | 4 | 0 | 0 | typecheck/lint/test/build 모두 통과 |
| 2. 비게임 출시 체크리스트 | 13 | 2 | 0 | #4 TDS 미사용, #5 접근성 |
| 3. 카피/문구 정책 | 6 | 0 | 1 | 해요체 불일치 1곳 |
| 4. 다크패턴 방지 | 5 | 0 | 0 | 전 항목 통과 |
| 5. IAP/결제 플로우 | 9 | 3 | 0 | 3개 RISK |
| 6. 빈상태/에러/로딩 | 3 | 3 | 4 | PRD 메시지 4/8 불일치 |
| **합계** | **40** | **8** | **5** | |

---

## 1. 코드 품질 자동 검증

| 명령 | 결과 | 비고 |
|------|------|------|
| `npm run typecheck` | PASS | 오류 없음 |
| `npm run lint` | PASS | 경고/오류 없음 |
| `npm run test` | PASS | 6 files, 10 tests 통과 |
| `npm run build` | PASS | JS 226.21kB (gzip 71.92kB), CSS 3.10kB (gzip 1.25kB) |

---

## 2. 비게임 출시 체크리스트 (15항목)

| # | 항목 | 판정 | 근거 |
|---|------|------|------|
| 1 | 라이트 모드 고정 | **PASS** | `index.html:10` color-scheme=light, `index.css:5` color-scheme:light, 다크모드 미디어쿼리 없음 |
| 2 | 핀치줌 비활성화 | **PASS** | `index.html:7-9` maximum-scale=1.0, user-scalable=no |
| 3 | 내비게이션 바 | **PASS** | `granite.config.ts:6-8` displayName + icon 설정 |
| 4 | 전반 서비스 | **WARNING** | Storage SDK 연동 PASS. **@toss/tds-mobile이 dependencies에 있으나 src/에서 import하지 않음** — 커스텀 CSS만 사용. 검수 시 TDS 미사용 지적 가능 |
| 5 | 접근성 | **WARNING** | TabBar/Toast에 aria 속성 있음. **TodayPage +/- 버튼, CalendarPage 날짜 셀에 aria-label 없음.** `.btn` padding이 44px 미만일 수 있음 |
| 6 | 앱 내 기능/딥링크 | **PASS** | PRD 12개 라우트 전부 정의, catch-all → / 리다이렉트 |
| 7 | 토스 로그인 | **PASS** | 온보딩 후 로그인 요청, 약관 링크 제공, userKey 기반 데이터 분리 |
| 8 | 토스페이 | **PASS** | 해당 없음 (IAP 사용) |
| 9 | 인앱결제 | **PASS** | 상품 조회/결제/에러/복원/기기변경 모두 구현 |
| 10 | 프로모션 | **PASS** | 현금성/환금성 이벤트 없음 |
| 11 | 기능성 메시지 | **PASS** | MVP 미사용 |
| 12 | 인앱광고 | **PASS** | 광고 SDK 없음 |
| 13 | 앱 사용 권한 | **PASS** | `granite.config.ts` permissions: [] |
| 14 | 데이터/메모리 | **PASS** | setInterval 미사용, setTimeout cleanup 적절, 메모리 누수 패턴 없음 |
| 15 | 보안 | **PASS** | eval/innerHTML 없음, 시크릿 하드코딩 없음, console.log는 DEV 모드 가드 |

---

## 3. 카피/문구 정책

| 카테고리 | 판정 | 비고 |
|----------|------|------|
| 건강/의학 표현 | **PASS** | 금지 표현 없음 |
| 보장/확정 표현 | **PASS** | 금지 표현 없음 |
| 자동연동 오해 표현 | **PASS** | 통장/잔액/계좌 없음 |
| 외부 링크 | **PASS** | 외부 URL 없음 (SVG namespace만) |
| 해요체 일관성 | **FAIL** | `PremiumPage.tsx:77` — `"가능합니다"` (합니다체) → `"가능해요"` (해요체)로 수정 필요 |
| 절감 표현 검증 | **PASS** | 모든 절감 금액에 "기록 기반 추정" 또는 "예상" 면책 표기 있음 |
| Casual honorific | **PASS** | ~시겠어요/~십시오 없음 |

---

## 4. 다크패턴 방지 (5항목)

| # | 항목 | 판정 | 근거 |
|---|------|------|------|
| 1 | 진입 시 바텀시트 금지 | **PASS** | BottomSheet 자동 호출 없음 |
| 2 | 뒤로가기 인터럽트 금지 | **PASS** | onBeforeUnload/useBlocker/Prompt 없음 |
| 3 | 나갈 수 있는 선택지 | **PASS** | "무료로 계속 쓰기" 동등 크기 버튼 존재 (`PremiumPage.tsx:122-131`) |
| 4 | 예상치 못한 광고 금지 | **PASS** | 광고 SDK 없음 |
| 5 | CTA 명확성 | **PASS** | 모든 버튼이 다음 행동을 명확히 표현 (30개+ 버튼 전수 확인) |

---

## 5. IAP/결제 코드 리뷰

### 정상 항목 (OK)

| 항목 | 근거 |
|------|------|
| SKU 정의 | `premium.ts:16-31` — premium_30d (1,900원), premium_365d (14,900원) |
| 상품 목록 조회 | `appsInToss.ts:130-153` — 에러 시 fallback 정상 |
| 주문 생성 | `appsInToss.ts:155-222` — settled 가드, cleanup, 에러 전파 |
| 이용권 중첩 | `premium.ts:106-110` — 기존 만료 전 재구매 시 기간 연장 (올바름) |
| 만료 체크 | `premium.ts:56-93` — isPremiumActive, normalizePremiumStatus |
| 기능 잠금 | Report/Template 페이지에서 isPremiumActive 확인 후 리다이렉트 |
| 만료 메시지 | `premium.ts:122-138` — "만료됨" 표시 |
| 앱 재진입 복원 | `AppContext.tsx:58-67` — ready 시 restorePendingPremiumOrders 호출 |
| 복원 로직 | `premiumService.ts:98-150` — 미결 주문 처리, 중복 방지 |
| 지급 실패 롤백 | `premiumService.ts:87-90` — 이전 상태로 복원 |
| PremiumPage 에러 처리 | `PremiumPage.tsx:73-83` — Toast + analytics |
| completeProductGrant | `appsInToss.ts:237-252` — try/catch, 로컬 dev true 반환 |

### RISK 항목 (3개)

**RISK-1: processProductGrant가 무조건 true 반환**
- 위치: `appsInToss.ts:193`
- 문제: SDK에 "지급 완료"를 알리지만 실제 PremiumStatus 저장은 이후에 발생. 앱 크래시 시 SDK는 지급 완료로 간주하나 로컬 상태 미저장.
- 영향: 복원 플로우(restorePendingPremiumOrders)가 보완하므로 실질적 위험은 낮음.
- 권장: processProductGrant 콜백 내에서 PremiumStatus 저장을 수행하거나, 최소한 이 동작을 문서화.

**RISK-2: 비성공 IAP 이벤트가 무시됨**
- 위치: `appsInToss.ts:196-198`
- 문제: `event.type !== 'success'`인 이벤트(cancel, fail 등)가 무시됨. SDK가 onError 대신 non-success 이벤트를 발생시키면 Promise가 영원히 settle되지 않아 UI가 "결제창을 여는 중..." 상태로 멈춤.
- 권장: 타임아웃 메커니즘 추가하거나, cancel/fail 이벤트 타입을 명시적으로 처리.

**RISK-3: 낙관적 상태 저장 (지급 완료 전)**
- 위치: `premiumService.ts:78-86`
- 문제: PremiumStatus 저장 → completeIapProductGrant 호출 순서. 실패 시 롤백하지만, 앱 크래시 시 로컬 상태와 플랫폼 상태 불일치 가능.
- 영향: 복원 플로우가 보완하므로 실질적 위험은 낮음.

---

## 6. 빈상태/에러/로딩 커버리지

### 페이지별 결과

| 페이지 | 로딩 | 빈상태 | 에러 | PRD 메시지 | 판정 |
|--------|------|--------|------|-----------|------|
| OnboardingPage | N/A | N/A | **FAIL** | N/A | handleStart/handleSkip에 try/catch 없음 |
| LoginPage | PASS | N/A | PASS | N/A | PASS |
| GoalSetupPage | PASS | N/A | **FAIL** | N/A | handleSave에 try/catch 없음 |
| TodayPage | PASS | PASS | PASS | **PASS** | 완벽 |
| CalendarPage | PASS | PASS | PASS | **PASS** | 완벽 |
| PremiumPage | PASS | N/A | WARN | **WARN** | 구매 실패 Toast 문구 불일치 |
| MonthlyReportPage | PASS | WARN | **FAIL** | **FAIL** | 빈상태/PDF 문구 불일치, 데이터 로드 에러 처리 없음 |
| QuarterlyReportPage | PASS | WARN | **FAIL** | **FAIL** | MonthlyReport와 동일 문제 |
| RoutineTemplatesPage | PASS | N/A | **FAIL** | N/A | premium 상태 확인 에러 처리 없음 |
| SettingsPage | **FAIL** | N/A | PASS | N/A | 로딩 상태 없음, handleReset try/catch 없음 |
| TermsPage | N/A | N/A | N/A | N/A | 정적 콘텐츠 |
| PrivacyPage | N/A | N/A | N/A | N/A | 정적 콘텐츠 |

### PRD 메시지 일치 현황

| PRD 지정 메시지 | 코드 실제 메시지 | 판정 |
|----------------|-----------------|------|
| TodayPage 빈상태: "오늘 기록이 없어요. 한 번만 눌러서 시작해요." | 일치 | **PASS** |
| TodayPage 에러: "저장에 실패했어요. 다시 시도해요." | 일치 | **PASS** |
| CalendarPage 빈상태: "기록이 쌓이면 패턴을 보여드려요." | 일치 | **PASS** |
| CalendarPage 공유 실패: "공유에 실패했어요. 다시 시도해요." | 일치 | **PASS** |
| PremiumPage 결제 실패: "결제에 실패했어요. 다시 시도해요." | "다시 시도해 **주세요**." | **FAIL** |
| ReportPage 빈상태: "기록이 더 쌓이면 분석이 정확해져요." | "기록을 많이 남길수록 분석이 정확해져요." | **FAIL** |
| ReportPage 에러: "리포트를 불러오지 못했어요. 다시 시도해요." | **미구현** (try/catch 없음) | **FAIL** |
| PDF 저장 실패: "PDF 저장에 실패했어요. 다시 시도해요." | "다시 시도해 **주세요**." | **FAIL** |

---

## 발견 사항 요약

### Critical (출시 블로커는 아니나 수정 강력 권장)

1. **@toss/tds-mobile 미사용** — dependencies에 선언했지만 실제 import 없음. 검수 시 TDS 컴포넌트 미사용 지적 가능
2. **해요체 불일치** — `PremiumPage.tsx:77` "가능합니다" → "가능해요"
3. **Report 데이터 로드 에러 미처리** — MonthlyReportPage/QuarterlyReportPage의 useEffect에 try/catch 없음
4. **PRD 메시지 불일치 4곳** — "다시 시도해 주세요" vs "다시 시도해요", 빈상태 문구 차이

### Warning (권장 수정)

5. **IAP non-success 이벤트 무시** — cancel/fail 이벤트 시 Promise 미결로 UI 멈춤 가능
6. **접근성 부분 미비** — +/- 버튼, 캘린더 셀에 aria-label 없음
7. **에러 핸들링 누락** — OnboardingPage, GoalSetupPage, SettingsPage, RoutineTemplatesPage의 async 호출에 try/catch 없음
8. **SettingsPage 로딩 상태 없음** — 데이터 로드 중 기본값 노출
9. **processProductGrant 무조건 true** — SDK 의도와 다를 수 있음 (복원 플로우로 보완됨)
10. **파일 인코딩 불일치** — 4개 파일이 EUC-KR (PremiumPage, MonthlyReport, QuarterlyReport, RoutineTemplates)

### Good (잘된 점)

- 다크패턴 방지 5항목 완벽 준수
- 건강/의학/보장/자동연동 금지 표현 0건
- 절감 금액 모든 곳에 "기록 기반 추정" 면책 표기
- TodayPage/CalendarPage 빈상태/에러/로딩 완벽 처리
- IAP 복원/롤백/만료/중첩 로직 견고
- 메모리 누수 패턴 없음, 보안 이슈 없음
- 빌드 크기 합리적 (gzip 73kB)

---

## 샌드박스 검증 시나리오 (실기기 테스트 가이드)

### 필수 시나리오

| # | 시나리오 | 확인 사항 |
|---|---------|----------|
| A | 신규 사용자 온보딩 | 3스크린 순서대로 진행, "나중에" 시 기본값으로 시작 |
| B | 토스 로그인 | appLogin 성공/실패, userKey 획득, 약관 표시 |
| C | 목표/기준 저장 | 범위 밖 값 입력 시 에러, 저장 성공 시 /today 이동 |
| D | 오늘 기록 | +/- 탭 즉시 반영, 단가 수정, 앱 재진입 후 값 유지 |
| E | 달력/요약 | 월 이동, 날짜 선택, 기록 없는 월 빈상태 문구 |
| F | IAP 결제 성공 | 상품 목록 표시 → 결제 → PremiumStatus 갱신 → 기능 잠금 해제 |
| G | IAP 결제 실패 | 에러 Toast 표시, UI 복원 |
| H | IAP 미결 주문 복원 | 결제 후 앱 종료 → 재진입 시 자동 복원 |
| I | IAP 만료 | 프리미엄 만료 후 기능 잠금, "만료됨" 표시, 재구매 가능 |
| J | PDF 저장 | saveBase64Data 성공/실패 Toast |
| K | 설정 > 초기화 | 2단계 확인 → 데이터 삭제 → 기본값 재생성 |
| L | 정책 점검 | 전 화면 라이트모드/핀치줌/외부링크 없음/결제 강요 없음 확인 |

### 주의 사항

- 시나리오 F-I는 반드시 앱인토스 샌드박스 환경에서 실행
- 시나리오 J는 실기기에서 saveBase64Data SDK 동작 확인 필요
- 시나리오 B의 userKey 자동 획득은 서버 엔드포인트 설정 여부에 따라 동작이 다름
