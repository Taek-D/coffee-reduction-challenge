# 커피 줄이기 챌린지

Apps-in-Toss WebView 안에서 동작하는 커피 소비 기록형 미니앱입니다.  
사용자가 매일 마신 커피 잔수와 기준 소비를 입력하면, 오늘 지출과 이번 달 절감 추정치를 빠르게 확인할 수 있습니다.

## 현재 MVP 범위

- 오늘 커피 기록 추가/감소
- 기준 소비량과 목표 설정
- 월 요약과 달력 기반 기록 확인
- 프리미엄 PDF 저장
- 기간제 소모성 IAP
- Apps-in-Toss 런타임에서 `appLogin` 시도

## 현재 범위에서 제외한 것

- 재설치/기기 변경 시 데이터 자동 복원
- 완료 주문 이력 기반 구매 복원
- 목표 달성률, 심화 패턴 인사이트
- 모든 환경에서의 토스 로그인 자동 `userKey` 보장

## 기술 스택

- React 18
- TypeScript
- Vite 7
- `@apps-in-toss/web-framework@2.0.1`
- `@toss/tds-mobile`

## 시작하기

```bash
npm install
npm run dev
```

기본 개발 서버는 `http://localhost:5173` 에서 실행됩니다.

## 주요 스크립트

```bash
npm run dev
npm run typecheck
npm run test
npm run build
npm run build:ait
```

- `build`: 웹 프로덕션 번들 생성
- `build:ait`: 업로드용 `.ait` 아티팩트 생성

## 업로드 절차

1. `npm run typecheck`
2. `npm run test`
3. `npm run build:ait`
4. 루트에 생성된 `coffee-reduction-challenge.ait` 업로드

생성물:

- `coffee-reduction-challenge.ait`
- `dist/`
- `.granite/`

## 로그인과 저장 정책

- 로그인은 선택 진입입니다.
- 토스 로그인 자동 식별이 가능하면 해당 식별값을 사용합니다.
- 자동 식별이 불가능하면 현재 기기용 식별값 또는 직접 입력한 식별값으로 계속 진행합니다.
- 데이터는 동일 기기 저장소 기준으로만 유지됩니다.

## 결제 정책

- 프리미엄은 기간제 이용권 형태의 소모성 IAP입니다.
- 자동 갱신 구독은 지원하지 않습니다.
- 설정의 구매 복원은 완료 주문 전체 복원이 아니라 미결 주문 재처리 의미입니다.

## 문서

- 요약 PRD: [docs/PRD.md](docs/PRD.md)
- 상세 PRD: [커피-줄이기-챌린지-PRD.md](%EC%BB%A4%ED%94%BC-%EC%A4%84%EC%9D%B4%EA%B8%B0-%EC%B1%8C%EB%A6%B0%EC%A7%80-PRD.md)

## 배포 전 체크

- Apps-in-Toss 콘솔에 고객센터 연락처 등록
- 약관/개인정보처리방침 노출 확인
- 샌드박스에서 로그인, IAP, PDF 저장 흐름 점검
- 최신 `.ait` 재생성 후 업로드
