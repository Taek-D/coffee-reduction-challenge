---
name: coffee-challenge-architecture
description: 프로젝트 전체 아키텍처와 레이어 구조 가이드. Use when making architectural decisions, adding new modules, or reviewing layer dependencies.
---

# Architecture Skill

## 아키텍처 개요

레이어드 아키텍처 (Layered Architecture) 기반 React SPA.

```
┌─────────────┐
│   pages/    │  ← UI 계층 (라우트별 페이지 컴포넌트)
├─────────────┤
│   state/    │  ← 상태 관리 (React Context)
├─────────────┤
│   data/     │  ← Repository 계층 (데이터 접근 추상화)
├─────────────┤
│  domain/    │  ← 핵심 비즈니스 로직 (순수 함수 + 타입)
├─────────────┤
│   infra/    │  ← 인프라 어댑터 (SDK, Storage, Auth)
├─────────────┤
│  shared/    │  ← 공유 유틸리티 (date, format)
└─────────────┘
```

## 레이어 의존성 규칙

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| `domain/` | 없음 (순수) | `data/`, `infra/`, `pages/`, `state/` |
| `data/` | `domain/`, `infra/storage/types`, `shared/` | `pages/`, `state/` |
| `infra/` | `domain/` (타입만), `shared/` | `data/`, `pages/`, `state/` |
| `state/` | `data/`, `domain/`, `infra/`, `shared/` | `pages/` |
| `pages/` | `state/`, `domain/`, `infra/`, `shared/` | `data/` 직접 접근 지양 |
| `shared/` | 없음 (순수 유틸) | 모든 다른 레이어 |

## 새 모듈 추가 시

1. 어떤 레이어에 속하는지 결정
2. 의존성 방향이 올바른지 확인
3. domain 로직은 반드시 순수 함수로 작성
4. SDK 호출은 infra/ 계층에서만

## 라우팅 구조

| 경로 | 페이지 | 레이아웃 |
|------|--------|---------|
| `/onboarding/:step` | OnboardingPage | 없음 |
| `/login` | LoginPage | 없음 |
| `/goal/setup` | GoalSetupPage | 없음 |
| `/today` | TodayPage | MainLayout (TabBar) |
| `/calendar` | CalendarPage | MainLayout |
| `/premium` | PremiumPage | MainLayout |
| `/report/monthly` | MonthlyReportPage | MainLayout |
| `/report/quarterly` | QuarterlyReportPage | MainLayout |
| `/settings` | SettingsPage | MainLayout |

## 핵심 의존성

- `@apps-in-toss/web-framework`: 토스 미니앱 SDK (Storage, IAP, Analytics, Auth)
- `@toss/tds-mobile`: 토스 디자인 시스템 (UI 컴포넌트)
- `react-router-dom`: 클라이언트 사이드 라우팅
