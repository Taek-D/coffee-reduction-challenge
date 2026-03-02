# Stage 4 QA / Release Readiness (Local)

Date: 2026-03-01  
Target: `docs/PRD.md` 기반 4단계(로컬 검증 범위)

## 1) Apps-in-Toss Project Validator Check

- Project type: Web (`@apps-in-toss/web-framework`)
- `package.json` required checks: PASS
  - `name`, `version`, `scripts` 존재
  - `@apps-in-toss/web-framework` 존재
  - `@toss/tds-mobile` 존재
- `granite.config.ts` required checks: PASS
  - `defineConfig` import 경로 정상
  - `appName`, `brand`, `permissions`, `web.port`, `web.commands` 존재
  - `outdir`, `webViewProps` 존재

## 2) Policy Checklist (PRD / Apps-in-Toss constraints)

- 라이트모드 고정: PASS
  - `index.html` `meta color-scheme=light`
  - `src/index.css` `color-scheme: light`
- 핀치줌 비활성화: PASS
  - `index.html` viewport `maximum-scale=1.0, user-scalable=no`
- 외부 링크 미사용: PASS
  - `src`, `index.html` 코드 스캔 시 외부 링크/`openURL`/`window.open` 없음
- 건강/의학 표현 금지: PASS
  - `src` 코드 스캔 시 건강·의학·치료·진단 관련 문구 없음
- "절감 보장" 금지: PASS
  - `src` 코드 스캔 시 보장/확정 표현 없음
  - 절감 수치 표시는 "기록 기반 추정", "절감 예상" 중심 유지
- 결제 강요 금지: PASS
  - 프리미엄 화면에 `무료로 계속 쓰기` 동등 버튼 제공
  - `premium_dismiss` 이벤트 포함

## 3) Regression / Edge Coverage Summary

Automated:
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test`: PASS (4 files, 6 tests)
- `npm run build`: PASS

Covered in tests:
- 저장/조회 및 userKey 분리
- 절감 계산/리포트 합산
- 프리미엄 만료/연장 helper

Manual local flow spot-check:
- 프리미엄 진입/구매(로컬 폴백)
- 월간/분기 리포트 진입
- PDF 저장 버튼 동작(브라우저 다운로드 폴백)
- 루틴 템플릿 접근

Pending for sandbox device:
- 실 결제 성공/실패 이벤트 데이터 확인
- 미결 주문 복원 실경로 검증
- `saveBase64Data` 네이티브 저장 성공/실패 처리 확인

## 4) Build / Resource Budget Snapshot

Latest local build:
- `dist/assets/index-9YOJ787F.js`: 224,341 bytes (224.34 kB)
- `dist/assets/index-B5pcJgA7.css`: 3,100 bytes (3.10 kB)
- Vite reported gzip:
  - JS: 71.77 kB
  - CSS: 1.25 kB

Assessment (local): PASS  
- 단일 번들 기준 MVP 규모로 유지
- 회귀 명령 모두 통과

## 5) Release-Ready Decision (Local)

Local release readiness: **READY (조건부)**  
Blocking items remaining:
- 샌드박스 실기기 최종 검증
  - IAP 성공/실패/복원
  - `saveBase64Data` 네이티브 저장
