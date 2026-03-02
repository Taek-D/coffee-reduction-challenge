# 커피 줄이기 챌린지 — Development Guide

## Overview

Apps-in-Toss 미니앱. React 18 + TypeScript + Vite 기반 SPA.
토스 앱 내 WebView에서 동작하며, `@apps-in-toss/web-framework` SDK로 네이티브 기능(Storage, IAP, Analytics, Auth)에 접근한다.

## Package Manager

**항상 `npm` 사용** (`package-lock.json` 기준)

## Development Commands

```bash
npm run dev          # 로컬 개발 서버 (Vite, localhost:5173)
npm run build        # tsc -b && vite build → dist/
npm run typecheck    # tsc -b --pretty false
npm run test         # vitest run
npm run lint         # eslint .
npm run preview      # vite preview (빌드 결과 확인)
```

## Development Workflow

1. 변경 사항 작성
2. 타입체크: `npm run typecheck`
3. 테스트: `npm run test`
4. 린트: `npm run lint`
5. 빌드: `npm run build`

## Project Structure

```
src/
├── app/            # App shell — App.tsx, routes.tsx, components/, layout/
├── assets/         # 정적 리소스 (이미지 등)
├── data/           # Repository 계층 — KeyValueStore 기반 데이터 접근
├── domain/         # 순수 비즈니스 로직 — models, calculations, validation, premium, report
├── infra/          # 인프라 어댑터 — Storage, Auth, Analytics, IAP, PDF SDK 연동
│   └── storage/    # KeyValueStore 구현체 (localStorage, native stub)
├── pages/          # 페이지 컴포넌트 (라우트 단위)
├── shared/         # 공유 유틸리티 — date, format, simplePdf
├── state/          # React Context 기반 상태 관리
├── main.tsx        # 엔트리 포인트
└── index.css       # 글로벌 스타일
```

### Layer Dependency Rules

```
pages → state → data → domain (순수)
pages → infra (SDK 호출)
infra → domain (타입 참조만)
shared ← 어디서든 import 가능
domain ← 외부 의존성 없음 (순수 함수 + 타입)
```

## Key Files

| 역할 | 파일 |
|------|------|
| 앱 진입점 | `src/main.tsx` |
| 라우팅 | `src/app/routes.tsx` |
| 전역 상태 | `src/state/AppContext.tsx` |
| 도메인 모델 | `src/domain/models.ts` |
| Repository | `src/data/repository.ts` |
| SDK 어댑터 | `src/infra/appsInToss.ts` |
| 프리미엄/IAP | `src/domain/premium.ts`, `src/infra/premiumService.ts` |
| 앱인토스 설정 | `granite.config.ts` |

## Coding Conventions

### TypeScript
- `type` 선호, `interface`는 구현체가 있을 때만 사용 (예: `KeyValueStore`)
- `enum` 금지 → 문자열 리터럴 유니온 사용 (예: `GoalType = 'weekly_limit' | 'monthly_budget'`)
- `any` 금지 — `unknown` + 타입 가드 사용
- strict 모드 (noUnusedLocals, noUnusedParameters 활성)

### React
- 함수형 컴포넌트 + named export (예: `export function TodayPage()`)
- React Context로 상태 관리 (Redux/Zustand 사용하지 않음)
- `useCallback`, `useMemo`로 불필요한 리렌더링 방지
- UI: `@toss/tds-mobile` (TDS) 컴포넌트 우선 사용

### 파일/폴더 네이밍
- 컴포넌트: PascalCase (`TodayPage.tsx`, `TabBar.tsx`)
- 유틸/로직: camelCase (`calculations.ts`, `date.ts`)
- 테스트: `*.test.ts` (같은 폴더에 위치)

### Import 규칙
- 상대 경로 사용 (`../domain/models`)
- `type` import 분리 (`import type { Entry } from ...`)

## Testing

- **Vitest** 사용
- 도메인 로직과 Repository에 단위 테스트 집중
- 테스트 파일: `*.test.ts` (소스 파일과 같은 디렉토리)
- 기존 테스트: `calculations.test.ts`, `repository.test.ts`, `premium.test.ts`, `report.test.ts`, `date.test.ts`, `premiumService.test.ts`

## Apps-in-Toss Specifics

- `granite.config.ts`: 앱 이름, 브랜드, 웹뷰 설정
- SDK: `@apps-in-toss/web-framework` — Storage, IAP, Analytics, appLogin, saveBase64Data
- 로컬 개발 시 `isAppsInTossRuntime()` false → localStorage + fallback 데이터 사용
- userKey: 토스 로그인 시 고유 키, 미로그인 시 `'guest_local'`

## PRD & Docs

- PRD: `docs/PRD.md` — 기능 요구사항의 원본. PRD 외 임의 기능 추가 금지.
- 의사결정 기록: `docs/DECISIONS.md`
- QA 체크리스트: `docs/QA_STAGE4.md`
- 작업 현황: `docs/task.md`

## Restrictions

- console.log 디버깅 후 반드시 제거
- 커밋 단위: 화면 1개 / 레이어 1개 이하
- PRD에 없는 기능 임의 추가 금지
- `@apps-in-toss/web-framework` SDK 타입은 수정하지 않음
