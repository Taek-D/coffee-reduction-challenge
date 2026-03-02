# 모듈별 테스트 실행

특정 모듈이나 파일에 대한 테스트를 실행합니다.

## 사용법

인자로 모듈명 또는 파일 경로를 전달합니다.

## 실행

```bash
# 특정 파일 테스트
npx vitest run src/domain/calculations.test.ts

# 특정 디렉토리 테스트
npx vitest run src/domain/

# 전체 테스트
npm run test
```

## 테스트 실패 시

1. 실패한 테스트의 기대값과 실제값 비교
2. 관련 소스 코드 확인
3. 수정 후 재실행하여 통과 확인
4. 전체 테스트(`npm run test`)도 통과하는지 확인
