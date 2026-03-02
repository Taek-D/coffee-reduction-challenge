# 출시 전 종합 점검 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 앱인토스 비게임 출시 체크리스트 15항목을 중심으로 코드를 실제 스캔하여 PASS/FAIL/WARNING 판정 보고서를 작성한다.

**Architecture:** 7개 점검 영역을 병렬 에이전트로 동시 실행하고, 결과를 단일 보고서로 통합한다. 모든 판정은 코드 근거(파일:라인) 기반이며 추측하지 않는다.

**Tech Stack:** grep/glob/read 기반 코드 스캔, npm run typecheck/lint/test/build 실행

---

### Task 1: 코드 품질 자동 검증

**Purpose:** typecheck, lint, test, build 4개 명령을 실행하여 현재 코드 상태를 확인한다.

**Step 1: 4개 검증 명령 실행**

```bash
cd "E:/프로젝트/앱인토스/커피 줄이기 챌린지"
npm run typecheck
npm run lint
npm run test
npm run build
```

각 명령의 성공/실패 여부와 출력을 기록한다.

**Step 2: 빌드 결과물 크기 기록**

```bash
ls -la dist/assets/
```

JS/CSS 파일 크기(raw + gzip)를 기록한다.

**판정 기준:**
- 4개 모두 PASS → PASS
- 1개라도 FAIL → FAIL (출시 블로커)
- 경고만 있음 → WARNING

---

### Task 2: 비게임 출시 체크리스트 스캔 (항목 1-5)

**Purpose:** 시스템 모드, 핀치줌, 내비게이션 바, 전반 서비스, 접근성 점검

**Files to check:**
- `index.html` — viewport meta, color-scheme
- `src/index.css` — color-scheme, 다크모드 미디어쿼리
- `granite.config.ts` — appName, brand, webViewProps
- `src/app/components/TabBar.tsx` — 터치 영역
- `src/app/layout/MainLayout.tsx` — 레이아웃 구성

**Step 1: #1 라이트 모드 고정 확인**

```
확인 대상:
- index.html: <meta name="color-scheme" content="light">
- src/index.css: color-scheme: light
- 다크모드 미디어쿼리(@media (prefers-color-scheme: dark)) 부재 확인
```

**Step 2: #2 핀치줌 비활성화 확인**

```
확인 대상:
- index.html: <meta name="viewport" ... maximum-scale=1.0, user-scalable=no>
```

**Step 3: #3 내비게이션 바 확인**

```
확인 대상:
- granite.config.ts: brand.displayName, brand.icon 설정
- webViewProps 설정
```

**Step 4: #4 전반 서비스 확인**

```
확인 대상:
- 번들 크기 → 2초 내 로드 가능한지 추정
- Storage 로직 → 재접속 시 데이터 유지
- TDS 컴포넌트 사용 여부
```

**Step 5: #5 접근성 확인**

```
확인 대상:
- 버튼/터치 영역 최소 44x44px 여부
- 명도 대비 (CSS 색상값 확인)
- aria-label, role 등 스크린 리더 지원
```

---

### Task 3: 비게임 출시 체크리스트 스캔 (항목 6-10)

**Purpose:** 앱 내 기능, 토스 로그인, 인앱결제, 프로모션 점검

**Files to check:**
- `src/app/routes.tsx` — 라우팅, 딥링크, 뒤로가기
- `src/pages/LoginPage.tsx` — 로그인 플로우
- `src/state/AppContext.tsx` — userKey 관리
- `src/infra/appsInToss.ts` — IAP API
- `src/infra/premiumService.ts` — 결제 비즈니스 로직
- `src/pages/PremiumPage.tsx` — 결제 UI

**Step 1: #6 앱 내 기능 확인**

```
확인 대상:
- 딥링크 경로 (PRD 섹션 7과 routes.tsx 매핑)
- 뒤로가기 → 메인(/today) 복귀 로직
- catch-all 라우트 (*) → / 리다이렉트
```

**Step 2: #7 토스 로그인 확인**

```
확인 대상:
- 서비스 소개(온보딩) 후 로그인 요청 (인트로 없이 곧바로 금지)
- 약관 동의 화면 존재
- 로그인 끊기 대응 (userKey 기반 데이터 분리)
- 닫기 → 이전 화면 복귀
```

**Step 3: #8 토스페이 — N/A 확인**

```
확인 대상:
- 토스페이 관련 코드 부재 확인 (디지털 상품 → IAP 사용)
```

**Step 4: #9 인앱결제 확인**

```
확인 대상:
- 상품 목록 조회 (getProductItemList)
- 결제 성공/실패 처리
- 에러 안내 (Toast)
- 내역 확인 경로 (설정 화면)
- 기기 변경 시 데이터 유지 (userKey + PremiumStatus)
- 구독 불가 → 소모성 아이템 사용 확인
```

**Step 5: #10 프로모션 확인**

```
확인 대상:
- 현금성/환금성 이벤트 코드 부재 확인
- 포인트/리워드 관련 코드 부재 확인
```

---

### Task 4: 비게임 출시 체크리스트 스캔 (항목 11-15)

**Purpose:** 기능성 메시지, 인앱광고, 앱 권한, 데이터/메모리, 보안 점검

**Files to check:**
- `granite.config.ts` — permissions
- `package.json` — 의존성
- `src/` 전체 — 광고 SDK, 권한 요청 코드

**Step 1: #11-12 기능성 메시지/인앱광고 — N/A 확인**

```
확인 대상:
- 푸시/메시지 관련 코드 부재 확인
- 광고 SDK (ad, admob, banner 등) 부재 확인
```

**Step 2: #13 앱 사용 권한 확인**

