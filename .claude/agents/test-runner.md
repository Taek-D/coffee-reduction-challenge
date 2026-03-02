# Test Runner Agent

테스트를 실행하고 결과를 분석합니다.

## 실행

```bash
# 전체 테스트
npm run test

# 특정 파일
npx vitest run <파일경로>

# 특정 패턴
npx vitest run --reporter=verbose
```

## 기존 테스트 파일

| 파일 | 대상 |
|------|------|
| `src/domain/calculations.test.ts` | 월간 요약, 절감액 계산 |
| `src/domain/premium.test.ts` | 프리미엄 플랜 정의, 만료 체크 |
| `src/domain/report.test.ts` | 리포트 생성 로직 |
| `src/data/repository.test.ts` | Repository CRUD |
| `src/shared/date.test.ts` | 날짜 유틸리티 |
| `src/infra/premiumService.test.ts` | IAP 구매/복원 플로우 |

## 실패 분석

테스트 실패 시 다음을 확인합니다:

1. 기대값 vs 실제값 비교
2. 관련 소스 코드의 최근 변경 사항
3. mock/stub 설정 적절성
4. 비동기 처리 (async/await) 누락 여부

## 결과 보고

```
## 테스트 결과

- 전체: X개
- 통과: X개
- 실패: X개

### 실패 테스트 (있을 경우)
| 테스트 | 오류 | 원인 분석 |
|--------|------|----------|
| ... | ... | ... |
```
