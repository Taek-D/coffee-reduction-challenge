# 출시 전 점검 수정 설계

Date: 2026-03-03
Status: Approved
Approach: 3단계 순차 수정 (Critical → TDS 도입 → Warning)

## 목적

출시 전 종합 점검 보고서에서 발견된 5 FAIL + 8 WARNING을 수정하여 앱인토스 검수 통과 가능성을 높인다.

## Phase 1: Critical 수정 (텍스트/인코딩/에러 처리)

### C1. 파일 인코딩 통일

4개 파일이 EUC-KR(cp949)로 되어 있어 UTF-8로 변환:
- `src/pages/PremiumPage.tsx`
- `src/pages/MonthlyReportPage.tsx`
- `src/pages/QuarterlyReportPage.tsx`
- `src/pages/RoutineTemplatesPage.tsx`

### C2. 해요체 불일치 수정

- PremiumPage:77 `"결제는 앱인토스 런타임에서만 가능합니다."` → `"결제는 앱인토스 런타임에서만 가능해요."`

### C3. PRD 메시지 불일치 수정 (5곳)

| 파일:라인 | 현재 | PRD 원문 |
|-----------|------|----------|
| PremiumPage:79 | "다시 시도해 주세요." | "다시 시도해요." |
| MonthlyReportPage:94 | "다시 시도해 주세요." | "다시 시도해요." |
| QuarterlyReportPage:133 | "다시 시도해 주세요." | "다시 시도해요." |
| MonthlyReportPage:128 | "기록을 많이 남길수록 분석이 정확해져요." | "기록이 더 쌓이면 분석이 정확해져요." |
| QuarterlyReportPage:170 | "기록을 많이 남길수록 분석이 정확해져요." | "기록이 더 쌓이면 분석이 정확해져요." |

### C4. Report 데이터 로드 에러 처리

MonthlyReportPage/QuarterlyReportPage의 useEffect 내 load()에 try/catch 추가.
실패 시 Toast: "리포트를 불러오지 못했어요. 다시 시도해요." (PRD 원문)

## Phase 2: TDS 컴포넌트 도입

### 설치

- `@emotion/react` peer dependency 추가
- `TDSMobileProvider` 앱 래핑

### 교체 대상

| 기존 | TDS 컴포넌트 |
|------|-------------|
| `.btn.primary` / `.btn.secondary` / `.btn.danger` | `Button` variant="primary/secondary/danger" |
| 커스텀 ToastContext | TDS `useToast` |
| `.skeleton-box` | TDS `Skeleton` |
| `<input>` (GoalSetupPage, TodayPage) | TDS `TextField` |

### 비교체 대상

- `.card`, `.screen`, `.form` 레이아웃 CSS — TDS에 직접 대응 없음, 유지
- `.calendar-grid`, `.counter-row` — 커스텀 레이아웃, 유지

## Phase 3: Warning 수정

### W1. IAP non-success 이벤트 처리

`appsInToss.ts:196-198` — cancel/fail 이벤트 시 reject 처리

### W2. 접근성 aria-label 추가

- TodayPage +/- 버튼
- CalendarPage 캘린더 셀

### W3. 에러 핸들링 추가 (4페이지)

- OnboardingPage handleStart/handleSkip
- GoalSetupPage handleSave
- SettingsPage handleReset
- RoutineTemplatesPage useEffect

### W4. SettingsPage 로딩 상태

loading state + TDS Skeleton 표시

### W5. processProductGrant 문서화

코드 주석으로 현재 동작과 복원 플로우 보완 관계 명시
