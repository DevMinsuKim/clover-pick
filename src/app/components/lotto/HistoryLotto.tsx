import axios from "axios";
import React, { useEffect, useState } from "react";
import NumberBgSelect from "../common/NumberBgSelect";
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
      console.log(response);
      return setRoundNumber(response.data);
    } catch (err) {
      setAlertModal(true);
    }
  };
  return (
    <div className="w-full bg-white dark:bg-slate-950 justify-center items-center mb-6">
      <div className="flex w-full justify-center">
        <div className="flex w-11/12 justify-between 3xl:max-w-6xl">
          <p className="text-sm sm:text-base 2xl:text-lg font-bold text-black my-6 dark:text-white">
            지난 회차 번호
          </p>
          {/* <button className="text-sm sm:text-base 2xl:text-lg font-bold text-black my-6 dark:text-white">
            더 보기
          </button> */}
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div className="grid grid-flow-row grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 w-11/12 justify-between 3xl:max-w-6xl">
          {roundNumber.map((row, rowIndex) => (
            <ul key={rowIndex}>
              <li className="flex flex-col relative bg-indigo-600 rounded-3xl">
                <span className="flex absolute bg-white text-indigo-600 font-bold rounded-3xl ml-3 mt-2 p-2 text-sm sm:text-base">
                  {row.circuit} 회차
                </span>

                <div className="flex mt-16 mx-3 mb-2 justify-between flex-wrap">
                  {row.number.map((number, columnIndex) => (
                    <React.Fragment key={columnIndex}>
                      <div
                        key={columnIndex}
                        className={`flex w-8 h-8 md:w-9 md:h-9 xl:w-8 xl:h-8 3xl:w-10 3xl:h-10 rounded-full items-center justify-center ${
                          number === 0 ? "text-indigo-600" : "text-white"
                        } ${NumberBgSelect(number)} my-1`}
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
            </ul>
          ))}
        </div>
      </div>
      {alertMdoal && (
        <AlertModal onClose={alertMdoalHandler}>
          <p className="px-4 text-center font-bold text-xs sm:text-sm xl:text-lg">
            현재 요청을 처리하는 데 문제가 발생했습니다.
            <br /> 나중에 다시 시도해 주세요.
          </p>
        </AlertModal>
      )}
    </div>
  );
}
