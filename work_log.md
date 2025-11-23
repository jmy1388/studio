# Work Log

## 2025-11-23 16:08:00 - Reimplementation Started
* **작업 내용:** UI와 로직 분리를 위한 리팩토링 작업 시작. '브런치' 스타일의 견고한 백엔드 로직 구축을 목표로 함.
## 2025-11-23 16:08:00 - Reimplementation Started
* **작업 내용:** UI와 로직 분리를 위한 리팩토링 작업 시작. '브런치' 스타일의 견고한 백엔드 로직 구축을 목표로 함.
* **관련 파일:** `work_log.md` 생성

## 2025-11-23 16:20:00 - Logic Separation Completed
* **작업 내용:**
    * `src/hooks/useArticles.ts` 생성: Firebase 데이터 로직을 커스텀 훅으로 분리.
    * `src/app/page.tsx` 리팩토링: `useHomeArticles` 훅 적용, 기존 HTML 구조 100% 보존.
    * `src/app/articles/[slug]/page.tsx` 리팩토링: `useArticleDetail` 훅 적용, 기존 HTML 구조 100% 보존.
* **관련 파일:** `src/hooks/useArticles.ts`, `src/app/page.tsx`, `src/app/articles/[slug]/page.tsx`

## 2025-11-23 16:50:00 - Deployment Environment Setup
* **작업 내용:**
    * `deployment_guide.md` 작성: Firebase 및 Vercel 초기 설정 가이드.
    * `.env` 파일 생성: 로컬 개발용 환경 변수 설정.
    * `src/firebase/index.ts` 수정: 초기화 경고 메시지 제거.
    * Git 원격 저장소 업데이트 (`jmy1388/oob`).
* **관련 파일:** `deployment_guide.md`, `.env`, `src/firebase/index.ts`
