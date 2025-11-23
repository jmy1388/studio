# 🚀 배포 및 설정 가이드 (Firebase + Vercel)

모든 프로젝트가 삭제된 상태에서 처음부터 다시 설정하는 방법입니다.

## 1. Firebase 프로젝트 설정

1.  [Firebase 콘솔](https://console.firebase.google.com/)에 접속하여 **"프로젝트 만들기"**를 클릭합니다.
2.  프로젝트 이름을 입력하고(예: `oob-project`) 계속 진행합니다. (Google Analytics는 선택 사항입니다.)
3.  **웹 앱 추가:**
    *   프로젝트 개요 페이지에서 **웹 아이콘(</>)**을 클릭합니다.
    *   앱 닉네임을 입력하고 **"앱 등록"**을 클릭합니다.
    *   **"npm 사용"**을 선택하면 나오는 설정 코드(`const firebaseConfig = { ... }`)에서 **내용을 복사해 둡니다.** (나중에 Vercel에 입력해야 합니다.)
4.  **Firestore Database 만들기:**
    *   왼쪽 메뉴에서 **Build > Firestore Database**를 클릭합니다.
    *   **"데이터베이스 만들기"**를 클릭합니다.
    *   위치(Location)를 선택합니다 (한국 서비스라면 `asia-northeast3` 서울 추천).
    *   보안 규칙은 **"프로덕션 모드에서 시작"**을 선택합니다.
5.  **Authentication(인증) 설정:**
    *   왼쪽 메뉴에서 **Build > Authentication**을 클릭합니다.
    *   **"시작하기"**를 클릭합니다.
    *   **"Sign-in method"** 탭에서 원하는 로그인 방식(예: Google, 이메일/비밀번호)을 활성화합니다.

## 2. Vercel 프로젝트 설정

1.  [Vercel 대시보드](https://vercel.com/dashboard)에 접속하여 **"Add New..." > "Project"**를 클릭합니다.
2.  **"Import Git Repository"**에서 `jmy1388/oob` 저장소를 찾아 **"Import"**를 클릭합니다.
3.  **Configure Project** 화면에서 **"Environment Variables"** 섹션을 펼칩니다.
4.  아래 변수들을 하나씩 추가합니다. (값은 아까 Firebase에서 복사한 `firebaseConfig` 내용을 참고하세요.)

| Key (변수명) | Value (값) |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` 값 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` 값 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` 값 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` 값 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` 값 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` 값 |

5.  모든 변수를 추가했다면 **"Deploy"** 버튼을 클릭합니다.

## 3. 배포 완료 확인

*   Vercel이 자동으로 빌드 및 배포를 진행합니다.
*   배포가 완료되면 제공된 도메인으로 접속하여 사이트가 잘 뜨는지 확인합니다.
