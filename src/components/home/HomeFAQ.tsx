"use client";

import { motion } from "motion/react";
import { useState } from "react";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "클로버픽은 어떤 서비스인가요?",
    answer:
      "클로버픽은 로또와 연금복권 번호를 간편하게 골라보는 서비스예요. 로또는 랜덤 생성과 원하는 조건을 적용하는 맞춤 생성을 이용할 수 있어요.",
  },
  {
    question: "AI는 어떤 역할을 하나요?",
    answer:
      "로또 맞춤 생성에 입력한 문장을 AI가 번호 조건으로 정리해요. 조건을 확인하면 그 범위 안에서 번호를 무작위로 생성해요. 랜덤 생성과 빠른 조건만 선택하는 경우에는 AI를 호출하지 않아요.",
  },
  {
    question: "AI를 이용하면 당첨확률이 높아지나요?",
    answer:
      "아니요. AI는 당첨 번호를 예측하지 않아요. 과거 출현 빈도를 조건으로 선택해도 다음 회차의 당첨확률이 높아지지는 않아요.",
  },
  {
    question: "번호 생성에 제한이 있나요?",
    answer:
      "추첨 결과를 확인하고 다음 회차를 준비하는 동안 번호 생성을 잠시 멈춰요. 로또는 매주 토요일 20:00~23:30, 연금복권은 매주 목요일 17:00~22:00에 이용할 수 없어요.",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const openAni = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="mx-auto mt-40 flex max-w-screen-xl flex-col items-center justify-center px-6">
      <p className="text-2xl font-bold sm:text-3xl">자주 묻는 질문</p>
      <div className="mt-6 flex w-full max-w-2xl flex-col gap-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b">
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-4 text-left"
              onClick={() => handleToggle(index)}
            >
              <span className="text-lg font-semibold">{faq.question}</span>
              <span className="text-xl font-bold">
                {openIndex === index ? "-" : "+"}
              </span>
            </button>

            <motion.div
              className="overflow-hidden"
              variants={openAni}
              animate={openIndex === index ? "open" : "closed"}
              initial="closed"
            >
              <div className="px-2 pb-4">
                <p>{faq.answer}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
