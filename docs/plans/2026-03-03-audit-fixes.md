# 출시 전 점검 수정 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 출시 전 점검 보고서의 Critical 5건 + Warning 8건을 수정하여 앱인토스 검수 통과 가능성을 확보한다.

**Architecture:** Phase 1(텍스트/인코딩/에러 처리) → Phase 2(TDS 컴포넌트 도입) → Phase 3(Warning 수정) 순서로 진행. Phase 2는 @emotion/react(이미 설치됨) 기반 TDS 컴포넌트를 점진적으로 도입하되, 기존 레이아웃 CSS(.card, .screen 등)는 유지한다.

**Tech Stack:** React 18, TypeScript, Vite 7, @toss/tds-mobile 2.2.1, @emotion/react 11.14.0

---

## Phase 1: Critical 수정

### Task 1: 파일 인코딩 통일 (EUC-KR → UTF-8)

**Purpose:** 4개 파일이 cp949/EUC-KR 인코딩이라 일부 환경에서 문자가 깨진다. UTF-8로 변환한다.

**Files:**
- Modify: `src/pages/PremiumPage.tsx`
- Modify: `src/pages/MonthlyReportPage.tsx`
- Modify: `src/pages/QuarterlyReportPage.tsx`
- Modify: `src/pages/RoutineTemplatesPage.tsx`

**Step 1: Python 스크립트로 4개 파일을 cp949 → UTF-8 변환**

```bash
cd "E:/프로젝트/앱인토스/커피 줄이기 챌린지"
/c/Python313/python -c "
import os
files = [
    'src/pages/PremiumPage.tsx',
    'src/pages/MonthlyReportPage.tsx',
    'src/pages/QuarterlyReportPage.tsx',
    'src/pages/RoutineTemplatesPage.tsx',
]
for f in files:
    with open(f, 'rb') as fh:
        raw = fh.read()
    text = raw.decode('cp949')
    with open(f, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)
    print(f'Converted: {f}')
"
```

**Step 2: 변환 확인**

```bash
file src/pages/PremiumPage.tsx src/pages/MonthlyReportPage.tsx src/pages/QuarterlyReportPage.tsx src/pages/RoutineTemplatesPage.tsx
```

Expected: 모든 파일이 "UTF-8 text" 표시.

**Step 3: typecheck + build 확인**

```bash
npm run typecheck && npm run build
```

Expected: 에러 없음.

**Step 4: Commit**

```bash
git add src/pages/PremiumPage.tsx src/pages/MonthlyReportPage.tsx src/pages/QuarterlyReportPage.tsx src/pages/RoutineTemplatesPage.tsx
git commit -m "fix: convert 4 page files from cp949 to UTF-8 encoding"
```

---

### Task 2: 해요체 + PRD 메시지 불일치 수정

**Purpose:** 합니다체 1곳, "주세요" → "해요" 3곳, 빈상태 문구 2곳을 PRD 원문에 맞게 수정.

**Files:**
- Modify: `src/pages/PremiumPage.tsx`
- Modify: `src/pages/MonthlyReportPage.tsx`
- Modify: `src/pages/QuarterlyReportPage.tsx`

**Step 1: PremiumPage.tsx 수정 (2곳)**

변경 1 — 해요체 수정 (line 77):
```
Before: showToast('결제는 앱인토스 런타임에서만 가능합니다.');
After:  showToast('결제는 앱인토스 런타임에서만 가능해요.');
```

변경 2 — PRD 메시지 수정 (line 79):
```
Before: showToast('결제에 실패했어요. 다시 시도해 주세요.');
After:  showToast('결제에 실패했어요. 다시 시도해요.');
```

**Step 2: MonthlyReportPage.tsx 수정 (2곳)**

변경 1 — PDF 저장 실패 (line 94):
```
Before: showToast('PDF 저장에 실패했어요. 다시 시도해 주세요.');
After:  showToast('PDF 저장에 실패했어요. 다시 시도해요.');
```

