import axios from "axios";
import React, { useEffect, useState } from "react";
import LottoBgSelect from "../common/LottoBgSelect";
import AlertModal from "../modal/AlertModal";
import { FaPlus } from "react-icons/fa";

export default function HistoryLotto() {
  const [alertMdoal, setAlertModal] = useState(false);

  const [roundNumber, setRoundNumber] = useState([
    { circuit: 0, number: [0, 0, 0, 0, 0, 0, 0] },
  ]);

  useEffect(() => {
    getRoundNumbers();
  }, []);

  const alertMdoalHandler = () => {
    setAlertModal(!alertMdoal);
  };

  const getRoundNumbers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/lotto/9`
      );
      return setRoundNumber(response.data);
    } catch (err) {
      setAlertModal(true);
    }
  };
  return (
    <div className="flex w-ull bg-white dark:bg-slate-950 justify-center items-center">
      <div className="w-full">
        <p className="text-xl font-bold text-black dark:text-white m-6">
          지난 회차 번호
        </p>
        <div className="grid grid-flow-row grid-cols-3 gap-4 ">
          {roundNumber.map((row, rowIndex) => (
            <ul key={rowIndex}>
              {rowIndex === 8 ? (
                <li className="bg-indigo-600 rounded-3xl h-full">
                  <button className="flex text-white h-full w-full text-xl font-bold items-center justify-center">
                    <FaPlus className="mr-2" color="white" />
                    더보기
                  </button>
                </li>
              ) : (
                <li className="flex flex-col relative bg-indigo-600 rounded-3xl">
                  <span className="flex absolute bg-white text-indigo-600 font-bold rounded-3xl ml-3 mt-2 p-2">
                    {row.circuit} 회차
                  </span>

                  <div className="flex mt-16 mx-5 mb-2 justify-between">
                    {row.number.map((number, columnIndex) => (
                      <React.Fragment key={columnIndex}>
                        <div
                          key={columnIndex}
                          className={`flex w-10 h-10 rounded-full items-center justify-center ${
                            number === 0 ? "text-indigo-600" : "text-white"
                          } ${LottoBgSelect(number)}`}
                        >
                          {number}
                        </div>
                        {columnIndex === 5 && (
                          <FaPlus className="self-center mx-1" color="white" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          ))}
        </div>
      </div>

      {alertMdoal && (
        <AlertModal onClose={alertMdoalHandler}>
          <p className="px-4 text-center font-bold text-xs sm:text-sm md:text-base xl:text-lg">
            현재 요청을 처리하는 데 문제가 발생했습니다. 나중에 다시 시도해
            주세요.
          </p>
        </AlertModal>
      )}
    </div>
  );
}
