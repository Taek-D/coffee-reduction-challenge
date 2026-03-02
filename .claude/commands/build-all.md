# 전체 빌드

TypeScript 컴파일 + Vite 빌드를 수행합니다.

## 실행

```bash
npm run build
```

출력 디렉토리: `dist/`

## 빌드 실패 시

1. tsc 오류인 경우: `npm run typecheck`로 타입 오류 확인 후 수정
2. Vite 번들링 오류인 경우: import 경로, 에셋 참조 확인
3. 수정 후 재빌드

## 빌드 결과 확인

```bash
npm run preview
```

로컬에서 빌드 결과물을 서빙하여 확인할 수 있습니다.
