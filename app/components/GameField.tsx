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
  objectScale: number; 
}

export default function GameField({
  isBubbleVisible,
  setIsBubbleVisible,
  handleBubbleClick,
  isLocalCloudActive,
  centerObjectSrc,
  handleMainClick,
  objectScale,
  bubbleType
}: GameFieldProps) {
  return (
    <section className="relative z-10 flex-1 flex items-center justify-center">
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
              className={`w-full h-full active:scale-90 ${
                bubbleType === "diamonds" 
                  ? "drop-shadow-[0_0_25px_rgba(34,211,238,0.9)]" 
                  : "drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
              }`}
            >
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

      {/* ЦЕНТРАЛЬНАЯ ЗОНА */}
      <div className="relative flex items-center justify-center w-full h-80 sm:h-80">
        
        {/* 1. ЛОКАЛЬНОЕ ОБЛАКО ПРИ СТРОЙКЕ */}
        <AnimatePresence>
          {isLocalCloudActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              className="absolute z-20 w-84 h-84 sm:w-80 sm:h-80 pointer-events-none"
            >
              <Image src="/build-cloud.png" alt="Облако" fill className="object-contain" priority />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. ГЛАВНЫЙ КЛИКАБЕЛЬНЫЙ ОБЪЕКТ С ДИНАМИЧЕСКИМ МАСШТАБОМ */}
        <motion.div
          className="pt-10 absolute z-10 w-90 h-90 sm:w-100 sm:h-100 cursor-pointer touch-none flex items-center justify-center drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
          whileTap={{ scale: 0.95 }}
          onPointerDown={handleMainClick}
        >
          {/* Резиновый контейнер, который отвечает за размер */}
          <div 
            className="relative transition-all duration-700 ease-in-out"
            style={{ width: `${objectScale * 100}%`, height: `${objectScale * 100}%` }}
          >
            <Image 
              src={centerObjectSrc} 
              alt="Объект" 
              fill 
              className="object-contain"
              priority 
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}