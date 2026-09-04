import Image from "next/image";
import { Settings } from "lucide-react"; 
import { formatNumber } from "../utils";
import { audioManager } from "../audio";

interface HeaderProps {
  totalEarned: number;
  nextThreshold: number;
  progressPercent: number;
  coins: number;
  isChestVisible: boolean;
  isModalOpen: boolean;
  diamonds: number;
  currentEpoch: number; 
  mayorImage: string;
  setIsModalOpen: (val: boolean) => void;
  openSettings: () => void;
  handleEvolution: () => void;
  isGameCompleted: boolean;
}

export default function Header({
  totalEarned,
  nextThreshold,
  progressPercent,
  coins,
  diamonds,
  currentEpoch,
  isChestVisible,
  isModalOpen,
  setIsModalOpen,
  mayorImage,
  openSettings,
  handleEvolution,
  isGameCompleted
}: HeaderProps) {
  return (
    <header className="relative z-30 w-full p-5 flex flex-col gap-4">
      
      {/* ПРОГРЕСС БАР ИЛИ ОГРОМНАЯ КНОПКА ЭВОЛЮЦИИ */}
      {progressPercent >= 100 ? (
        <button 
          onClick={handleEvolution}
          className="relative mt-2 w-full py-3 bg-gradient-to-b from-green-400 to-emerald-600 rounded-2xl border-2 border-green-300 shadow-[0_0_25px_rgba(16,185,129,0.8)] flex items-center justify-center animate-pulse active:scale-95 transition-transform cursor-pointer"
        >
          <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isGameCompleted ? "Посмотреть тизер" : "Эволюция! (Нажми)"}
          </span>
          {/* Легкий эффект блика на кнопке */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-2xl pointer-events-none" />
        </button>
      ) : (
        <div className="mt-2 relative h-6 bg-black/60 rounded-full border-2 border-yellow-700/80 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
          {/* Сам заполняющийся бар */}
          <div 
            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Текст поверх бара */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[12px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wider">
              {formatNumber(totalEarned)} / {formatNumber(nextThreshold)}
            </span>
          </div>
        </div>
      )}

      {/* ТВОЙ ОРИГИНАЛЬНЫЙ БЛОК ИНТЕРФЕЙСА */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex gap-2 flex-wrap max-w-[90%]">
          {/* МОНЕТЫ */}
          <div className="flex gap-2 items-center bg-gradient-to-r from-black/85 via-black/75 to-black/85 pr-4 pl-2 py-1 rounded-full backdrop-blur-md border-2 border-yellow-500/70 shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
            <div className="w-6 h-6 sm:w-7 sm:h-7 relative -my-1 ml-0.5">
              <Image src="/money1.png" alt="Монета" fill className="object-contain" priority />
            </div>
            <span className="text-lg pb-0.5 sm:text-xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide">
              {formatNumber(coins)}
            </span>
          </div>

          {/* АЛМАЗЫ (Скрыты в начале игры) */}
          {(currentEpoch >= 2 || diamonds > 0) && (
            <div className="flex gap-1 items-center bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-blue-950/90 pr-3 pl-1.5 py-1 rounded-full backdrop-blur-md border-2 border-blue-500/80">
              <div className="w-9 h-6 relative -my-1 ml-0.5 drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]">
                <Image src="/diamond1.png" alt="Алмаз" fill className="object-contain" priority />
              </div>
              <span className="text-xl -pb-0.5 font-black text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide">
                {formatNumber(diamonds)}
              </span>
            </div>
          )}
        </div>

        {/* АВАТАР МЭРА С КНОПКОЙ НАСТРОЕК */}
        <div 
          onClick={() => { audioManager.play("ui"); openSettings(); }}
          className="relative w-20 h-20 rounded-full border-[3px] border-yellow-400 bg-gradient-to-b from-yellow-600 to-amber-900 shadow-[0_0_20px_rgba(234,179,8,0.6)] flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <Image src={mayorImage} alt="Мэр" fill className="object-cover rounded-full" sizes="80px" priority />
          
          {/* Иконка шестеренки */}
          <div className="absolute -bottom-1 -left-2 bg-gray-800 border-2 border-gray-600 rounded-full p-1.5 shadow-lg">
            <Settings size={14} className="text-gray-300" />
          </div>
        </div>

        {/* СУНДУК */}
        {isChestVisible && !isModalOpen && (
          <div
            className="absolute top-16 -left-1 w-18 h-18 sm:w-18 sm:h-18 animate-pulse cursor-pointer hover:scale-110 active:scale-95 transition-all drop-shadow-[0_12px_25px_rgba(234,179,8,0.8)] z-50"
            onClick={() => { audioManager.play("ui"); setIsModalOpen(true); }}
          >
            <Image src="/chest1.png" alt="Сундук" fill className="object-contain" sizes="112px" />
          </div>
        )}
      </div>
    </header>
  );
}