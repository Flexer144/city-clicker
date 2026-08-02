import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface GameFieldProps {
  isBubbleVisible: boolean;
  setIsBubbleVisible: (val: boolean) => void;
  handleBubbleClick: () => void;
  isLocalCloudActive: boolean;
  centerObjectSrc: string;
  handleMainClick: (e: React.PointerEvent<HTMLDivElement>) => void;
  bubbleType: "coins" | "diamonds";
}

export default function GameField({
  isBubbleVisible,
  setIsBubbleVisible,
  handleBubbleClick,
  isLocalCloudActive,
  centerObjectSrc,
  handleMainClick,
  bubbleType
}: GameFieldProps) {
  return (
    <section className="relative z-10 flex-1 flex items-center justify-center pb-4">
      {/* ПЛАВАЮЩИЙ ДЕНЕЖНЫЙ ПУЗЫРЬ */}
      <AnimatePresence>
        {isBubbleVisible && (
          <motion.div
            initial={{ left: "-100px" }}
            animate={{ left: "120%" }}
            transition={{ duration: 10, ease: "linear" }}
            onAnimationComplete={() => setIsBubbleVisible(false)}
            className="absolute top-2/4 z-40 w-20 h-20 cursor-pointer"
            onClick={handleBubbleClick}
          >
            <motion.div
              animate={{ y: [-20, 20, -20] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              // Меняем цвет свечения в зависимости от типа
              className={`w-full h-full active:scale-90 ${
                bubbleType === "diamonds" 
                  ? "drop-shadow-[0_0_25px_rgba(34,211,238,0.9)]" 
                  : "drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
              }`}
            >
              {/* Если у тебя есть картинка blue-bubble.png, он покажет её. 
                  Если нет, можно временно юзать CSS-фильтр hue-rotate-180, чтобы сделать обычный пузырь синим */}
              <Image 
                src={bubbleType === "diamonds" ? "/blue-bubble.png" : "/bubble.png"} 
                alt="Денежный пузырь" 
                fill 
                className={`object-contain animate-pulse`} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ЦЕНТРАЛЬНАЯ ЗОНА КЛИКА */}
      <div className="relative flex items-center justify-center">
        {/* ЛОКАЛЬНОЕ ОБЛАКО СО СТРОЙМАТЕРИАЛАМИ */}
        <AnimatePresence>
          {isLocalCloudActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="absolute z-50 pointer-events-none w-96 h-96 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            >
              <Image src="/build-cloud.png" alt="Стройка" fill className="object-contain" priority />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кликабельный объект */}
        <div
          className="relative w-80 h-80 cursor-pointer active:scale-95 transition-transform duration-75 touch-manipulation drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
          onPointerDown={handleMainClick}
        >
          <Image src={centerObjectSrc} alt="Объект" fill className="object-contain" priority />
        </div>
      </div>
    </section>
  );
}