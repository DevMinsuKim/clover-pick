<h1 align="center">
  AI를 활용한 로또 및 연금복권 번호 생성 서비스
</h1>
  
<h2 align="center">
  <img src="https://github.com/DevMinsuKim/get-image-url/assets/70056622/9f3f3356-fb10-4981-a768-b4df0be85421" alt="logo" width="150"/>
  <br>
  <br>
  클로버픽(CloverPick)
</h2>

<h3 align="center">• 배포 URL: <a href="http://www.cloverpick.com/" target="_blank">https://www.cloverpick.com</a></h3>

<br>

## 프로젝트 소개
- 1인 프로젝트로, 기획부터 디자인, 개발, 배포까지 모든 과정을 직접 수행했습니다.
- 24시간마다 동행복권 사이트에서 번호 데이터를 자동으로 가져와 정제한 후, 데이터베이스에 추가하고, 이 데이터를 기반으로 ChatGPT 모델을 학습시켜 예측 번호를 도출합니다.
- ChatGPT 생성형 AI를 활용해 버튼 한 번으로 간단하게 로또 및 연금복권 번호를 생성할 수 있는 서비스입니다.
- 당첨금 실수령액 계산기 및 당첨 통계를 제공하기 위해 개발 중입니다.
  
<br>

## 개발 내용
#### 개발 기간: 2024.05 - 현재 진행 중
#### 사용한 기술 스택
  - **코어**: Next.js, TypeScript
  - **상태 관리 및 데이터 페칭**: React Query, Server Action
  - **스타일링 및 애니메이션**: Tailwind CSS, Framer Motion
  - **3D 그래픽**: Three.js (R3F)
  - **패키지 매니저**: Bun
  - **빌드 도구**: SWC
  - **데이터베이스 및 ORM**: PostgreSQL, Prisma
  - **배포**: Vercel
  - **에러 추적 및 분석**: Sentry, GA4
  - **API**: ChatGPT API
#### 브랜치 전략
  - Git Flow 전략을 기반으로 `main`, `develop` 브랜치 운용
  - 기능 개발은 `develop` 브랜치에서 진행하며, 충분히 테스트된 후 `main` 브랜치로 병합하여 배포