변경 2 — 빈상태 문구 (line 128):
```
Before: {!state.hasData && <p className="muted">기록을 많이 남길수록 분석이 정확해져요.</p>}
After:  {!state.hasData && <p className="muted">기록이 더 쌓이면 분석이 정확해져요.</p>}
```

**Step 3: QuarterlyReportPage.tsx 수정 (2곳)**

변경 1 — PDF 저장 실패 (line 133):
```
Before: showToast('PDF 저장에 실패했어요. 다시 시도해 주세요.');
After:  showToast('PDF 저장에 실패했어요. 다시 시도해요.');
```

변경 2 — 빈상태 문구 (line 170):
```
Before: {!state.hasData && <p className="muted">기록을 많이 남길수록 분석이 정확해져요.</p>}
After:  {!state.hasData && <p className="muted">기록이 더 쌓이면 분석이 정확해져요.</p>}
```

**Step 4: typecheck 확인**

```bash
npm run typecheck
```

**Step 5: Commit**

```bash
git add src/pages/PremiumPage.tsx src/pages/MonthlyReportPage.tsx src/pages/QuarterlyReportPage.tsx
git commit -m "fix: align toast/empty-state messages with PRD wording"
```

---

### Task 3: Report 데이터 로드 에러 처리

**Purpose:** MonthlyReportPage/QuarterlyReportPage의 useEffect 내 load()에 try/catch를 추가하여, 데이터 로드 실패 시 PRD 메시지로 Toast를 표시한다.

**Files:**
- Modify: `src/pages/MonthlyReportPage.tsx`
- Modify: `src/pages/QuarterlyReportPage.tsx`

**Step 1: MonthlyReportPage.tsx useEffect 수정**

현재 코드 (lines 44-72):
```typescript
useEffect(() => {
    const load = async () => {
      setLoading(true);
      const premium = await getFreshPremiumStatus(repository, activeUserKey);
      // ... data loading ...
      setLoading(false);
    };

    void load();
  }, [activeUserKey, month, navigate, repository]);
```

수정 후:
```typescript
useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const premium = await getFreshPremiumStatus(repository, activeUserKey);
        if (!isPremiumActive(premium)) {
          navigate('/premium?entry=report_monthly', { replace: true });
          return;
        }

        const [entries, baselines] = await Promise.all([
          repository.listEntriesForMonth(activeUserKey, month),
          repository.getBaselines(activeUserKey),
        ]);
        const days = getDaysInMonth(month);
        const startDate = days[0];
        const endDate = days.at(-1) ?? `${month}-01`;
        const metrics = calculateReportMetrics(entries, (date) => resolveBaselineForDate(baselines, date));

        setState({
          metrics,
          baselineSummary: summarizeBaselinesForPeriod(baselines, startDate, endDate),
          hasData: metrics.totalRecordDays > 0,
        });
        track('report_view', { type: 'monthly', period: month });
      } catch {
        showToast('리포트를 불러오지 못했어요. 다시 시도해요.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [activeUserKey, month, navigate, repository, showToast]);
```

**Step 2: QuarterlyReportPage.tsx useEffect 수정**

같은 패턴으로 try/catch 감싸기. catch 블록:
```typescript
      } catch {
        showToast('리포트를 불러오지 못했어요. 다시 시도해요.');
      } finally {
        setLoading(false);
      }
```

의존성 배열에 `showToast` 추가.

**Step 3: typecheck + test 확인**

```bash
npm run typecheck && npm run test
```

**Step 4: Commit**

```bash
git add src/pages/MonthlyReportPage.tsx src/pages/QuarterlyReportPage.tsx
git commit -m "fix: add error handling for report data loading with PRD toast message"
```

---

## Phase 2: TDS 컴포넌트 도입

### Task 4: @emotion/react 의존성 추가 + TDSMobileProvider 래핑

