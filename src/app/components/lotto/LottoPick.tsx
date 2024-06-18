"use client";

import React, { ChangeEvent, useState } from "react";
import Button from "../common/Button";
import useLottoNumbers from "../../hooks/useLottoNumbers";

export default function LottoPick() {
  const [selected, setSelected] = useState(1);
  const { mutate, data, error, isError, isPending } = useLottoNumbers();

  const handleClick = () => {
    mutate({ numSets: selected });
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelected(parseInt(event.target.value));
  };

  return (
    <div>
      {isError && <p>{error.message}</p>}
      {isPending && <p>로딩중...</p>}
      {!data && <p>0,0,0,0,0,0</p>}
      {data && <div>{data.numbers} 번 입니다.</div>}
      <div className="flex">
        <label htmlFor="options">번호 선택해주세요</label>
        <select
          className="ml-1"
          id="options"
          value={selected}
          onChange={handleSelectChange}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>

      <Button
        onclick={() => {
          handleClick();
        }}
      >
        번호 추첨하기
      </Button>
      {selected}
    </div>
  );
}
