---
name: coffee-challenge-domain
description: 도메인 로직 작업 가이드. Use when working with business logic, models, calculations, premium features, or report generation.
---

# Domain Layer Skill

## 개요

`src/domain/` — 순수 비즈니스 로직. 외부 의존성 없음.

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `models.ts` | 핵심 타입 정의 (Entry, Goal, BaselineVersion, PremiumStatus) |
| `calculations.ts` | 월간 요약, 절감액 산출 (MonthlySummary) |
| `validation.ts` | 입력값 검증 |
| `premium.ts` | 프리미엄 플랜 정의, 만료 체크, SKU 매핑 |
| `report.ts` | 리포트 데이터 생성 |
| `storageKeys.ts` | Storage 키 네이밍 규칙 |

## 핵심 모델

```typescript
type GoalType = 'weekly_limit' | 'monthly_budget';

interface Entry {
  id: string;
  userKey: string;
  date: string;        // YYYY-MM-DD
  coffee_count: number;
  unit_amount: number;  // 1잔 가격 (원)
}

interface Goal {
  userKey: string;
  goal_type: GoalType;
  weekly_limit?: number;
  monthly_budget?: number;
}

interface BaselineVersion {
  userKey: string;
  effective_from: string;
  avg_per_day: number;
  unit_amount: number;
}

interface PremiumStatus {
  userKey: string;
  is_premium: boolean;
  plan?: '30d' | '365d';
  purchased_at?: string;
  expires_at?: string;
  last_order_id?: string;
}
```

## 핵심 상수

```typescript
DEFAULT_UNIT_AMOUNT = 4500;        // 기본 1잔 가격
DEFAULT_BASELINE_AVG_PER_DAY = 1;  // 기본 하루 평균
DEFAULT_WEEKLY_LIMIT = 7;          // 기본 주간 목표
MAX_DAILY_COFFEE_COUNT = 99;       // 최대 일일 잔 수
```

## 규칙

1. domain 내 함수는 반드시 **순수 함수**로 작성 (side effect 없음)
2. 외부 라이브러리 import 금지 — `shared/` 유틸만 허용
3. `enum` 대신 문자열 리터럴 유니온 사용
4. `type` 선호 (`interface`는 구현체가 필요한 경우만)
5. 새 모델/타입 추가 시 `models.ts`에 정의
6. 새 비즈니스 로직 추가 시 반드시 테스트 작성
