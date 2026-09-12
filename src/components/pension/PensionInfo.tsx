import Info from "../ui/icons/Info";

export default function PensionInfo() {
  return (
    <div>
      <div className="flex">
        <div className="rounded-tl-xl rounded-tr-xl bg-content4">
          <div className="m-3 flex">
            <div className="rounded-full bg-content4Hover p-1">
              <Info className="h-5 w-5" />
            </div>
            <p className="ml-2 text-center">안내</p>
          </div>
        </div>
      </div>
      <div className="rounded-bl-xl rounded-br-xl rounded-tr-xl bg-content4 p-3">
        <strong>연금복권 번호 생성 가능 시간 안내</strong>
        <p className="mb-8 mt-1">
          매주 목요일 17:00~22:00에는 추첨 결과를 확인하고 다음 회차를 준비하기
          위해 번호 생성을 잠시 멈춰요.
        </p>

        <strong>연금복권 번호 생성 안내</strong>
        <p className="mb-4 mt-1">
          연금복권 번호는 무작위로 생성해요. 모든 조를 선택하면 같은 6자리
          번호에 1~5조를 적용해요. 생성한 번호가 당첨확률을 높이지는 않아요.
        </p>
      </div>
    </div>
  );
}
