---
name: coffee-challenge-testing
description: 테스트 작성 패턴과 실행 방법. Use when writing tests, running tests, or debugging test failures.
---

# Testing Skill

## 테스트 도구

- **Vitest** (Vite 네이티브 테스트 러너)
- 테스트 파일: `*.test.ts` (소스와 같은 디렉토리)

## 실행 명령어

```bash
npm run test                    # 전체 테스트 (vitest run)
npx vitest run src/domain/      # 특정 디렉토리
npx vitest run calculations     # 파일명 패턴 매칭
npx vitest --reporter=verbose   # 상세 출력 (watch 모드)
```

## 기존 테스트 현황

| 파일 | 테스트 대상 | 패턴 |
|------|-----------|------|
| `domain/calculations.test.ts` | 월간 요약, 절감액 산출 | 순수 함수 단위 테스트 |
| `domain/premium.test.ts` | 프리미엄 플랜, 만료 체크 | 순수 함수 단위 테스트 |
| `domain/report.test.ts` | 리포트 생성 로직 | 순수 함수 단위 테스트 |
| `data/repository.test.ts` | Repository CRUD | Mock KeyValueStore 주입 |
| `shared/date.test.ts` | 날짜 유틸리티 | 순수 함수 단위 테스트 |
| `infra/premiumService.test.ts` | IAP 구매/복원 | Mock repository + SDK stub |

## 테스트 작성 패턴

### Domain 테스트 (순수 함수)

```typescript
import { describe, it, expect } from 'vitest';
import { someFunction } from './someModule';

describe('someFunction', () => {
  it('should do something with given input', () => {
    const result = someFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Repository 테스트 (Mock Storage)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CoffeeChallengeRepository } from './repository';
import type { KeyValueStore } from '../infra/storage/types';

// In-memory KeyValueStore mock
const createMockStorage = (): KeyValueStore => {
  const store = new Map<string, string>();
  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => { store.set(key, value); },
    removeItem: async (key) => { store.delete(key); },
    getKeysByPrefix: async (prefix) =>
      [...store.keys()].filter((k) => k.startsWith(prefix)),
  };
};

describe('CoffeeChallengeRepository', () => {
  let repo: CoffeeChallengeRepository;

  beforeEach(() => {
    repo = new CoffeeChallengeRepository(createMockStorage());
  });

  it('should upsert and retrieve entry', async () => {
    // ...
  });
});
```

## 테스트 원칙

1. **domain/** 테스트: 외부 의존성 없이 순수 입출력만 검증
2. **data/** 테스트: Mock KeyValueStore 주입으로 Repository 동작 검증
3. **infra/** 테스트: SDK stub/mock으로 어댑터 동작 검증
4. **pages/** 테스트: 필요 시 작성 (현재 미구현)
5. 테스트 데이터는 테스트 파일 내에서 직접 정의
