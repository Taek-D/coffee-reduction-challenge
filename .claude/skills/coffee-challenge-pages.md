---
name: coffee-challenge-pages
description: 페이지 컴포넌트 작업 가이드. Use when creating or modifying page components, routing, or UI layout.
---

# Pages Layer Skill

## 개요

`src/pages/` — 라우트 단위 페이지 컴포넌트.

## 페이지 목록

| 페이지 | 경로 | 설명 |
|--------|------|------|
| `OnboardingPage` | `/onboarding/:step` | 온보딩 플로우 (3단계) |
| `LoginPage` | `/login` | 토스 로그인 |
| `GoalSetupPage` | `/goal/setup` | 목표 설정 (주간잔수/월예산) |
| `TodayPage` | `/today` | 오늘 기록 (메인 화면) |
| `CalendarPage` | `/calendar` | 월간 캘린더 뷰 |
| `PremiumPage` | `/premium` | 프리미엄 구독 (IAP) |
| `MonthlyReportPage` | `/report/monthly` | 월간 리포트 |
| `QuarterlyReportPage` | `/report/quarterly` | 분기 리포트 |
| `RoutineTemplatesPage` | `/routine-templates` | 루틴 템플릿 |
| `SettingsPage` | `/settings` | 설정 |
| `TermsPage` | `/terms` | 이용약관 |
| `PrivacyPage` | `/privacy` | 개인정보처리방침 |

## 레이아웃

- `MainLayout`: TabBar가 포함된 기본 레이아웃 (today, calendar, premium, report, settings)
- 온보딩/로그인/목표설정/약관: 레이아웃 없음 (독립 화면)

## 컴포넌트 작성 규칙

1. **named export** 사용: `export function PageName() { ... }`
2. `useAppContext()`로 전역 상태 접근 (repository, userKey 등)
3. **TDS 컴포넌트** 우선 사용 (`@toss/tds-mobile`)
4. 페이지 내부 로직이 복잡하면 `reportUtils.ts` 같은 유틸 파일 분리
5. 스타일: `src/index.css` 글로벌 스타일 활용, 인라인 스타일 최소화

## 새 페이지 추가 시

1. `src/pages/NewPage.tsx` 생성 (named export)
2. `src/app/routes.tsx`에 라우트 추가
3. MainLayout 내부 라우트인 경우 `<Route element={<MainLayout>}>` 아래에 추가
4. TabBar에 표시할 경우 `src/app/components/TabBar.tsx` 수정

## 상태 접근 패턴

```typescript
import { useAppContext } from '../state/AppContext';

export function SomePage() {
  const { repository, activeUserKey } = useAppContext();

  // repository를 통해 데이터 접근
  // activeUserKey로 현재 사용자 식별
}
```
