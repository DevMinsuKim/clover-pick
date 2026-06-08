<h1 align="center">
  AI를 활용한 로또 및 연금복권 번호 생성 서비스
</h1>
  
<h2 align="center">
  <img src="https://github.com/user-attachments/assets/e369a828-b98a-4acb-8087-4a9d39725004" alt="logo" width="150px"/>
  <br>
  <br>
</h2>

<h3 align="center">• 배포 URL: <a href="http://www.cloverpick.com/" target="_blank">https://www.cloverpick.com</a></h3>

<br>

## 프로젝트 소개
- **누적 활성 사용자 수(AU) 372명 돌파 (2026.06 기준, GA4 산정)**
- 1인 프로젝트로 기획, 디자인, 개발, 배포까지 모든 과정을 직접 수행했습니다.
- 매일 동행복권 사이트에서 최신 번호 데이터를 자동 수집·정제하여 데이터베이스에 저장하고, 이를 기반으로 ChatGPT 모델을 활용해 예측 번호를 생성합니다.
- 생성형 AI를 활용해 버튼 한 번으로 로또 및 연금복권 번호를 간편하게 생성할 수 있는 서비스입니다.
- 현재 당첨금 실수령액 계산기 및 당첨 통계 기능도 추가 개발 중입니다.

  
<br>

## 주요 개발 기능
- Next.js, TypeScript, Tailwind CSS, PWA 등을 활용한 다크 모드 및 반응형 PWA 구현
- SSR 적용 및 SEO 최적화, Three.js (R3F)와 Framer Motion을 활용한 인터랙션 애니메이션 구현
- React Query + Server Action 및 React Suspense를 이용해 로딩 및 데이터 관리
- React Error Boundary를 통해 선언적으로 에러를 통제하고 Sentry에 오류를 보고하도록 구현
- PostgreSQL 및 Prisma를 통한 데이터베이스 관리
  
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
  - **검색 엔진 최적화(SEO)**

    
#### 브랜치 전략
  - Git Flow 전략을 기반으로 `main`, `develop` 브랜치 운용
  - 기능 개발은 `develop` 브랜치에서 진행하며, 충분히 테스트된 후 `main` 브랜치로 병합하여 배포

#### 아키텍처
<img src="https://github.com/user-attachments/assets/7a30237a-ca25-4068-99dc-5a9587f0e7ec" alt="Architecture" width="600px"/>
<br>

#### 트러블슈팅(troubleshooting)
##### 1. 서버리스 환경 제약으로 인한 아키텍처 전환
   
- 초기에는 Python (Pandas + TensorFlow LSTM) 기반 시계열 모델을 고려했지만,
서버리스 환경인 Vercel 배포 과정에서 고용량 라이브러리 제약 문제가 발생했습니다.

- 비용을 최소화하고 단일 환경(Vercel)에서 배포 및 운영 경험을 쌓기 위해,
아키텍처를 전면 재설계하여 OpenAI ChatGPT API 기반 번호 생성 서비스로 전환했습니다.

핵심코드
```
const { object: data } = await generateObject({
  model: openai("gpt-4o"),
  system: "You're a lotto number prediction system",
  prompt: `Predict ${repeat} sets of 6 winning numbers from 1 to 45`,
  schema: z.object({
    lottoNumbers: z.array(
      z.object({
        numbers: z.array(z.number().min(1).max(45)).length(6),
      }),
    ),
  }),
});
```
예시 출력: data.lottoNumbers[0].numbers -> [3, 12, 17, 26, 31, 41]

객체 형식을 선택한 이유
- 프롬프트 결과를 직접 객체로 매핑해 UI/DB 연동 용이
- Zod 스키마 검증으로 잘못된 응답(할루시네이션·형식 오류) 차단

#### 2. SourceMaps 보안 이슈
- Sentry 구성 시 Next.js에서 생성되는 SourceMaps 파일의 보안적 이슈를 예방하기 위해 .map 파일 생성을 비활성화

| SourceMaps 비활성화 코드 적용 전 |
|----------|
| <img src="https://github.com/user-attachments/assets/3612c6fc-2818-49a7-b59b-e821fb7842cc" alt="SourceMaps 비활성화 코드 적용 전" width="300px"> |

| SourceMaps 비활성화 코드 |
|----------|
| <img src="https://github.com/user-attachments/assets/416efea8-d1d0-45cd-a900-45309d343097" alt="SourceMaps 비활성화 코드" width="300px"> |

| SourceMaps 비활성화 코드 적용 후 |
|----------|
| <img src="https://github.com/user-attachments/assets/116e2cd1-b355-44ad-98a1-8871544f08b2" alt="SourceMaps 비활성화 코드 적용 후" width="300px"> |

<br>
<br>

## 페이지별 기능
| 반응형 및 다크 모드(테마 선택) 기능 |
|----------|
| <img src="https://github.com/user-attachments/assets/b327fa45-133f-4bdd-946f-fa03f9061378" alt="반응형 및 다크모드(테마 선택) 기능"> |

| 3D 애니메이션 및 메인페이지 |
|----------|
| <img src="https://github.com/user-attachments/assets/bf7ee86b-930d-4d02-a83e-1cc14e193b4d" alt="3D 애니메이션 및 메인페이지"> |

| 로또 번호 생성 및 번호 복사 기능 |
|----------|
| <img src="https://github.com/user-attachments/assets/95ca8a99-60f2-47ba-bfeb-78e6d9102a7a" alt="로또 번호 생성 및 번호 복사 기능"> |

| 연금복권 번호 생성 및 번호 복사 기능 |
|----------|
| <img src="https://github.com/user-attachments/assets/eee4ba44-2702-4d69-8b2e-8940af20f8f4" alt="연금복권 번호 생성 및 번호 복사 기능"> |

<br>
<br>
