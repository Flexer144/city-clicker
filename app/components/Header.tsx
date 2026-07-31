import Image from "next/image";
import { Settings } from "lucide-react"; // Импортируем шестеренку

interface HeaderProps {
  totalEarned: number;
  nextThreshold: number;
  progressPercent: number;
  coins: number;
  isChestVisible: boolean;
  isModalOpen: boolean;
  mayorImage: string;
  setIsModalOpen: (val: boolean) => void;
  openSettings: () => void; // <-- ФУНКЦИЯ ОТКРЫТИЯ НАСТРОЕК
}

export default function Header({
  totalEarned,
  nextThreshold,
  progressPercent,
  coins,
  isChestVisible,
  isModalOpen,
  setIsModalOpen,
  mayorImage,
  openSettings
}: HeaderProps) {
  return (
    <header className="relative z-30 w-full p-5 flex flex-col gap-4">
      <div className="w-full bg-black/70 rounded-full h-8 border-[3px] border-yellow-600/70 p-1 relative overflow-hidden backdrop-blur-md shadow-xl">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-200 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(234,179,8,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wider">
          {totalEarned.toLocaleString()} / {nextThreshold.toLocaleString()}
        </span>
      </div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex gap-3 items-center bg-gradient-to-r from-black/85 via-black/75 to-black/85 pr-4 pl-2 py-1 rounded-full backdrop-blur-md border-2 border-yellow-500/70 shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
          <div className="w-7 h-7 sm:w-7 sm:h-7 relative -my-2 ml-1">
            <Image src="/money1.png" alt="Монета" fill className="object-contain" priority />
          </div>
          <span className="text-xl pb-0.5 sm:text-xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide">
            {coins.toLocaleString()}
          </span>
        </div>

        {/* АВАТАР МЭРА С КНОПКОЙ НАСТРОЕК */}
        <div 
          onClick={openSettings}
          className="relative w-20 h-20 rounded-full border-[3px] border-yellow-400 bg-gradient-to-b from-yellow-600 to-amber-900 shadow-[0_0_20px_rgba(234,179,8,0.6)] flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <Image src={mayorImage} alt="Мэр" fill className="object-cover rounded-full" sizes="80px" priority />
          
          {/* Иконка шестеренки */}
          <div className="absolute -bottom-1 -left-2 bg-gray-800 border-2 border-gray-600 rounded-full p-1.5 shadow-lg">
            <Settings size={14} className="text-gray-300" />
          </div>
        </div>

        {isChestVisible && !isModalOpen && (
          <div
            className="absolute top-16 -left-4 w-34 h-34 sm:w-28 sm:h-28 animate-pulse cursor-pointer hover:scale-110 active:scale-95 transition-all drop-shadow-[0_12px_25px_rgba(234,179,8,0.8)] z-50"
            onClick={() => setIsModalOpen(true)}
          >
            <Image src="/chest.png" alt="Сундук" fill className="object-contain" sizes="112px" />
          </div>
        )}
      </div>
    </header>
  );
}