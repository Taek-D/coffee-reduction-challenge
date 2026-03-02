# 커피 줄이기 챌린지 작업 현황

기준 문서: `docs/PRD.md`  
현재 상태: **4단계 진행중** (로컬 QA/출시 점검 완료, 샌드박스 실기기 검증 대기)

## 완료된 것

- [x] Vite + React + TypeScript 프로젝트 스캐폴딩
- [x] 라이트모드 고정 적용
- [x] 핀치줌 비활성화(`meta viewport`)
- [x] P0 라우팅 골격 구성
  - [x] `/onboarding/:step`
  - [x] `/login`
  - [x] `/goal/setup`
  - [x] `/today`
  - [x] `/calendar`
  - [x] `/settings`
  - [x] `/terms`, `/privacy`
- [x] 메인 레이아웃(상단/하단 탭) 뼈대
- [x] 온보딩 1/2/3 화면 뼈대
- [x] 로그인 화면 + `appLogin` 호출 경로 + userKey 자동/수동 확보 경로
- [x] 목표/기준 설정 화면 뼈대 + 입력 검증 범위 반영
- [x] 오늘 화면 뼈대 + `+/-` 기록 + 즉시 저장 연결
- [x] 달력/월요약 화면 뼈대
- [x] 설정 화면 뼈대 + 데이터 초기화 2단계 확인
- [x] 데이터 모델 구현
  - [x] `Entry`
  - [x] `Goal`
  - [x] `BaselineVersion`
  - [x] `PremiumStatus`
- [x] 계산 규칙 구현(PRD 식)
  - [x] `expected_daily`
  - [x] `actual_daily`
  - [x] `saving_daily`
  - [x] `overspend_daily`
- [x] 저장소 키 설계(`{userKey}:` prefix) 적용
- [x] 저장 레이어 구현
  - [x] 네이티브 저장소 SDK 인터페이스 Stub
  - [x] `localStorage` fallback
  - [x] Repository 계층(기록/목표/기준/요약)
- [x] 불명확 가정 `docs/DECISIONS.md` 기록
- [x] 실행 검증 완료
  - [x] `npm run typecheck`
  - [x] `npm run lint`
  - [x] `npm run test`
  - [x] `npm run build`
- [x] 로컬 사전검증 재실행(2026-03-01)
  - [x] `npm run typecheck`
  - [x] `npm run lint`
  - [x] `npm run test` (3 passed)
  - [x] `npm run build`
  - [x] 정책 제약 사전점검(코드 검색): `src` 기준 외부 링크 없음, 라이트모드 고정, 핀치줌 비활성화 확인
  - [x] 약관 문구 정책 보정: 건강/의학 표현 제거 (`src/pages/TermsPage.tsx`)
- [x] P1 기능 로컬 구현 및 검증(2026-03-01)
  - [x] S07 프리미엄 화면 + 무료로 계속 쓰기 동등 경로
  - [x] IAP 구매 플로우 연동(`getProductItemList`, `createOneTimePurchaseOrder`, `completeProductGrant`)
  - [x] 미결 주문 복원 연동(`getPendingOrders`) + 앱 재진입 자동 복원
  - [x] S08 고급 리포트(월간/분기) + 프리미엄 가드
  - [x] PDF 저장(`saveBase64Data` 우선, 로컬 다운로드 fallback)
  - [x] S10 대체 루틴 템플릿 + 프리미엄 가드
  - [x] P1 회귀 검증: `npm run typecheck`, `npm run lint`, `npm run test` (6 passed), `npm run build`
  - [x] 브라우저 실동작 확인: 프리미엄 진입/구매/리포트/PDF/루틴 템플릿
- [x] 4단계 로컬 QA/출시 점검(2026-03-01)
  - [x] 앱인토스 프로젝트 설정 검증(package/granite 필수 항목)
  - [x] 정책 카피/링크 스캔(건강·의학 금지, 절감 보장 금지, 외부 링크 미사용)
  - [x] 결제 강요 금지 확인(프리미엄 화면 `무료로 계속 쓰기` 동등 버튼)
  - [x] 회귀 실행 재확인(`typecheck`, `lint`, `test`, `build`)
  - [x] 번들/리소스 점검(dist: js 224.34kB, css 3.10kB)
  - [x] 결과 문서화(`docs/QA_STAGE4.md`)

## 앞으로 해야 할 것

### 2단계 (P0 완성도 높이기)

- [ ] 잔여 항목: 앱인토스 샌드박스 실기기 검증만 대기

- [x] 앱인토스 SDK 의존성 설치
  - [x] `@apps-in-toss/web-framework`
  - [x] `@toss/tds-mobile`
