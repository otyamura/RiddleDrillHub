"use client";

import { useState, useEffect } from "react";

interface Word {
  id: number;
  text: string;
}

export default function SortGame() {
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect">("playing");

  const loadWordsFromCSV = async () => {
    try {
      const response = await fetch('/data/aiueo.csv');
      const text = await response.text();
      const words = text.trim().split('\n').filter(word => word.trim() !== '');
      setWordPool(words);
      return words;
    } catch (error) {
      console.error('CSVファイルの読み込みエラー:', error);
      const fallbackWords = [
        "りんご", "いぬ", "うさぎ", "ねこ", "ろうそく", "かまきり", 
        "マンゴー", "しょうゆ", "えんぴつ", "きりん", "たまご", "ばなな"
      ];
      setWordPool(fallbackWords);
      return fallbackWords;
    }
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = async (wordsArray?: string[]) => {
    const words = wordsArray || wordPool;
    if (words.length === 0) return;
    
    const shuffledWords = shuffleArray(words);
    const selectedWords = shuffledWords.slice(0, 4);
    const wordsWithId = selectedWords.map((word, index) => ({
      id: index + 1,
      text: word
    }));
    setCurrentWords(wordsWithId);
    setSelectedOrder([]);
    setGameState("playing");
  };

  useEffect(() => {
    const loadAndInitialize = async () => {
      const words = await loadWordsFromCSV();
      initializeGame(words);
    };
    loadAndInitialize();
  }, []);

  const handleWordClick = (wordId: number) => {
    if (gameState !== "playing") return;
    if (selectedOrder.includes(wordId)) return;
    
    const newOrder = [...selectedOrder, wordId];
    setSelectedOrder(newOrder);
    
    if (newOrder.length === 4) {
      checkAnswer(newOrder);
    }
  };

  const checkAnswer = (order: number[]) => {
    const orderedWords = order.map(id => 
      currentWords.find(word => word.id === id)?.text || ""
    );
    
    const correctOrder = [...orderedWords].sort((a, b) => 
      a.localeCompare(b, 'ja', { numeric: true })
    );
    
    const isCorrect = orderedWords.every((word, index) => word === correctOrder[index]);
    setGameState(isCorrect ? "correct" : "incorrect");
  };

  const resetSelection = () => {
    setSelectedOrder([]);
    setGameState("playing");
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-gray-50 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-gray-50 p-4 pb-2 justify-between">
          <h2 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12">
            五十音順ソートゲーム
          </h2>
        </div>
        <h3 className="text-[#101518] tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
          五十音順に選択してください
        </h3>
        
        {selectedOrder.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-center text-sm text-gray-600">
              選択順序: {selectedOrder.map(id => 
                currentWords.find(w => w.id === id)?.text
              ).join(" → ")}
            </p>
          </div>
        )}

        {gameState !== "playing" && (
          <div className="px-4 py-3">
            <div className={`text-center p-3 rounded-lg ${
              gameState === "correct" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {gameState === "correct" ? "正解です！" : "不正解です"}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
            {currentWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word.id)}
                disabled={selectedOrder.includes(word.id) || gameState !== "playing"}
                className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] w-full ${
                  selectedOrder.includes(word.id)
                    ? "bg-[#dce8f3] text-[#101518]"
                    : gameState !== "playing"
                    ? "bg-[#f5f5f5] text-[#757575] cursor-not-allowed"
                    : "bg-[#eaedf1] text-[#101518] hover:bg-[#dce8f3]"
                }`}
              >
                <span className="truncate">
                  {selectedOrder.includes(word.id) && 
                    `${selectedOrder.indexOf(word.id) + 1}. `
                  }
                  {word.text}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-stretch">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
            <button
              onClick={resetSelection}
              disabled={selectedOrder.length === 0}
              className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                selectedOrder.length > 0
                  ? "bg-[#eaedf1] text-[#101518] hover:bg-[#dce8f3]"
                  : "bg-[#f5f5f5] text-[#757575] cursor-not-allowed"
              }`}
            >
              <span className="truncate">リセット</span>
            </button>
            <button
              onClick={() => initializeGame()}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4CAF50] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#45a049]"
            >
              <span className="truncate">新しいゲーム</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
