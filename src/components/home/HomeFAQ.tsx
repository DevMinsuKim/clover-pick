"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "클로버픽은 어떤 서비스인가요?",
    answer:
      "클로버픽은 자체 알고리즘이 적용된 AI를 통해 편리하게 번호 생성을 제공하는 서비스입니다. 사용자는 간단한 클릭으로 손쉽게 번호를 생성할 수 있습니다.",
  },
  {
    question: "정말 AI로 번호 생성하나요?",
    answer:
      "저희 서비스는 현재까지 당첨된 번호와 자체 알고리즘을 적용한 OpenAI의 ChatGPT를 통해 번호를 제공하고 있습니다.",
  },
  {
    question: "AI 모델이 당첨 확률을 증가시키나요?",
    answer:
      " 로또 및 연금복권 번호 생성은 독립적인 무작위 생성 방식을 따르지만, 재미와 편리함을 위해 AI 모델을 활용한 번호 생성를 제공하고 있습니다. AI 모델이 제안하는 번호는 통계적 분석을 기반으로 한 추천 번호일 뿐, 당첨 확률을 보장하지는 않습니다.",
  },
  {
    question: "번호 생성에 제한이 있나요?",
    answer:
      "네, 추첨 결과 확인 및 다음 회차 준비로 인해 번호 생성이 제한됩니다. 로또 6/45는 매주 토요일 저녁 20시부터 22시까지, 연금복권 720+는 매주 목요일 오후 17시부터 24시까지 번호 생성이 제한됩니다.",
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
