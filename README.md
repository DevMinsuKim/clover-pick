<p align="center">
  <img src="public/images/symbol_logo.svg" alt="클로버픽 로고" width="96" />
</p>

# CloverPick · 클로버픽

**원하는 조건을 자연어로 입력하고, 나만의 로또·연금복권 번호를 만들어보는 웹 서비스입니다.**

AI와 복권에 대한 관심으로 시작해, 직접 운영하며 데이터 오류를 복구하고 번호 생성 방식과 사용자 경험을 개선하고 있습니다.

[서비스 바로가기](https://www.cloverpick.com/)

| 항목 | 내용 |
| --- | --- |
| 기간 | 2024.05 ~ 현재 |
| 담당 | 1인 개발 · 기획, UI/UX 디자인, 프론트엔드·백엔드 개발, 배포·운영 |
| 운영 기록 | GA4 기준 누적 활성 사용자 400명 · 2026.09 기록 |

## 어떤 서비스인가요?

- **랜덤·맞춤 번호 생성**: 최대 5게임을 생성합니다. 빠른 조건을 고르거나 자연어를 입력하고, 해석된 조건을 확인한 뒤 번호를 만듭니다.
- **복권별 규칙 반영**: 로또의 포함·제외 번호와 홀짝 조건, 연금복권의 조·자리별 조건과 같은 번호로 모든 조 생성 등을 지원합니다.
- **생성 기록과 당첨 결과 확인**: 생성 목록과 당첨 내역을 탭으로 탐색하고, 회차별 추첨 결과와 생성한 번호를 비교합니다.
- **모바일에서도 편하게**: 반응형 화면과 다크 모드를 제공하며, 원하는 사용자만 클릭·터치로 3D 추첨기를 체험할 수 있습니다.

AI는 당첨 번호를 예측하지 않고 입력한 조건을 해석합니다. 실제 번호 선택은 서버의 난수 생성 로직이 담당하며, 생성·복사만으로 복권이 구매되지는 않습니다.

## 주요 문제 해결 경험

### 수집 장애가 회차 오류로 이어지던 구조 개선

당첨 번호 수집이 중단되자 `DB의 최신 회차 + 1`로 계산하던 현재 회차도 멈췄습니다. 이후 생성한 번호가 잘못된 회차에 저장되어 당첨 판별에서도 누락되는 문제가 발생했습니다.

- **회차 계산 분리**: 한국 시간과 판매 마감 시각을 기준으로 회차를 계산하도록 변경해 DB 적재 상태에 대한 의존성을 제거했습니다.
- **수집 검증 보강**: 엑셀 다운로드에서 최근 회차 조회 API로 전환하고, 기대 회차와 응답 회차가 다르면 저장을 중단하고 Sentry로 오류를 전달하도록 구성했습니다.
- **운영 데이터 복구**: 변경 대상을 먼저 확인하고 Neon 복제 DB에서 검증한 뒤 운영에 적용했습니다. 누락된 **65회차**를 적재하고, 생성 기록 **375건**의 회차를 정정했으며, 누락된 당첨 처리 **27건**을 반영했습니다.

[회차 계산](src/utils/calculateRoundNumber.ts) · [수집 응답 검증](src/utils/assertExpectedDrawRound.ts) · [경계 조건 테스트](src/utils/calculateRoundNumber.test.ts)

### AI 번호 생성에서 자연어 조건 기반 생성으로 전환

AI가 번호 자체를 선택하는 기능에서, 사용자가 원하는 조건을 입력하고 확인할 수 있는 기능으로 방향을 바꿨습니다.

- **해석과 실행 분리**: AI SDK의 구조화 출력과 Zod로 조건을 검증하고, 사용자가 확인한 조건 안에서 서버가 번호를 생성합니다. 랜덤 생성과 빠른 조건에는 AI를 호출하지 않습니다.
- **서로 다른 생성 규칙 처리**: 연금복권은 숫자의 순서·반복·앞자리 0을 보존합니다. 조건을 만족하는 조합 수를 먼저 계산하고 중복 없는 순위를 추출해, 조건이 좁아도 무작정 재시도하지 않도록 구현했습니다.
- **재시도와 비용 제어**: 요청 식별자와 트랜잭션으로 같은 요청의 중복 저장을 방지하고 기존 결과를 반환합니다. AI 호출에는 시간 제한과 요청량 제한을 적용했습니다.

[자연어 조건 해석](src/server/lottery/parseLottoPrompt.ts) · [연금복권 생성 로직](src/server/lottery/pensionEngine.ts) · [동시 요청·저장 테스트](src/server/lottery/lottoStorage.integration.test.ts)

### 번호 생성과 목록 탐색에 집중할 수 있는 화면 구성

- **목록 전환 중 화면 유지**: 페이지를 넘길 때 이전 데이터를 유지해 로딩 중 목록이 사라지는 현상을 줄였습니다. 탐색을 시작한 시점의 마지막 기록 ID를 조회 기준으로 유지해 새 기록이 추가되어도 페이지 항목이 밀리지 않도록 했습니다.
- **3D 체험의 선택적 로딩**: 홈에서 바로 실행하던 3D를 체험 버튼을 누를 때 불러오도록 변경했습니다. 화면 밖이나 비활성 탭에서는 시뮬레이션을 멈추고, 닫으면 3D 화면을 해제합니다.

[목록 UI](src/components/lottery/LotteryRecordsList.tsx) · [목록 조회](src/server/lottery/lottoRecords.ts) · [3D 로딩과 실행 제어](src/components/home/HomeBallExperience.tsx)

## 기술 구성과 검증

| 영역 | 기술 |
| --- | --- |
| 프론트엔드 | Next.js App Router, React, TypeScript, TanStack Query |
| UI·인터랙션 | Tailwind CSS, Motion, Three.js, React Three Fiber, Cannon |
| 서버·데이터 | Next.js Server Actions, PostgreSQL(Neon), Prisma |
| AI | OpenAI API, AI SDK, Zod |
| 개발·운영 | Bun, Turbopack, Biome, Vitest, GitHub Actions, Vercel, Sentry, GA4 |

회차 경계, 당첨 판별, 조건별 번호 생성은 단위 테스트로 검증하고, 동시 요청과 중복 저장은 PostgreSQL 통합 테스트로 확인합니다. [CI](.github/workflows/ci.yml)에서 린트·타입 검사·테스트·빌드를 실행하도록 구성했으며, 테스트 DB는 운영 DB와 분리합니다.

<details>
<summary>로컬 실행과 검증</summary>

Node.js 22.12 이상(22.x), Bun 1.2.23, Docker가 필요합니다.

```sh
bun install --frozen-lockfile --ignore-scripts
bun run db:up
bun scripts/with-local-db.mjs run db:prepare:local
bun run dev:local
```

DB 준비 명령 전체를 로컬 실행 도구로 감싸 Prisma 클라이언트 생성까지 Docker DB 주소를 사용합니다. 개발 서버는 `http://localhost:3000`에서 실행합니다.

자유 문장 조건 해석을 사용하려면 `.env`에 `OPENAI_API_KEY`를 설정합니다. 키 없이도 랜덤 생성과 일반 빠른 조건은 사용할 수 있습니다. 초기 로컬 DB는 비어 있어 과거 기록이 필요한 출현 빈도 조건은 사용할 수 없습니다.

```sh
bun run check
bun run test:local
bun run build:local
```

</details>