```
확인 대상:
- granite.config.ts permissions: [] (빈 배열)
- 카메라/위치/마이크 등 권한 요청 코드 부재
```

**Step 3: #14 데이터/메모리 확인**

```
확인 대상:
- 번들 크기 (Task 1에서 확인한 값)
- setInterval/setTimeout 미정리 (메모리 누수 패턴)
- 이벤트 리스너 미해제
- 대량 데이터 메모리 로드 패턴
```

**Step 4: #15 보안 확인**

```
확인 대상:
- 개인정보 수집 범위 (userKey만)
- 민감 데이터 로깅 여부
- eval/innerHTML 사용 여부
- 하드코딩된 시크릿/API 키 부재
```

---

### Task 5: 카피/문구 정책 스캔

**Purpose:** src/ 전체의 한국어 문구에서 앱인토스 금지 표현을 검색한다.

**Step 1: 건강/의학 표현 검색**

```bash
grep -rn "치료\|진단\|개선\|중독\|건강\|카페인.*효과\|의학\|의료" src/
```

**Step 2: 보장/확정 표현 검색**

```bash
grep -rn "보장\|확실\|반드시\|틀림없\|절대\|무조건" src/
```

**Step 3: 자동연동 오해 표현 검색**

```bash
grep -rn "통장\|잔액\|계좌\|카드.*내역\|자동.*연동" src/
```

**Step 4: 외부 링크 검색**

```bash
grep -rn "https\?://" src/ index.html
```

허용 목록(static.toss.im 등)을 제외하고 외부 URL이 있는지 확인.

**Step 5: 밈/유행어/비속어 검색**

```bash
# 수동 확인: 모든 사용자 대면 문구를 추출하여 검토
grep -rn "해요\|이에요\|할까요\|했어요" src/pages/ src/app/
```

해요체 일관성 확인.

---

### Task 6: 다크패턴 방지 정책 점검

**Purpose:** PRD 섹션 6의 다크패턴 방지 5항목을 코드에서 확인한다.

**Files to check:**
- `src/pages/OnboardingPage.tsx` — 진입 시 바텀시트
- `src/app/routes.tsx` — 뒤로가기 인터럽트
- `src/pages/PremiumPage.tsx` — 무료 선택지, CTA 텍스트

**Step 1: 5개 항목 코드 확인**

각 항목별로 해당 코드를 읽고 PASS/FAIL 판정:
1. 온보딩/메인 진입 시 BottomSheet 자동 호출 없음
2. 라우팅에서 뒤로가기 차단/인터럽트 없음
3. PremiumPage에 "무료로 계속 쓰기" 동등 버튼 존재
4. 광고 코드 없음
5. 모든 CTA 버튼 텍스트가 다음 행동을 예측 가능

---

### Task 7: IAP/결제 코드 리뷰

**Purpose:** 구매→지급→복원→만료 전체 플로우를 코드 레벨에서 추적한다.

**Files to check:**
- `src/domain/premium.ts` — 플랜 정의, 만료 체크
- `src/infra/appsInToss.ts` — SDK 래퍼
- `src/infra/premiumService.ts` — 비즈니스 플로우
- `src/pages/PremiumPage.tsx` — 구매 UI
- `src/state/AppContext.tsx` — 미결 주문 복원 트리거

**Step 1: 플로우 추적**

```
1. 상품 조회: getIapProductList → SKU 매핑 확인
2. 주문 생성: createIapOrder → 에러 핸들링 확인
3. 지급 완료: completeIapProductGrant → PremiumStatus 갱신 확인
4. 미결 복원: getPendingIapOrders → AppContext 재진입 시 호출 확인
5. 만료 체크: expires_at 비교 로직 확인
```

**Step 2: 에러 시나리오 확인**

```
- 결제 실패 시 Toast + 사유 안내
- 지급 실패 시 롤백 (PremiumStatus 초기화)
- 네트워크 오류 시 graceful 처리
```

---

### Task 8: 빈상태/에러/로딩 커버리지

**Purpose:** 모든 페이지에서 3가지 예외 상태(로딩/빈상태/에러) 처리 여부를 확인한다.

**Files to check:**
- `src/pages/*.tsx` — 모든 페이지 컴포넌트

**Step 1: 페이지별 확인 테이블 작성**

| 페이지 | 로딩 | 빈상태 | 에러 | PRD 문구 일치 |
|--------|------|--------|------|--------------|
| OnboardingPage | ? | ? | ? | ? |
| LoginPage | ? | ? | ? | ? |
| GoalSetupPage | ? | ? | ? | ? |
| TodayPage | ? | ? | ? | ? |
| CalendarPage | ? | ? | ? | ? |
| PremiumPage | ? | ? | ? | ? |
| MonthlyReportPage | ? | ? | ? | ? |
| QuarterlyReportPage | ? | ? | ? | ? |
| RoutineTemplatesPage | ? | ? | ? | ? |
| SettingsPage | ? | ? | ? | ? |

각 페이지를 읽고 ?를 PASS/FAIL/N-A로 채운다.

---

### Task 9: 보고서 통합 및 작성

**Purpose:** Task 1-8의 결과를 단일 보고서로 통합한다.

**Step 1: 보고서 작성**

`docs/plans/2026-03-03-pre-launch-audit-report.md`에 다음 구조로 작성:

```markdown
# 출시 전 종합 점검 보고서

## 점검 요약
| 영역 | PASS | WARN | FAIL |

## 1-7. 각 영역별 상세 결과

## 발견 사항 요약
### Critical (출시 블로커)
### Warning (권장 수정)
### Good (잘된 점)

## 샌드박스 검증 시나리오
(실기기 테스트 가이드)
```

**Step 2: 결과 저장**

보고서를 저장하고 사용자에게 요약을 제시한다.