**Purpose:** TDS 컴포넌트 사용을 위한 기반을 설정한다. @emotion/react는 transitive로 이미 설치되어 있지만 명시적 의존성으로 추가하고, TDSMobileProvider로 앱을 래핑한다.

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`

**Step 1: @emotion/react를 명시적 의존성으로 추가**

```bash
npm install @emotion/react
```

**Step 2: vite.config.ts에 emotion JSX 변환 설정**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
})
```

**Step 3: main.tsx에 TDSMobileProvider 추가**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileProvider } from '@toss/tds-mobile'
import './index.css'
import { App } from './app/App.tsx'
import { AppProvider } from './state/AppContext.tsx'
import { ToastProvider } from './state/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileProvider>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </TDSMobileProvider>
  </StrictMode>,
)
```

**Step 4: typecheck + build 확인**

```bash
npm run typecheck && npm run build
```

**Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/main.tsx
git commit -m "feat: add TDSMobileProvider and emotion JSX support"
```

---

### Task 5: TDS Button 도입

**Purpose:** 기존 `<button className="btn primary">` 패턴을 TDS `Button`으로 교체한다. 모든 페이지를 순차적으로 교체.

**Files:**
- Modify: `src/pages/OnboardingPage.tsx`
- Modify: `src/pages/LoginPage.tsx`
- Modify: `src/pages/GoalSetupPage.tsx`
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/pages/CalendarPage.tsx`
- Modify: `src/pages/PremiumPage.tsx`
- Modify: `src/pages/MonthlyReportPage.tsx`
- Modify: `src/pages/QuarterlyReportPage.tsx`
- Modify: `src/pages/RoutineTemplatesPage.tsx`
- Modify: `src/pages/SettingsPage.tsx`

**교체 규칙:**

| 기존 | TDS |
|------|-----|
| `<button className="btn primary" ...>` | `<Button variant="primary" ...>` |
| `<button className="btn secondary" ...>` | `<Button variant="secondary" ...>` |
| `<button className="btn danger" ...>` | `<Button variant="danger" ...>` |
| `<button className="btn primary full-width" ...>` | `<Button variant="primary" size="large" ...>` |
| `<button className="btn counter" ...>` | `<Button variant="secondary" ...>` (aria-label은 W2에서) |
| `disabled={...}` | `disabled={...}` (그대로) |

**import:** 각 파일 상단에 `import { Button } from '@toss/tds-mobile';` 추가.

**주의:** `<Link>` 컴포넌트(`className="btn secondary"`)는 교체하지 않는다. TDS Button은 `<button>` 기반이므로 Link로 래핑하거나 onClick+navigate로 변경해야 하는데, 이 범위는 너무 크다. Link에서 `.btn` 클래스만 유지한다.

**Step 1: 각 페이지 파일에서 `<button>` → TDS `<Button>` 교체**

각 파일에서:
1. `import { Button } from '@toss/tds-mobile';` 추가
2. `<button type="button" className="btn primary" ...>` → `<Button variant="primary" ...>`
3. `<button type="button" className="btn secondary" ...>` → `<Button variant="secondary" ...>`
4. `<button type="button" className="btn danger" ...>` → `<Button variant="danger" ...>`
5. `<button type="submit" className="btn primary">` → `<Button type="submit" variant="primary">`
6. `className="btn primary full-width"` → `variant="primary" size="large"`
7. `disabled={...}` prop은 그대로 유지
8. `onClick={...}` prop은 그대로 유지

**Step 2: typecheck**

```bash
npm run typecheck
```

TDS Button의 prop 타입이 맞는지 확인. 맞지 않으면 조정.

**Step 3: build 확인**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/pages/
git commit -m "feat: replace custom buttons with TDS Button component"
```

---

### Task 6: TDS useToast 도입

**Purpose:** 커스텀 ToastContext를 TDS의 useToast 훅으로 교체한다.

**Files:**
- Modify: `src/main.tsx` — ToastProvider 제거 (TDSMobileProvider가 대체)
- Modify: `src/state/ToastContext.tsx` — TDS useToast 래퍼로 변경
- Verify: 모든 `useToast()` 호출이 동일 시그니처인지 확인

