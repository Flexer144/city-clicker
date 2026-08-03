import { Pickaxe, HardHat, Trophy } from "lucide-react";
import { audioManager } from "../audio";
import { vibrationManager } from "../vibration";

interface FooterProps {
  openShop: (tab: "click" | "passive") => void;
  openRating: () => void;
}

export default function Footer({ openShop, openRating }: FooterProps) {
  return (
    // pointer-events-none здесь нужен, чтобы не блокировать клики по экрану выше футера
    <footer className="relative z-10 w-full px-4 pb-6 pt-10 pointer-events-none">
      
      {/* Главный контейнер: темное стекло с утонченной золотой рамкой */}
      <div className="flex justify-around items-center bg-[#140f05]/85 backdrop-blur-2xl border border-yellow-600/40 rounded-[2.5rem] p-3 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(234,179,8,0.15)] relative pointer-events-auto">
        
        {/* КНОПКА 1: ИНСТРУМЕНТ (Синяя тема) */}
        <button onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); openShop("click"); }} className="flex flex-col items-center gap-2 group flex-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-gray-800 to-[#0a0a0a] border border-gray-700/50 flex justify-center items-center shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.05)] group-active:scale-90 transition-all overflow-hidden relative">
            {/* Радиальное свечение при активности */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <Pickaxe className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] group-hover:scale-110 transition-transform relative z-10" size={28} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-sky-300 transition-colors">Инструмент</span>
        </button>

        {/* КНОПКА 2: БРИГАДА (Оранжевая тема) */}
        <button onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); openShop("passive"); }} className="flex flex-col items-center gap-2 group flex-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-gray-800 to-[#0a0a0a] border border-gray-700/50 flex justify-center items-center shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.05)] group-active:scale-90 transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <HardHat className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] group-hover:scale-110 transition-transform relative z-10" size={28} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-orange-300 transition-colors">Бригада</span>
        </button>

        {/* КНОПКА 3: РЕЙТИНГ (Золотая тема) */}
        <button onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); openRating(); }} className="flex flex-col items-center gap-2 group flex-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-gray-800 to-[#0a0a0a] border border-gray-700/50 flex justify-center items-center shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.05)] group-active:scale-90 transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] group-hover:scale-110 transition-transform relative z-10" size={28} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-yellow-300 transition-colors">Рейтинг</span>
        </button>

      </div>
    </footer>
  );
}