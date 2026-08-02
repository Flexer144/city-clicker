import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Trophy, Medal } from "lucide-react";
import { LeaderboardEntry } from "../types";
import { formatNumber } from "../utils";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  epochsConfig: Record<number, { name: string }>; 
}

export default function RatingModal({ isOpen, onClose, leaderboard, epochsConfig }: RatingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Темный фон-подложка */}
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Само модальное окно */}
          <motion.div
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1c1404] to-black border-t-2 border-yellow-500/50 rounded-t-3xl pt-2 pb-6 px-5 shadow-[0_-10px_40px_rgba(234,179,8,0.15)] flex flex-col h-[75vh]"
          >
            {/* Ползунок сверху для красоты */}
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-5 shrink-0" />
            
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={28} />
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">Рейтинг</h2>
              </div>
              <button onClick={onClose} className="bg-white/10 p-2 rounded-full active:scale-90 transition-transform">
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Заголовки колонок */}
            <div className="flex text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 px-2 shrink-0">
              <div className="w-10 text-center">Топ</div>
              <div className="flex-1 pl-2">Игрок</div>
              <div className="text-right">Всего заработано</div>
            </div>

            {/* Список игроков с отключенным видимым скроллбаром */}
            <div className="flex-1 overflow-y-auto space-y-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {leaderboard.map((player) => {
                // Достаем название эпохи по номеру. Если нет - пишем стандартное.
                const epochName = epochsConfig[player.epoch]?.name || `Эпоха ${player.epoch}`;
                
                return (
                  <div
                    key={player.id}
                    className={`relative flex items-center p-3 rounded-2xl border transition-all ${
                      player.isCurrentPlayer
                        ? "bg-gradient-to-r from-yellow-600/30 to-amber-800/30 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {/* Иконка места */}
                    <div className="w-10 flex justify-center items-center shrink-0">
                      {player.rank === 1 ? (
                        <Trophy className="text-yellow-400 drop-shadow-lg" size={24} />
                      ) : player.rank === 2 ? (
                        <Medal className="text-gray-300 drop-shadow-md" size={24} />
                      ) : player.rank === 3 ? (
                        <Medal className="text-amber-700 drop-shadow-md" size={24} />
                      ) : (
                        <span className="text-lg font-black text-gray-600">{player.rank}</span>
                      )}
                    </div>

                    {/* Информация об игроке */}
                    <div className="flex-1 min-w-0 pl-3">
                      <h3 className={`font-bold text-sm truncate ${player.isCurrentPlayer ? "text-yellow-300" : "text-gray-100"}`}>
                        {player.name}
                      </h3>
                      <p className="text-[13px] text-gray-400 truncate mt-0.5 font-medium">
                        {epochName}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end pl-2 shrink-0">
                      {/* Очки / Монеты */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-yellow-400 tracking-wide">
                          {formatNumber(player.totalEarned)}
                        </span>
                        <Image src="/money1.png" alt="coin" width={14} height={14} className="object-contain" />
                      </div>
                      
                      {/* Алмазы (показываем если больше 0) */}
                      {(player.diamonds || 0) > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 opacity-90">
                          <span className="font-bold text-[14px] text-cyan-300">
                            {formatNumber(player.diamonds || 0)}
                          </span>
                          <Image src="/diamond1.png" alt="diamond" width={14} height={14} className="object-contain drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]" />
                        </div>
                      )}

                      {player.isCurrentPlayer && (
                        <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mt-1">
                          Это вы
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}