**Step 1: ToastContext.tsx를 TDS useToast 래퍼로 변경**

현재 `showToast(text: string)` 시그니처를 유지하면서 내부를 TDS 훅으로 교체:

```typescript
import { useToast as useTdsToast } from '@toss/tds-mobile';

interface ToastContextValue {
  showToast: (text: string) => void;
}

export function useToast(): ToastContextValue {
  const toast = useTdsToast();
  return {
    showToast: (text: string) => {
      toast.open({ text });
    },
  };
}
```

**주의:** TDS useToast의 정확한 API를 확인해야 한다. `toast.open({ text })` 또는 `toast(text)` 등 시그니처를 node_modules에서 확인 후 맞춘다.

**Step 2: main.tsx에서 ToastProvider 제거**

TDSMobileProvider가 Toast 기능을 내장하므로 커스텀 ToastProvider 제거:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileProvider } from '@toss/tds-mobile'
import './index.css'
import { App } from './app/App.tsx'
import { AppProvider } from './state/AppContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </TDSMobileProvider>
  </StrictMode>,
)
```

**Step 3: index.css에서 .toast 스타일 제거**

TDS Toast가 자체 스타일을 가지므로 커스텀 `.toast` CSS 제거:

```css
/* 삭제할 부분 (lines 248-260) */
.toast { ... }
```

**Step 4: typecheck + test + build 확인**

```bash
npm run typecheck && npm run test && npm run build
```

**Step 5: Commit**

```bash
git add src/state/ToastContext.tsx src/main.tsx src/index.css
git commit -m "feat: replace custom toast with TDS useToast"
```

---

### Task 7: TDS Skeleton + TextField 도입

**Purpose:** 로딩 상태에 TDS Skeleton 컴포넌트를, 입력 필드에 TDS TextField를 도입한다.

**Files:**
- Modify: `src/pages/TodayPage.tsx` — Skeleton + TextField
- Modify: `src/pages/GoalSetupPage.tsx` — Skeleton + TextField
- Modify: `src/pages/PremiumPage.tsx` — Skeleton
- Modify: `src/pages/CalendarPage.tsx` — Skeleton
- Modify: `src/pages/MonthlyReportPage.tsx` — Skeleton
- Modify: `src/pages/QuarterlyReportPage.tsx` — Skeleton
- Modify: `src/pages/RoutineTemplatesPage.tsx` — Skeleton
- Modify: `src/pages/SettingsPage.tsx` — Skeleton
- Modify: `src/pages/LoginPage.tsx` — TextField
- Modify: `src/index.css` — `.skeleton-box` 스타일 제거

**교체 규칙 — Skeleton:**

```
Before: <div className="skeleton-box">불러오는 중이에요...</div>
After:  <Skeleton width="100%" height={72} />
```

import: `import { Skeleton } from '@toss/tds-mobile';`

**교체 규칙 — TextField:**

```
Before: <input id="..." inputMode="numeric" value={...} onChange={...} />
After:  <TextField id="..." inputMode="numeric" value={...} onChange={...} />
```

import: `import { TextField } from '@toss/tds-mobile';`

**주의:** TDS TextField의 onChange 시그니처를 확인해야 한다. `(event) => ...` 대신 `(value: string) => ...` 일 수 있다.

**Step 1: 각 파일에서 Skeleton/TextField import 추가 후 교체**

**Step 2: index.css에서 .skeleton-box 및 @keyframes shimmer 제거**

```css
/* 삭제 (lines 101-115) */
.skeleton-box { ... }
@keyframes shimmer { ... }
```

**Step 3: typecheck + build 확인**

```bash
npm run typecheck && npm run build
```

**Step 4: Commit**

```bash
git add src/pages/ src/index.css
git commit -m "feat: replace skeleton and input with TDS Skeleton and TextField"
```

---

## Phase 3: Warning 수정

### Task 8: IAP non-success 이벤트 처리

**Purpose:** `createIapOrder`의 `onEvent`에서 non-success 이벤트를 무시하고 있어 UI가 멈출 수 있다. cancel/fail 이벤트를 명시적으로 처리한다.

**Files:**
- Modify: `src/infra/appsInToss.ts:195-198`

**Step 1: onEvent 핸들러 수정**

현재 코드:
```typescript
onEvent: (event) => {
  if (event.type !== 'success') {
    return;
  }
  complete(() => {
    resolve({ ... });
  });
},
```

수정 후:
```typescript
onEvent: (event) => {
  if (event.type === 'success') {
    complete(() => {
      resolve({
        orderId: event.data.orderId,
        sku,
        displayName: event.data.displayName,
        displayAmount: event.data.displayAmount,
        amount: event.data.amount,
        currency: event.data.currency,
      });
    });
  } else {
    // cancel, fail 등 non-success 이벤트 처리
    complete(() => {
      reject(new Error(`IAP_EVENT_${event.type.toUpperCase()}`));
    });
  }
},
```

**Step 2: typecheck 확인**

```bash
npm run typecheck
```

event.type의 타입을 확인해야 한다. SDK 타입에 따라 `.toUpperCase()` 호출 가능 여부 확인.

**Step 3: Commit**

```bash
git add src/infra/appsInToss.ts
git commit -m "fix: handle non-success IAP events to prevent UI hang"
```

---

### Task 9: 접근성 aria-label 추가

**Purpose:** TodayPage +/- 버튼, CalendarPage 캘린더 셀에 aria-label을 추가한다.

**Files:**
- Modify: `src/pages/TodayPage.tsx`
- Modify: `src/pages/CalendarPage.tsx`

**Step 1: TodayPage +/- 버튼에 aria-label 추가**

```
Before: <Button variant="secondary" onClick={() => adjustCount(-1)}>−</Button>
After:  <Button variant="secondary" onClick={() => adjustCount(-1)} aria-label="커피 1잔 빼기">−</Button>

