---
name: coffee-challenge-infra
description: 인프라 계층 작업 가이드. Use when working with Storage, IAP, Analytics, Auth, PDF export, or Apps-in-Toss SDK integration.
---

# Infra Layer Skill

## 개요

`src/infra/` — 외부 시스템(토스 SDK, Storage, IAP) 연동 어댑터.

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `appsInToss.ts` | SDK 래퍼 — Storage, IAP, Analytics, Auth, saveBase64Data |
| `storage/types.ts` | KeyValueStore 인터페이스 |
| `storage/localStorageStore.ts` | localStorage 기반 구현 (로컬 개발용) |
| `storage/nativeStorageStub.ts` | 네이티브 Storage 스텁 |
| `storage/createAppStorage.ts` | 환경별 Storage 팩토리 |
| `auth.ts` | 인증 관련 |
| `analytics.ts` | 이벤트 추적 |
| `premiumService.ts` | IAP 구매/복원 비즈니스 플로우 |
| `reportPdf.ts` | PDF 리포트 생성/저장 |
| `userKeyResolver.ts` | 사용자 키 해석 |

## Storage 아키텍처

```
KeyValueStore (interface)
├── localStorageStore    ← 로컬 개발 (브라우저 localStorage)
├── nativeStorageStub    ← 네이티브 환경 스텁
└── appsInTossStorage    ← 앱인토스 런타임 (SDK Storage)
```

`createAppStorage()`가 환경에 따라 적절한 구현체를 반환.

## IAP (인앱 결제) 플로우

```
getIapProductList() → 상품 목록 조회
createIapOrder(sku) → 주문 생성 → 결과(orderId, sku, amount)
completeIapProductGrant(orderId) → 상품 지급 완료
getPendingIapOrders() → 미완료 주문 조회 (복원용)
```

로컬 개발 시: `isAppsInTossRuntime() === false` → fallback 데이터 반환

## 환경 판별

```typescript
isAppsInTossRuntime()  // 토스 앱 WebView 내 동작 여부
isLocalDevRuntime()    // import.meta.env.DEV || MODE === 'test'
```

## 규칙

1. SDK 호출은 **반드시 infra/ 계층에서만** (pages에서 직접 호출 금지)
2. 로컬 개발 시 fallback 동작 보장 (SDK 없이도 동작)
3. SDK 타입(`@apps-in-toss/web-framework`)은 수정하지 않음
4. 에러 핸들링: SDK 호출 실패 시 graceful fallback
5. `premiumService.ts` 변경 시 반드시 테스트 업데이트
