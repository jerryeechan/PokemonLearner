import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Volume2, Delete } from 'lucide-react';

interface SpellingProps {
  vocab: {
    japanese: string;
    hiragana: string; // fallback or TTS
    zh_tw: string;
  };
  onNext: (correct: boolean) => void;
}

export function SpellingMode({ vocab, onNext }: SpellingProps) {
  // Use the raw japanese string (removing spaces if any) as the target word
  const targetWord = (vocab.japanese || vocab.hiragana).replace(/\s+/g, '');
  const [jumbledChars, setJumbledChars] = useState<string[]>([]);
  const [inputChars, setInputChars] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    // Generate jumbled characters including some distractors
    const chars = targetWord.split('');
    
    const hiraganaDistractors = ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','を','ん','が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ','だ','ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ'];
    const katakanaDistractors = ['ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ','サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト','ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ','マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ','ル','レ','ロ','ワ','ヲ','ン','ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ','ダ','ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ','パ','ピ','プ','ペ','ポ','ー'];
    
    let distractors: string[] = [];
    const hasHiragana = /[\u3040-\u309F]/.test(targetWord);
    const hasKatakana = /[\u30A0-\u30FF]/.test(targetWord);
    
    if (hasHiragana) distractors.push(...hiraganaDistractors);
    if (hasKatakana) distractors.push(...katakanaDistractors);
    if (distractors.length === 0) distractors = hiraganaDistractors;
    
    // Add 3 distractors
    for(let i=0; i<3; i++) {
        chars.push(distractors[Math.floor(Math.random() * distractors.length)]);
    }
    
    setJumbledChars(chars.sort(() => 0.5 - Math.random()));
    setInputChars([]);
    setIsAnswered(false);
  }, [targetWord]);

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(vocab.hiragana);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const playCharAudio = (char: string) => {
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleCharClick = (char: string, index: number) => {
    if (isAnswered) return;
    
    playCharAudio(char);
    setInputChars([...inputChars, char]);
    
    // Remove from jumbled
    const newJumbled = [...jumbledChars];
    newJumbled.splice(index, 1);
    setJumbledChars(newJumbled);
  };

  const handleRemoveChar = () => {
    if (isAnswered || inputChars.length === 0) return;
    const lastChar = inputChars[inputChars.length - 1];
    
    // Remove from input
    setInputChars(inputChars.slice(0, -1));
    
    // Put back to jumbled
    setJumbledChars([...jumbledChars, lastChar]);
  };

  const handleRemoveSpecificChar = (index: number) => {
    if (isAnswered) return;
    
    const charToRemove = inputChars[index];
    const newInput = [...inputChars];
    newInput.splice(index, 1);
    setInputChars(newInput);
    
    setJumbledChars([...jumbledChars, charToRemove]);
  };

  const handleSubmit = () => {
    if (inputChars.length === 0) return;
    if (isAnswered) {
      onNext(inputChars.join('') === targetWord);
    } else {
      setIsAnswered(true);
    }
  };

  const isCorrect = inputChars.join('') === targetWord;

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-700 w-full text-left mb-2">拼出正確的單字</h2>
      
      <div className="flex w-full items-center gap-4 mb-6">
        <button onClick={playAudio} className="p-3 bg-blue-50 text-blue-500 rounded-full">
            <Volume2 className="w-6 h-6" />
        </button>
        <p className="text-xl font-bold text-gray-600">意思：{vocab.zh_tw}</p>
      </div>

      {/* Answer Area */}
      <div className="w-full flex flex-wrap gap-2 justify-center min-h-[60px] p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 border-dashed mb-6 relative">
        {inputChars.map((char, i) => (
           <button 
             key={i} 
             onClick={() => handleRemoveSpecificChar(i)}
             disabled={isAnswered}
             className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl text-2xl font-bold shadow-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-100 disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-black">
             {char}
           </button>
        ))}
        {inputChars.length > 0 && !isAnswered && (
             <button onClick={handleRemoveChar} className="absolute -right-4 top-4 p-2 text-gray-400 hover:text-red-500">
                <Delete className="w-6 h-6" />
             </button>
        )}
      </div>

      {/* Character Bank */}
      <div className="w-full flex flex-wrap justify-center gap-2 mb-8 mt-auto">
        {jumbledChars.map((char, i) => (
          <button
            key={i}
            disabled={isAnswered}
            onClick={() => handleCharClick(char, i)}
            className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl text-2xl font-bold text-gray-700 shadow-[0_4px_0_0_rgba(229,231,235,1)] active:translate-y-1 active:shadow-none transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            {char}
          </button>
        ))}
      </div>

      <div className="w-full mt-auto">
        <button 
          disabled={inputChars.length === 0}
          onClick={handleSubmit}
          className={clsx(
            "w-full py-4 text-xl font-bold rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] active:translate-y-2 transition-all text-white",
            inputChars.length === 0 ? 'bg-gray-300 shadow-none cursor-not-allowed opacity-50 border-0' :
            !isAnswered ? 'bg-green-500 shadow-[0_4px_0_0_rgba(34,197,94,1)]' :
            isCorrect ? 'bg-green-500 shadow-[0_4px_0_0_rgba(34,197,94,1)]' :
            'bg-red-500 shadow-[0_4px_0_0_rgba(239,68,68,1)]'
          )}
        >
          {!isAnswered ? '檢查' : '繼續'}
        </button>
        {isAnswered && !isCorrect && (
           <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl font-bold text-center flex flex-col items-center gap-2">
               <span>正確答案是：</span>
               <span className="text-3xl font-black tracking-widest">{targetWord}</span>
           </div>
        )}
        {isAnswered && isCorrect && (
           <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-xl font-bold text-center flex flex-col items-center gap-2">
               <span>拼寫正確！</span>
               <span className="text-3xl font-black tracking-widest">{targetWord}</span>
           </div>
        )}
      </div>
    </div>
  );
}
