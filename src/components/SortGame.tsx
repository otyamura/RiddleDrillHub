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
  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "correct" | "incorrect"
  >("waiting");
  const [wordCount, setWordCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sortGameWordCount");
      return saved ? parseInt(saved, 10) : 4;
    }
    return 4;
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string[]>([]);

  const loadWordsFromCSV = async () => {
    try {
      const response = await fetch("/data/aiueo.csv");
      const text = await response.text();
      const words = text
        .trim()
        .split("\n")
        .filter((word) => word.trim() !== "");
      setWordPool(words);
      return words;
    } catch (error) {
      console.error("CSVファイルの読み込みエラー:", error);
      const fallbackWords = [
        "りんご",
        "いぬ",
        "うさぎ",
        "ねこ",
        "ろうそく",
        "かまきり",
        "マンゴー",
        "しょうゆ",
        "えんぴつ",
        "きりん",
        "たまご",
        "ばなな",
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
    const selectedWords = shuffledWords.slice(0, wordCount);
    const wordsWithId = selectedWords.map((word, index) => ({
      id: index + 1,
      text: word,
    }));
    setCurrentWords(wordsWithId);
    setSelectedOrder([]);
    setGameState("waiting");
    setStartTime(null);
    setEndTime(null);
    setCurrentTime(0);
  };

  useEffect(() => {
    const loadAndInitialize = async () => {
      const words = await loadWordsFromCSV();
      initializeGame(words);
    };
    loadAndInitialize();
  }, []);

  useEffect(() => {
    if (wordPool.length > 0) {
      initializeGame();
    }
  }, [wordCount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState === "playing" && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, startTime]);

  const handleWordCountChange = (newCount: number) => {
    setWordCount(newCount);
    if (typeof window !== "undefined") {
      localStorage.setItem("sortGameWordCount", newCount.toString());
    }
  };

  const startGame = () => {
    setGameState("playing");
    setStartTime(Date.now());
    setCurrentTime(0);
  };

  const handleWordClick = (wordId: number) => {
    if (gameState !== "playing") return;

    if (selectedOrder.includes(wordId)) {
      // 既に選択済みの場合は取り消し
      const newOrder = selectedOrder.filter((id) => id !== wordId);
      setSelectedOrder(newOrder);
    } else {
      // 新規選択の場合は追加
      const newOrder = [...selectedOrder, wordId];
      setSelectedOrder(newOrder);

      if (newOrder.length === wordCount) {
        checkAnswer(newOrder);
      }
    }
  };

  const checkAnswer = (order: number[]) => {
    const orderedWords = order.map(
      (id) => currentWords.find((word) => word.id === id)?.text || ""
    );

    const correctOrder = [...orderedWords].sort((a, b) =>
      a.localeCompare(b, "ja", { numeric: true })
    );

    const isCorrect = orderedWords.every(
      (word, index) => word === correctOrder[index]
    );

    // 結果を保存
    setUserAnswer(orderedWords);
    setCorrectAnswer(correctOrder);

    if (isCorrect) {
      setEndTime(Date.now());
    }

    setGameState(isCorrect ? "correct" : "incorrect");
  };

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}秒`;
  };

  const generateTweetText = () => {
    if (startTime && endTime) {
      const clearTime = formatTime(endTime - startTime);
      return `五十音順ソートをクリアしました！\n${wordCount}個の単語を${clearTime}で並び替え完了🎉\n\nhttps://riddle-drill-hub.vercel.app/ \n\n #五十音順ソート`;
    }
    return "";
  };

  const getTweetUrl = () => {
    const text = encodeURIComponent(generateTweetText());
    return `https://twitter.com/intent/tweet?text=${text}`;
  };

  const resetSelection = () => {
    setSelectedOrder([]);
    if (gameState !== "waiting") {
      setGameState("playing");
    }
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

        {gameState === "playing" && startTime && (
          <div className="px-4 py-2">
            <p className="text-center text-lg font-bold text-blue-600">
              ⏱️ {formatTime(currentTime)}
            </p>
          </div>
        )}

        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                単語数:
              </label>
              <select
                value={wordCount}
                onChange={(e) => handleWordCountChange(Number(e.target.value))}
                disabled={gameState === "playing" || selectedOrder.length > 0}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {Array.from({ length: 23 }, (_, i) => i + 3).map((count) => (
                  <option key={count} value={count}>
                    {count}個
                  </option>
                ))}
              </select>
            </div>
          </div>
          {gameState !== "waiting" && (
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
                <button
                  onClick={resetSelection}
                  disabled={
                    selectedOrder.length === 0 ||
                    gameState === "correct" ||
                    gameState === "incorrect"
                  }
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                    selectedOrder.length > 0 && gameState === "playing"
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
          )}
        </div>

        {gameState === "waiting" && (
          <div className="px-4 py-3">
            <div className="text-center">
              <button
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                🚀 スタート
              </button>
            </div>
          </div>
        )}

        {(gameState === "correct" || gameState === "incorrect") && (
          <div className="px-4 py-3">
            <div
              className={`text-center p-3 rounded-lg ${
                gameState === "correct"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <div className="text-lg font-bold mb-2">
                {gameState === "correct" ? "🎉 正解です！" : "❌ 不正解です"}
              </div>
              {gameState === "correct" && startTime && endTime && (
                <div className="space-y-2">
                  <div className="text-sm">
                    クリア時間: {formatTime(endTime - startTime)}
                  </div>
                  <div>
                    <a
                      href={getTweetUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      🐦 Xでシェア
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState !== "waiting" && (
          <div className="flex justify-center">
            <div className="w-full max-w-[480px] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 px-4 py-3">
              {currentWords.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleWordClick(word.id)}
                  disabled={gameState !== "playing"}
                  className={`flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-1 sm:px-2 md:px-4 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] w-full ${
                    selectedOrder.includes(word.id)
                      ? "bg-[#dce8f3] text-[#101518] hover:bg-[#c8daf0]"
                      : gameState !== "playing"
                      ? "bg-[#f5f5f5] text-[#757575] cursor-not-allowed"
                      : "bg-[#eaedf1] text-[#101518] hover:bg-[#dce8f3]"
                  }`}
                >
                  <span className="truncate">
                    {selectedOrder.includes(word.id) &&
                      `${selectedOrder.indexOf(word.id) + 1}. `}
                    {word.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedOrder.length > 0 && gameState !== "waiting" && (
          <div className="px-4 py-2">
            <p className="text-center text-sm text-gray-600">
              選択順序:{" "}
              {selectedOrder
                .map((id) => currentWords.find((w) => w.id === id)?.text)
                .join(" → ")}
            </p>
          </div>
        )}

        {gameState === "incorrect" && userAnswer.length > 0 && correctAnswer.length > 0 && (
          <div className="px-4 py-2">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">あなたの回答:</p>
              <div className="flex justify-center gap-1 mb-3">
                {userAnswer.map((word, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      word === correctAnswer[index]
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-2">正解:</p>
              <div className="flex justify-center gap-1">
                {correctAnswer.map((word, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
