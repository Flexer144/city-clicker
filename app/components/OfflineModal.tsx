import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface OfflineModalProps {
  isOpen: boolean;
  onClaimNormal: () => void;
  onDoubleReward: () => void;
  offlineEarned: number;
  offlineTimeSec: number;
}

export default function OfflineModal({
  isOpen,
  onClaimNormal,
  onDoubleReward,
  offlineEarned,
  offlineTimeSec,
}: OfflineModalProps) {
  // Переводим секунды в часы и минуты для красивого отображения
  const hours = Math.floor(offlineTimeSec / 3600);
  const minutes = Math.floor((offlineTimeSec % 3600) / 60);
  let timeString = "";
  if (hours > 0) timeString += `${hours} ч `;
  if (minutes > 0 || hours === 0) timeString += `${minutes} мин`;

  // Сумма с учетом удвоения
  const doubledReward = offlineEarned * 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[101] flex items-center justify-center px-6 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-b from-[#1a2f1c] via-[#0e1a0f] to-black border-2 border-green-500/80 rounded-3xl p-6 flex flex-col items-center w-full max-w-sm shadow-[0_0_50px_rgba(34,197,94,0.3)] relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="relative w-40 h-40 mb-2 drop-shadow-[0_10px_25px_rgba(34,197,94,0.6)]"
            >
              <Image src="/money1.png" alt="Оффлайн доход" fill className="object-contain" priority />
            </motion.div>
            
            <h2 className="text-2xl font-black text-green-400 mb-1 uppercase tracking-wide text-center drop-shadow-md">
              С возвращением!
            </h2>
            
            <p className="text-green-100/90 text-center text-sm mb-6 leading-relaxed">
              Пока вас не было ({timeString}), ваша бригада трудилась и заработала:
              <span className="text-yellow-300 font-black text-2xl block mt-1 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                +{offlineEarned.toLocaleString()} монет
              </span>
            </p>
            
            {/* ГЛАВНАЯ КНОПКА: УДВОИТЬ ЗА РЕКЛАМУ */}
            <button
              onClick={onDoubleReward}
              className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black text-lg py-4 rounded-2xl mb-3 shadow-[0_6px_0_#9a3412] active:translate-y-[6px] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Удвоить (+{doubledReward.toLocaleString()})</span>
            </button>

            {/* ВТОРОСТЕПЕННАЯ КНОПКА: ЗАБРАТЬ ОБЫЧНУЮ НАГРАДУ */}
            <button
              onClick={onClaimNormal}
              className="text-gray-400 hover:text-gray-200 text-xs font-semibold uppercase tracking-widest py-2 transition-colors"
            >
              Забрать обычную награду
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}