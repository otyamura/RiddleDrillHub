"use client";

import { useState } from "react";

export default function SortGame() {
  const selections = [
    { id: 1, text: "ろうそく" },
    { id: 2, text: "かまきり" },
    { id: 3, text: "マンゴー" },
    { id: 4, text: "しょうゆ" },
  ];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionClick = (optionId: number) => {
    setSelectedOption(optionId);
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-gray-50 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-gray-50 p-4 pb-2 justify-between">
          <h2 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12">
            Quiz
          </h2>
        </div>
        <h3 className="text-[#101518] tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
          50音順に選択してください
        </h3>
        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
            {selections.map((selection) => (
              <button
                key={selection.id}
                onClick={() => handleOptionClick(selection.id)}
                className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] w-full ${
                  selectedOption === selection.id
                    ? "bg-[#dce8f3] text-[#101518]"
                    : "bg-[#eaedf1] text-[#101518]"
                }`}
              >
                <span className="truncate">{selection.text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-stretch">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
            <button
              onClick={() => setSelectedOption(null)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#eaedf1] text-[#101518] text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Reset</span>
            </button>
            <button
              onClick={() => {}}
              disabled={!selectedOption}
              className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                selectedOption
                  ? "bg-[#dce8f3] text-[#101518]"
                  : "bg-[#eaedf1] text-[#757575] cursor-not-allowed"
              }`}
            >
              <span className="truncate">Answer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