Before: <Button variant="secondary" onClick={() => adjustCount(1)}>+</Button>
After:  <Button variant="secondary" onClick={() => adjustCount(1)} aria-label="커피 1잔 추가">+</Button>
```

**Step 2: CalendarPage 캘린더 셀에 aria-label 추가**

```
Before: <button ... className="calendar-cell">
After:  <button ... className="calendar-cell" aria-label={`${item.date} ${item.label === '✓' ? '절감일' : item.label === '☕' ? '기록일' : '미기록'}`}>
```

**Step 3: typecheck 확인**

```bash
npm run typecheck
```

**Step 4: Commit**

```bash
git add src/pages/TodayPage.tsx src/pages/CalendarPage.tsx
git commit -m "fix: add aria-labels for counter buttons and calendar cells"
```

---

### Task 10: 에러 핸들링 추가 (4페이지)

**Purpose:** OnboardingPage, GoalSetupPage, SettingsPage, RoutineTemplatesPage의 async 핸들러에 try/catch를 추가한다.

**Files:**
- Modify: `src/pages/OnboardingPage.tsx`
- Modify: `src/pages/GoalSetupPage.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/pages/RoutineTemplatesPage.tsx`

**Step 1: OnboardingPage — handleStart/handleSkip**

```typescript
const handleStart = async () => {
  try {
    await completeOnboarding();
    track('onboarding_cta_start');
    navigate('/login');
  } catch {
    navigate('/login');
  }
};

const handleSkip = async () => {
  try {
    await completeOnboarding();
    await ensureDefaultsForCurrentUser();
    track('onboarding_skip');
  } catch {
    // 온보딩 완료 실패해도 메인으로 이동
  }
  navigate('/today');
};
```

**Step 2: GoalSetupPage — handleSave**

useToast import 추가, showToast 추출:

```typescript
const { showToast } = useToast();

