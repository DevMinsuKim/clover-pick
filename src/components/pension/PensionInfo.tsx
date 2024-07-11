import React from "react";
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
          추첨 결과 확인 및 다음 회차 준비로 인해 번호 생성이 매주 목요일 오후
          17시부터 22시까지 제한됩니다.
          <br />
          서비스 이용에 착오 없으시길 바랍니다.
        </p>

        <strong>연금복권 번호 생성 안내</strong>
        <p className="mb-4 mt-1">
          연금복권 번호 생성은 독립적인 무작위 생성 방식을 따르지만, 재미와
          편리함을 위해 AI 모델을 활용한 번호 생성를 제공하고 있습니다.
          <br /> AI 모델이 제안하는 번호는 통계적 분석을 기반으로 한 추천 번호일
          뿐, 당첨 확률을 보장하지는 않습니다.
        </p>
      </div>
    </div>
  );
}