- [x] `granite.config.ts` 추가 및 기본 설정 반영
- [x] 네이티브 저장소 SDK 우선 어댑터 적용(`Storage`)
- [x] Analytics SDK 우선 이벤트 전송 적용(`Analytics`)
- [x] 로그인 화면에서 `appLogin` 호출 경로 추가
- [x] 저장 실패/공유 실패를 공통 Toast로 표준화
- [x] 오늘 화면 빈상태 문구 PRD 기준 반영
- [x] 달력 화면 기록 부족 문구 PRD 기준 반영
- [x] Baseline 버전 히스토리 표시(설정 화면)
- [x] 저장소 인덱스 기반 데이터 정리 로직 보강
- [x] Repository 테스트 추가(월 조회/유저 분리/초기화)
- [ ] 앱인토스 샌드박스 실기기 검증
  - [ ] 시나리오 A: 신규 사용자 첫 진입
    - [ ] 절차: `/onboarding/1`부터 `챌린지 시작하기`까지 진행
    - [ ] 기대결과: 온보딩 단계 이벤트(`onboarding_view`, `onboarding_next`, `onboarding_cta_start`)가 정상 기록
  - [ ] 시나리오 B: 로그인 + userKey 확보
    - [ ] 절차: `토스 로그인 진행` 버튼 탭 후 인증
    - [ ] 기대결과: 인증 성공 토스트 노출, 실패 시 에러 토스트 노출
    - [ ] 절차: (서버 엔드포인트 설정 시) userKey 자동 주입 확인
    - [ ] 기대결과: 입력칸에 userKey 자동 반영
    - [ ] 절차: (엔드포인트 미설정 시) userKey 수동 입력 후 저장
    - [ ] 기대결과: `/goal/setup` 진입 및 `login_complete` 이벤트 기록
  - [ ] 시나리오 C: 목표/기준 저장
    - [ ] 절차: 주간/월간 목표 각각 저장 시도
    - [ ] 기대결과: 범위 밖 값 입력 시 필드별 에러 문구 노출
    - [ ] 기대결과: 저장 성공 시 `/today` 이동 + baseline 버전 생성
  - [ ] 시나리오 D: 오늘 기록/저장소
    - [ ] 절차: `+/-` 탭 및 단가 저장 반복
    - [ ] 기대결과: 즉시 반영, 실패 시 토스트 노출
    - [ ] 기대결과: 앱 재진입 후 값 유지(Storage SDK 우선, fallback 포함)
  - [ ] 시나리오 E: 달력/요약
    - [ ] 절차: 월 이동, 날짜 선택, 공유 버튼 탭
    - [ ] 기대결과: 기록 없는 월은 "기록이 쌓이면 패턴을 보여드려요." 표시
    - [ ] 기대결과: 공유 성공/실패에 맞는 토스트/이벤트(`report_share_result`) 기록
  - [ ] 시나리오 F: 설정/초기화
    - [ ] 절차: 초기화 확인 → 초기화하기
    - [ ] 기대결과: 데이터 삭제 후 기본값 재생성, 토스트 노출
  - [ ] 시나리오 G: 정책 제약 점검
    - [ ] 절차: 전체 화면 문구/링크/테마/줌/결제 유도 문구 확인
    - [ ] 기대결과: 건강·의학 금지/절감 보장 금지/외부 링크 없음/라이트모드/핀치줌 비활성화 충족
- [x] 토스 로그인 후 userKey 자동 획득 경로 최종 확정(문서/SDK 정책 확인)
  - [x] 확정 구조: `appLogin` 인증 → `VITE_APP_LOGIN_EXCHANGE_ENDPOINT`가 있으면 userKey 자동 주입
  - [x] 엔드포인트 없으면 수동 userKey 입력 fallback 유지

### 3단계 (P1 기능)

- [x] 프리미엄 화면(S07) 구현
- [x] IAP 기간제 이용권(소모성) 구매 플로우 구현
  - [x] `getProductItemList`
  - [x] `createOneTimePurchaseOrder`
  - [x] `completeProductGrant`
- [x] 미결 주문 처리/복원 흐름 구현(`getPendingOrders`)
- [x] 고급 리포트(S08) 구현(월간/분기)
- [x] PDF 저장 기능 구현(`saveBase64Data`, 기기 직접 저장)
- [x] 대체 루틴 템플릿(S10) 구현
- [ ] 샌드박스 실기기 검증(결제 성공/실패/복원, PDF 저장)만 대기

### 4단계 (QA/출시 점검)

- [x] 앱인토스 정책 점검 체크리스트 최종 검수(로컬 코드/화면 기준)
  - [x] 건강/의학 표현 금지
  - [x] 절감 보장 표현 금지(기록 기반 추정 고정)
  - [x] 외부 링크 미사용
  - [x] 결제 강요 금지(무료 계속 쓰기 동등 제공)
- [x] 회귀 테스트/엣지 케이스 테스트 정리(문서화)
- [x] 출시 전 빌드/성능/리소스 예산 점검(로컬)
- [ ] 샌드박스 실기기 최종 검증(결제 성공/실패/복원, saveBase64Data)