const handleSave = async () => {
  const validationErrors = validateGoalForm(input);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    track('goal_save', { result: 'fail', goal_type: goalType });
    return;
  }

  try {
    await repository.saveGoal({ ... });
    await repository.addBaselineVersion({ ... });
    setErrors({});
    track('goal_save', { result: 'success', goal_type: goalType });
    navigate('/today');
  } catch {
    showToast('저장에 실패했어요. 다시 시도해요.');
  }
};
```

**Step 3: SettingsPage — handleReset**

```typescript
const handleReset = async () => {
  if (!confirmReset) {
    setConfirmReset(true);
    return;
  }
  try {
    await resetCurrentUserData();
    setConfirmReset(false);
    showToast('초기화했어요.');
    track('data_reset_confirm');
  } catch {
    setConfirmReset(false);
    showToast('초기화에 실패했어요. 다시 시도해요.');
  }
};
```

**Step 4: RoutineTemplatesPage — useEffect load**

```typescript
useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const premium = await getFreshPremiumStatus(repository, activeUserKey);
      if (!isPremiumActive(premium)) {
        navigate('/premium?entry=routine_templates', { replace: true });
        return;
      }
      track('routine_view');
    } catch {
      navigate('/premium?entry=routine_templates', { replace: true });
      return;
    }
    setLoading(false);
  };

  void load();
}, [activeUserKey, navigate, repository]);
```

**Step 5: typecheck + test 확인**

```bash
npm run typecheck && npm run test
```

**Step 6: Commit**

```bash
git add src/pages/OnboardingPage.tsx src/pages/GoalSetupPage.tsx src/pages/SettingsPage.tsx src/pages/RoutineTemplatesPage.tsx
git commit -m "fix: add try/catch error handling to async handlers in 4 pages"
```

---

### Task 11: SettingsPage 로딩 상태 추가

**Purpose:** SettingsPage의 useEffect 데이터 로딩 중 로딩 UI를 표시한다.

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

**Step 1: loading state 추가 + 로딩 UI**

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const [goalData, premium, baselineList] = await Promise.all([
        repository.getGoal(activeUserKey),
        getFreshPremiumStatus(repository, activeUserKey),
        repository.getBaselines(activeUserKey),
      ]);
      setGoal(goalData);
      setBaselines(baselineList);
      setPremiumText(toPremiumStatusText(premium));
    } catch {
      // 설정 데이터 로드 실패 시 기본값 유지
    } finally {
      setLoading(false);
    }
  };

  track('settings_view');
  void load();
}, [activeUserKey, repository]);

if (loading) {
  return (
    <section className="screen">
      <Skeleton width="100%" height={72} />
    </section>
  );
}
```

**Step 2: typecheck 확인**

```bash
npm run typecheck
```

**Step 3: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "fix: add loading state and error handling to SettingsPage"
```

---

### Task 12: processProductGrant 문서화

**Purpose:** processProductGrant가 무조건 true를 반환하는 이유와, 복원 플로우로 보완되는 관계를 코드 주석으로 문서화한다.

**Files:**
- Modify: `src/infra/appsInToss.ts`

**Step 1: processProductGrant에 주석 추가**

```typescript
processProductGrant: () => true,
// processProductGrant는 SDK에 "지급 완료"를 알린다.
// 실제 PremiumStatus 저장은 premiumService.purchasePremiumPlan()에서
// completeIapProductGrant 호출 후 수행한다.
// 만약 앱 크래시로 로컬 상태가 미저장되면,
// AppContext 재진입 시 restorePendingPremiumOrders()가 미결 주문을 복원한다.
```

**Step 2: Commit**

```bash
git add src/infra/appsInToss.ts
git commit -m "docs: document processProductGrant behavior and restore flow"
```

---

### Task 13: 최종 검증

**Purpose:** 전체 수정 후 빌드 파이프라인을 실행하여 regression 없음을 확인한다.

**Step 1: 전체 검증 실행**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

Expected: 4개 모두 PASS.

**Step 2: 빌드 크기 확인**

```bash
ls -la dist/assets/
```

TDS 도입으로 인한 번들 크기 증가를 기록.

**Step 3: Commit (필요 시)**

lint 자동 수정 등 추가 변경이 있으면 커밋.
