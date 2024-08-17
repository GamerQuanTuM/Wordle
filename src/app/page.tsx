"use client"

import axios from 'axios';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WordleBoard = () => {
  const [wordleGrid, setWordleGrid] = useState<{
    firstRow: (string | undefined)[];
    secondRow: (string | undefined)[];
    thirdRow: (string | undefined)[];
    fourthRow: (string | undefined)[];
    fifthRow: (string | undefined)[];
    sixthRow: (string | undefined)[];
  }>({
    firstRow: [undefined, undefined, undefined, undefined, undefined],
    secondRow: [undefined, undefined, undefined, undefined, undefined],
    thirdRow: [undefined, undefined, undefined, undefined, undefined],
    fourthRow: [undefined, undefined, undefined, undefined, undefined],
    fifthRow: [undefined, undefined, undefined, undefined, undefined],
    sixthRow: [undefined, undefined, undefined, undefined, undefined],
  });

  const [activeRow, setActiveRow] = useState(0);
  const [word, setWord] = useState<undefined | string>("TRACE");
  const [rowStatuses, setRowStatuses] = useState<string[][]>(Array(6).fill(Array(5).fill('bg-white')));
  const [wordLoading, setWordLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [flipAnimation, setFlipAnimation] = useState<{ rowIndex: number; letterIndex: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const gridArray = Object.values(wordleGrid);
  const keyboardLayout = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  const handleWordle = (letter: string) => {
    setWordleGrid((prev) => {
      const currentRowKey = Object.keys(prev)[activeRow];
      const currentRow = prev[currentRowKey as keyof typeof prev];

      if (currentRow.includes(undefined)) {
        const updatedRow = [...currentRow];
        updatedRow[updatedRow.indexOf(undefined)] = letter;
        return { ...prev, [currentRowKey]: updatedRow };
      }
      return prev;
    });
  };

  const handleEnter = () => {
    const currentRowKey = Object.keys(wordleGrid)[activeRow];
    const currentRow = wordleGrid[currentRowKey as keyof typeof wordleGrid];

    if (!currentRow.includes(undefined)) {
      const guessedWord = currentRow.join('').toUpperCase();
      const correctWord = word?.toUpperCase().split('') || [];
      const newRowStatus = currentRow.map((letter, index) => {
        if (letter === correctWord[index]) return 'bg-green-500';
        if (correctWord.includes(letter as string)) return 'bg-yellow-500';
        return 'bg-gray-500';
      });

      setRowStatuses(prevStatuses => {
        const newStatuses = [...prevStatuses];
        newStatuses[activeRow] = newRowStatus;
        return newStatuses;
      });

      setFlipAnimation({ rowIndex: activeRow, letterIndex: -1 });
      setTimeout(() => {
        if (guessedWord === word?.toUpperCase()) {
          setShowConfetti(true);
          toast.success('Congratulations! You guessed the word!');
          setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
        } else if (activeRow === 5) {
          toast.error(`Game over. The word was: ${word}`);
        }
        setActiveRow((prev) => (prev < 5 ? prev + 1 : prev));
      }, 800);
    }
  };

  const handleBackspace = () => {
    setWordleGrid((prev) => {
      const currentRowKey = Object.keys(prev)[activeRow];
      const currentRow = [...prev[currentRowKey as keyof typeof prev]];

      for (let i = currentRow.length - 1; i >= 0; i--) {
        if (currentRow[i] !== undefined) {
          currentRow[i] = undefined;
          break;
        }
      }

      return { ...prev, [currentRowKey]: currentRow };
    });
  };

  useEffect(() => {
    const fetchWord = async () => {
      try {
        setWordLoading(true);
        setFetchError(null);
        const response = await axios.get("https://https://wordle-zeta-virid.vercel.app//api");
        const word = response.data.message.toUpperCase();
        setWord(word);
      } catch (error:any) {
        setFetchError(error);
      } finally {
        setWordLoading(false);
      }
    };

    fetchWord();
  }, []);

  if (wordLoading) {
    return (
      <div className="flex h-screen w-screen flex-col justify-center items-center">
        <div className="loader"></div>
        <p className="mt-4 text-lg text-gray-700">Fetching Wordle word, please wait...</p>
      </div>
    )
  }


  return (
    <div className="flex flex-col items-center mt-12 space-y-4">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Wordle Game</h1>

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Blank Grid */}
      <div className="grid grid-cols-5 gap-2">
        {gridArray.map((row, rowIndex) =>
          row.map((letter, letterIndex) => {
            const bgColor = rowStatuses[rowIndex][letterIndex];
            const textColor = bgColor === 'bg-white' ? 'text-black' :
              bgColor === 'bg-green-500' ? 'text-white' :
                bgColor === 'bg-yellow-500' ? 'text-black' :
                  'text-white';
            return (
              <div
                key={`${rowIndex}-${letterIndex}`}
                className={`w-12 h-12 border-2 border-gray-400 flex items-center text-xl font-bold justify-center ${bgColor} ${textColor} ${flipAnimation?.rowIndex === rowIndex ? 'flip' : ''}`}
                style={{ animationDelay: `${letterIndex * 0.2}s` }}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col space-y-2 mt-4">
        {/* First Row */}
        <div className="flex justify-center items-center space-x-2">
          {keyboardLayout[0].split("").map((key, keyIndex) => (
            <button
              onClick={() => handleWordle(key)}
              key={keyIndex}
              className="w-7 h-12 md:w-12 md:h-12 flex items-center justify-center text-white font-bold bg-gray-500 rounded"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Second Row */}
        <div className="flex justify-center space-x-2">
          {keyboardLayout[1].split("").map((key, keyIndex) => (
            <button
              onClick={() => handleWordle(key)}
              key={keyIndex}
              className="w-7 h-12 md:w-12 flex items-center justify-center text-white font-bold bg-gray-500 rounded"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Third Row */}
        <div className="flex justify-center space-x-2">
          {/* Enter Key */}
          <button
            onClick={handleEnter}
            className="w-10 md:w-20 h-12 flex items-center justify-center text-white font-bold bg-gray-500 rounded text-sm md:text-base"
          >
            Enter
          </button>

          {keyboardLayout[2].split("").map((key, keyIndex) => (
            <button
              onClick={() => handleWordle(key)}
              key={keyIndex}
              className="w-7 h-12 md:w-12 flex items-center justify-center text-white font-bold bg-gray-500 rounded"
            >
              {key}
            </button>
          ))}

          {/* Backspace Key */}
          <button onClick={handleBackspace} className="w-10 md:w-20 h-12 flex items-center justify-center text-white font-bold bg-gray-500 rounded">
            ⌫
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default WordleBoard;
