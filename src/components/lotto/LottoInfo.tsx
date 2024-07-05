import React from "react";
import Info from "../ui/icons/Info";

export default function LottoInfo() {
  return (
    <div>
      <div className="flex">
        <div className="bg-content4 rounded-tl-xl rounded-tr-xl">
          <div className="m-3 flex">
            <div className="bg-content4Hover rounded-full p-1">
              <Info className="h-5 w-5" />
            </div>
            <p className="ml-2 text-center">안내</p>
          </div>
        </div>
      </div>
      <div className="bg-content4 rounded-bl-xl rounded-br-xl rounded-tr-xl p-3">
        <strong>로또 번호 생성 가능 시간 안내</strong>
        <p className="mb-8 mt-1">
          로또 번호 생성은 매주 토요일 저녁 8시에 마감됩니다. <br />
          다음 회차 번호 생성은 토요일 밤 10시 이후부터 가능합니다. <br />
          서비스 이용에 착오 없으시길 바라며, 많은 이용 부탁드립니다!
        </p>

        <strong>로또 번호 생성 안내</strong>
        <p className="mb-4 mt-1">
          로또 번호 생성은 독립적인 무작위 생성 방식을 따르지만, 재미와 편리함을
          위해 AI 모델을 활용한 번호 생성를 제공하고 있습니다.
          <br /> AI 모델이 제안하는 번호는 통계적 분석을 기반으로 한 추천 번호일
          뿐, 당첨 확률을 보장하지는 않습니다.
        </p>
      </div>
    </div>
  );
}
