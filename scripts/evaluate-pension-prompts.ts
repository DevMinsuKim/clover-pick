import assert from "node:assert/strict";
import { LotteryInputError } from "../src/server/lottery/lotteryInputError";
import { parsePensionPrompt } from "../src/server/lottery/parsePensionPrompt";
import { preparePensionSpace } from "../src/server/lottery/pensionEngine";

// Opt-in live regression checks. No database import or writes; never run in CI.
const cases = [
  {
    name: "조·끝자리·게임 수",
    prompt: "3조로, 끝 두 자리는 07로 고정해서 3게임 만들어줘.",
    expected: { groups: [3], suffix: "07", count: 3 },
  },
  {
    name: "앞자리 0·숫자 포함",
    prompt: "앞 두 자리는 00으로 하고 7을 넣어서 두 게임",
    expected: { prefix: "00", includeDigits: [7], count: 2 },
  },
  {
    name: "제외·중복 숫자",
    prompt: "0은 빼고 숫자 중복 없이 5개",
    expected: { excludeDigits: [0], uniqueDigits: true, count: 5 },
  },
  {
    name: "모든 조 5게임",
    prompt: "같은 번호로 모든 조 5게임 만들어줘",
    expected: { allGroups: true, count: 5 },
  },
  {
    name: "모든 조와 충돌하는 게임 수 보존",
    prompt: "모든 조 1게임 만들어줘",
    expected: { allGroups: true, count: 1 },
  },
  {
    name: "모든 조 1세트",
    prompt: "같은 번호로 모든 조 1세트 만들어줘",
    expected: { allGroups: true, count: 5 },
  },
  {
    name: "복수 조와 한글 개수",
    prompt: "2조와 4조 중에서 0 없이 끝자리는 9로 번호 네 장 만들어줘",
    expected: {
      groups: [2, 4],
      excludeDigits: [0],
      suffix: "9",
      count: 4,
      allGroups: false,
    },
  },
  {
    name: "서로 다른 말투",
    prompt: "1조나 3조로 앞자리 8, 숫자 0 빼고 세 개 생성",
    expected: { groups: [1, 3], prefix: "8", excludeDigits: [0], count: 3 },
  },
  {
    name: "범위 밖 개수 보존",
    prompt: "모든 조 2세트 만들어줘",
    expected: { allGroups: true, count: 10 },
  },
  {
    name: "숫자 합은 지원하지 않음",
    prompt: "앞자리는 00, 끝자리는 11, 숫자 합은 30으로",
    expected: null,
  },
  {
    name: "과거 통계는 지원하지 않음",
    prompt: "최근 많이 나온 번호 5개",
    expected: null,
  },
  {
    name: "반복 횟수는 지원하지 않음",
    prompt: "8이 정확히 두 번 들어가게 만들어줘",
    expected: null,
  },
];
if (!process.env.OPENAI_API_KEY)
  throw new Error("OPENAI_API_KEY를 로컬 환경에 설정해 주세요.");
let failed = 0;
for (const test of cases) {
  try {
    const result = await parsePensionPrompt(test.prompt);
    assert.ok(test.expected, "지원하지 않는 조건을 허용했습니다.");
    const { count, allGroups, ...constraints } = test.expected;
    const space = preparePensionSpace(
      result.constraints,
      result.allGroups ?? false,
    );
    if (count !== undefined) assert.equal(result.requestedCount, count);
    if (allGroups !== undefined) assert.equal(result.allGroups, allGroups);
    for (const [key, value] of Object.entries(constraints)) {
      assert.deepEqual(
        space.constraints[key as keyof typeof space.constraints],
        value,
      );
    }
    console.log(`통과: ${test.name}`);
  } catch (error) {
    if (test.expected === null && error instanceof LotteryInputError)
      console.log(`통과: ${test.name}`);
    else {
      failed++;
      console.error(
        `실패: ${test.name} (${error instanceof Error ? error.constructor.name : "unknown"})`,
      );
    }
  }
}
console.log(`${cases.length - failed}/${cases.length}개 통과`);
if (failed) process.exitCode = 1;
