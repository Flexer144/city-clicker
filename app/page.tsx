"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ИМПОРТЫ КОМПОНЕНТОВ
import { ClickParticle, LeaderboardEntry, SaveData } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GameField from "./components/GameField";
import ShopModal from "./components/ShopModal";
import OfflineModal from "./components/OfflineModal";
import RatingModal from "./components/RatingModal";
import SettingsModal from "./components/SettingsModal";

const SAVE_KEY = "construction_century_save_v2";


type EpochConfig = {
  name: string; 
  thresholds: number[];
  bg: string;
  objects: string[];
  mayor: string; 
};

const EPOCHS: Record<number, EpochConfig> = {
  1: {
    name: "Лесная поляна",
    thresholds: [1000, 15000, 100000],
    bg: "/lawn-1.PNG",
    objects: ["/stump.PNG", "/hut12.PNG", "/tent1.PNG"],
    mayor: "/mayor1.png",
  },
  2: {
    name: "Деревня",
    thresholds: [500000, 3000000, 15000000],
    bg: "/background.png",
    objects: ["/wood-house.png", "/stone-house.png", "/town-hall.png"],
    mayor: "/mayor2.png",
  },
};

export default function Game() {
  // --- БАЗОВЫЕ СТЕЙТЫ ---
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isFirstLoad, setIsFirstLoad] = useState(true); 
  const [coins, setCoins] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [stage, setStage] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(1); 
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const [clickPower, setClickPower] = useState(1);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [critChance, setCritChance] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // --- СТЕЙТЫ ИНТЕРФЕЙСА ---
  const [isChestVisible, setIsChestVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickParticles, setClickParticles] = useState<ClickParticle[]>([]);

  const [isFullCloudActive, setIsFullCloudActive] = useState(true);
  const [isLocalCloudActive, setIsLocalCloudActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<"click" | "passive">("click");

  // --- СТЕЙТЫ ОФФЛАЙН ДОХОДА ---
  const [offlineEarned, setOfflineEarned] = useState(0);
  const [offlineTimeSec, setOfflineTimeSec] = useState(0);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  const currentConfig = EPOCHS[currentEpoch] || EPOCHS[1];
  const thresholds = currentConfig.thresholds;
  const nextThreshold = thresholds[stage] || thresholds[thresholds.length - 1];
  const progressPercent = Math.min((totalEarned / nextThreshold) * 100, 100);

  const [isClickAdCooldown, setIsClickAdCooldown] = useState(false);
  const [isPassiveAdCooldown, setIsPassiveAdCooldown] = useState(false);

  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [isBubbleModalOpen, setIsBubbleModalOpen] = useState(false);

  const clickUpgradeCost = Math.floor(50 * Math.pow(1.2, clickPower - 1));
  const passiveLevel = passiveIncome / 2;
  const passiveUpgradeCost = Math.floor(100 * Math.pow(1.3, passiveLevel));

  // ==========================================
  // СИСТЕМА СОХРАНЕНИЙ И ОФФЛАЙН ДОХОДА
  // ==========================================

  // 1. Загрузка данных при старте
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const data: SaveData = JSON.parse(saved);
        setCoins(data.coins ?? 0);
        setTotalEarned(data.totalEarned ?? 0);
        setStage(data.stage ?? 0);
        setCurrentEpoch(data.currentEpoch ?? 1);
        setClickPower(data.clickPower ?? 1);
        setPassiveIncome(data.passiveIncome ?? 0);
        setCritChance(data.critChance ?? 0);

        setUsername(data.username || `Игрок${Math.floor(Math.random() * 90000) + 10000}`);        
        setSoundEnabled(data.soundEnabled ?? true);
        setMusicEnabled(data.musicEnabled ?? true);
        setVibrationEnabled(data.vibrationEnabled ?? true);

        // Расчет оффлайн-дохода
        if (data.lastOnlineTimestamp && data.passiveIncome > 0) {
          const secondsOffline = Math.floor((Date.now() - data.lastOnlineTimestamp) / 1000);
          // Ограничиваем оффлайн-доход 8 часами (28800 секунд)
          const offlineSecondsCapped = Math.min(secondsOffline, 28800); 
          const offlineReward = offlineSecondsCapped * data.passiveIncome;
          
          if (offlineReward > 0) {
            setCoins((prev) => prev + offlineReward);
            setTotalEarned((prev) => prev + offlineReward);
            setOfflineEarned(offlineReward);
            setOfflineTimeSec(offlineSecondsCapped);
            setIsOfflineModalOpen(true);
          }
        }
      } catch (e) {
        console.error("Ошибка загрузки сохранения:", e);
      }
    } else {
      // Если сохранения вообще нет (первый вход) - генерируем ник сразу
      setUsername(`Игрок${Math.floor(Math.random() * 90000) + 10000}`)
    }
    setIsLoaded(true); 
  }, []);

  // 2. Автосохранение (каждые 5 сек + при закрытии вкладки)
  useEffect(() => {
    if (!isLoaded) return; // Не сохраняем, пока не загрузили!

    const saveProgress = () => {
      const saveData: SaveData = {
        coins,
        totalEarned,
        stage,
        currentEpoch,
        clickPower,
        critChance,
        passiveIncome,
        username,
        soundEnabled,
        musicEnabled,
        vibrationEnabled,
        lastOnlineTimestamp: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    };

    const interval = setInterval(saveProgress, 5000);
    window.addEventListener("beforeunload", saveProgress);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === 'hidden') saveProgress();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", saveProgress);
      window.removeEventListener("visibilitychange", saveProgress);
    };
  }, [isLoaded, coins, totalEarned, stage, currentEpoch, clickPower, passiveIncome, critChance, username, soundEnabled, musicEnabled, vibrationEnabled]);

  // ==========================================
  // ОСТАЛЬНАЯ ЛОГИКА
  // ==========================================

  // Тестовые данные (в будущем тут будет запрос к Yandex SDK)
  const mockLeaderboard: LeaderboardEntry[] = [
    { id: "1", rank: 1, name: "Император", epoch: 2, coins: 15400000, totalEarned: 25000000 },
    { id: "2", rank: 2, name: "МастерКирка", epoch: 2, coins: 8200000, totalEarned: 1580000 },
    { id: "3", rank: 3, name: "Саня_Стройка", epoch: 1, coins: 95000, totalEarned: 99000 },
    { id: "4", rank: 4, name: username, epoch: currentEpoch, coins: coins, totalEarned: totalEarned, isCurrentPlayer: true },
    { id: "5", rank: 5, name: "Новичок2026", epoch: 1, coins: 1500, totalEarned: 2000 },
  ].sort((a, b) => b.totalEarned - a.totalEarned).map((player, index) => ({...player, rank: index + 1})); // Автоматически сортируем и расставляем места

  const critUpgradeCost = Math.floor(500 * Math.pow(1.8, critChance / 5));
  const isCritUnlocked = currentEpoch > 1 || stage >= 2;

  const buyCritUpgrade = () => {
    if (!isCritUnlocked) return;
    const cost = critUpgradeCost;
    if (coins >= cost && critChance < 50) {
      setCoins((prev) => prev - cost);
      setCritChance((prev) => prev + 5);
    }
  };

  // Убираем облака после загрузки
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setIsFullCloudActive(false);
        // После того как облака исчезнут в первый раз, снимаем флаг первой загрузки
        setTimeout(() => setIsFirstLoad(false), 1000);
      }, 1500); // Даем игроку 1.5 секунды посмотреть на облака при старте
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isTransitioning || !isLoaded) return;

    // Проверяем достижение порогов для текущей эпохи
    if (stage === 0 && totalEarned >= thresholds[0]) {
      triggerObjectEvolution(1);
    } else if (stage === 1 && totalEarned >= thresholds[1]) {
      triggerObjectEvolution(2);
    } else if (stage === 2 && totalEarned >= thresholds[2]) {
      // Проверяем, есть ли следующая эпоха в нашем конфиге
      if (EPOCHS[currentEpoch + 1]) {
        triggerEpochTransition(currentEpoch + 1);
      } else {
        console.log("Достигнут конец доступного контента!");
      }
    }
  }, [totalEarned, stage, currentEpoch, thresholds, isTransitioning, isLoaded]);

  const triggerObjectEvolution = (nextStage: number) => {
    setIsTransitioning(true);
    setIsLocalCloudActive(true);
    setTimeout(() => setStage(nextStage), 700); 
    setTimeout(() => {
      setIsLocalCloudActive(false);
      setIsTransitioning(false); 
    }, 1500);
  };

  const triggerEpochTransition = (nextEpoch: number) => {
    setIsTransitioning(true);
    setIsFullCloudActive(true); // Показываем облака
    
    // Ждем секунду, пока облака полностью закроют экран (opacity станет 1)
    setTimeout(() => {
      setCurrentEpoch(nextEpoch);
      setStage(0); // Сбрасываем стадию постройки до 0 для новой эпохи
    }, 1000); 

    // Еще через полторы секунды убираем облака и разрешаем кликать
    setTimeout(() => {
      setIsFullCloudActive(false); 
      setIsTransitioning(false); 
    }, 2500); 
  };

  useEffect(() => {
    if (passiveIncome === 0 || !isLoaded) return;
    const interval = setInterval(() => {
      setCoins((prev) => prev + passiveIncome);
      setTotalEarned((prev) => prev + passiveIncome);
    }, 1000);
    return () => clearInterval(interval);
  }, [passiveIncome, isLoaded]);

  // ПОКУПКИ
  const buyClickUpgrade = () => {
    if (coins >= clickUpgradeCost) {
      setCoins((prev) => prev - clickUpgradeCost);
      setClickPower((prev) => prev + 1);
    }
  };

  const buyPassiveUpgrade = () => {
    if (coins >= passiveUpgradeCost) {
      setCoins((prev) => prev - passiveUpgradeCost);
      setPassiveIncome((prev) => prev + 2);
    }
  };

  // РЕКЛАМА И КЛИКИ
  const calculateAdReward = () => {
    const clickBasedReward = clickPower * 60;
    const progressBasedReward = Math.floor(nextThreshold * 0.15);
    return Math.max(150, clickBasedReward, progressBasedReward);
  };

  const adReward = calculateAdReward();
  const bubbleReward = Math.floor(adReward * 1.5);

  const handleUpgradeViaAd = () => {
    if (shopTab === "click") {
      setClickPower((prev) => prev + 2);
      setIsClickAdCooldown(true);
      setTimeout(() => setIsClickAdCooldown(false), 60000);
    } else {
      setPassiveIncome((prev) => prev + 2);
      setIsPassiveAdCooldown(true);
      setTimeout(() => setIsPassiveAdCooldown(false), 60000);
    }
  };

  const handleMainClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTransitioning) return;

    const isCrit = Math.random() * 100 < critChance;
    const earned = isCrit ? clickPower * 5 : clickPower; 

    setCoins((prev) => prev + earned);
    setTotalEarned((prev) => prev + earned);

    const newParticle: ClickParticle = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      value: earned, 
      rotation: (Math.random() - 0.5) * 25,
      offsetX: (Math.random() - 0.5) * 50,
      isCrit, 
    };
    setClickParticles((prev) => [...prev, newParticle]);
  };

  const handleWatchAd = () => {
    const reward = calculateAdReward();
    setCoins((prev) => prev + reward);
    setTotalEarned((prev) => prev + reward);
    setIsModalOpen(false);
    setIsChestVisible(false);
    setTimeout(() => setIsChestVisible(true), 45000);
  };

  useEffect(() => {
    const interval = setInterval(() => setIsBubbleVisible(true), 90000);
    return () => clearInterval(interval);
  }, []);

  const handleBubbleClick = () => {
    setIsBubbleVisible(false);
    setIsBubbleModalOpen(true);
  };

  const handleWatchBubbleAd = () => {
    setCoins((prev) => prev + bubbleReward);
    setTotalEarned((prev) => prev + bubbleReward);
    setIsBubbleModalOpen(false);
  };

  // Забрать обычную награду (базовые монеты уже начислены при загрузке)
  const handleClaimNormalOffline = () => {
    setIsOfflineModalOpen(false);
  };

  // Удвоить награду (добавляем еще 1х offlineEarned сверху)
  const handleDoubleOfflineReward = () => {
    // Здесь в будущем будет вызов рекламы Yandex SDK:
    // ysdk.adv.showRewardedVideo({ ... })
    
    setCoins((prev) => prev + offlineEarned);
    setTotalEarned((prev) => prev + offlineEarned);
    setIsOfflineModalOpen(false);
  };

  const getCenterObject = () => {
    return EPOCHS[currentEpoch]?.objects[stage] || "/stump.PNG";
  };

  const openShop = (tab: "click" | "passive") => {
    setShopTab(tab);
    setIsShopOpen(true);
  };

  // Не рендерим интерфейс, пока не загрузили сохранение (чтобы избежать мигания цифр)
  if (!isLoaded) return <div className="h-screen w-full bg-black" />;

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black flex justify-center selection:bg-transparent">
      
      {/* АНИМАЦИЯ ЦИФР */}
      <AnimatePresence>
        {clickParticles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, scale: 0.1, x: particle.x, y: particle.y, rotate: particle.rotation }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.1, 1.1, 0.9, 0.5], y: particle.y - 210, x: particle.x + particle.offsetX }}
            transition={{ duration: 1.1, times: [0, 0.15, 0.75, 1], ease: "easeOut" }}
            onAnimationComplete={() => setClickParticles((prev) => prev.filter((p) => p.id !== particle.id))}
            className="fixed top-0 left-0 pointer-events-none z-[100] select-none -translate-x-1/2 -translate-y-1/2"
          >
            <span
              className={`font-black tracking-wider ${
                particle.isCrit ? "text-2xl text-red-500" : "text-2xl text-amber-300"
              }`}
              style={{ 
                WebkitTextStroke: particle.isCrit ? "2px #7f1d1d" : "2px #78350f", 
                filter: particle.isCrit ? "drop-shadow(0 0 20px rgba(239, 68, 68, 0.9))" : "drop-shadow(0 0 12px rgba(251, 191, 36, 0.7))" 
              }}
            >
              +{particle.value} {particle.isCrit}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
        
        {/* ФОН */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={EPOCHS[currentEpoch]?.bg || "/lawn-1.PNG"} 
            alt="Фон" 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)] pointer-events-none" />
        </div>

        <Header 
          totalEarned={totalEarned} nextThreshold={nextThreshold} progressPercent={progressPercent}
          coins={coins} isChestVisible={isChestVisible} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
          mayorImage={EPOCHS[currentEpoch]?.mayor || "/mayor1.png"}
          openSettings={() => setIsSettingsOpen(true)}
        />

        <GameField 
          isBubbleVisible={isBubbleVisible} setIsBubbleVisible={setIsBubbleVisible} 
          handleBubbleClick={handleBubbleClick} isLocalCloudActive={isLocalCloudActive}
          centerObjectSrc={getCenterObject()} handleMainClick={handleMainClick}
        />

        <Footer 
          openShop={openShop} 
          openRating={() => setIsRatingOpen(true)}
        />

        <ShopModal 
          isShopOpen={isShopOpen} setIsShopOpen={setIsShopOpen} shopTab={shopTab} setShopTab={setShopTab}
          coins={coins} clickPower={clickPower} passiveIncome={passiveIncome} 
          clickUpgradeCost={clickUpgradeCost} passiveUpgradeCost={passiveUpgradeCost}
          isClickAdCooldown={isClickAdCooldown} isPassiveAdCooldown={isPassiveAdCooldown}
          buyClickUpgrade={buyClickUpgrade} buyPassiveUpgrade={buyPassiveUpgrade} handleUpgradeViaAd={handleUpgradeViaAd}
          
          critChance={critChance}
          critUpgradeCost={critUpgradeCost}
          buyCritUpgrade={buyCritUpgrade}
          isCritUnlocked={isCritUnlocked}
        />

        <RatingModal 
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          leaderboard={mockLeaderboard}
          epochsConfig={EPOCHS}
        />

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          mayorImage={EPOCHS[currentEpoch]?.mayor || "/mayor1.png"}
          username={username}
          setUsername={setUsername}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          vibrationEnabled={vibrationEnabled}
          setVibrationEnabled={setVibrationEnabled}
        />

        {/* МОДАЛЬНОЕ ОКНО ОФФЛАЙН ДОХОДА */}
        <OfflineModal 
          isOpen={isOfflineModalOpen} 
          onClaimNormal={handleClaimNormalOffline}
          onDoubleReward={handleDoubleOfflineReward}
          offlineEarned={offlineEarned} 
          offlineTimeSec={offlineTimeSec} 
        />

        {/* ОСТАЛЬНЫЕ ИВЕНТЫ (Сундук и Пузырь) */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="bg-gradient-to-b from-[#2d1f05] via-[#1a1203] to-black border-2 border-yellow-500/80 rounded-3xl p-6 flex flex-col items-center w-full max-w-sm shadow-[0_0_50px_rgba(234,179,8,0.3)] relative">
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="relative w-56 h-56 mb-0 drop-shadow-[0_10px_25px_rgba(234,179,8,0.6)]">
                  <Image src="/chest1.png" alt="Сундук" fill className="object-contain" />
                </motion.div>
                <h2 className="text-2xl font-black text-yellow-400 mb-2 uppercase tracking-wide text-center drop-shadow-md">Секретная поставка!</h2>
                <p className="text-yellow-100/90 text-center text-sm mb-6 leading-relaxed">Инвесторы привезли ресурсы. Посмотри видео и забери бонус: <span className="text-yellow-300 font-black text-xl block mt-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">+{adReward.toLocaleString()} монет</span></p>
                <button onClick={handleWatchAd} className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black text-lg py-4 rounded-2xl mb-3 shadow-[0_6px_0_#9a3412] active:translate-y-[6px] transition-all uppercase tracking-wider">Посмотреть видео</button>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-200 text-xs font-semibold uppercase tracking-widest py-2">Отказаться от награды</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isBubbleModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="bg-gradient-to-b from-[#0f2b48] via-[#091a2d] to-black border-2 border-blue-400/80 rounded-3xl p-6 flex flex-col items-center w-full max-w-sm shadow-[0_0_50px_rgba(59,130,246,0.4)] relative">
                <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="relative w-36 h-36 mb-2 drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]">
                  <Image src="/bubble.png" alt="Пузырь" fill className="object-contain" />
                </motion.div>
                <h2 className="text-2xl font-black text-cyan-300 mb-2 uppercase tracking-wide text-center drop-shadow-md">Удачный улов!</h2>
                <p className="text-blue-100/90 text-center text-sm mb-6 leading-relaxed">Редкий пузырь! Посмотрите видео и заберите солидный бонус: <span className="text-yellow-300 font-black text-2xl block mt-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">+{bubbleReward.toLocaleString()} монет</span></p>
                <button onClick={handleWatchBubbleAd} className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-2xl mb-3 shadow-[0_6px_0_#1e3a8a] active:translate-y-[6px] transition-all uppercase tracking-wider">Забрать куш</button>
                <button onClick={() => setIsBubbleModalOpen(false)} className="text-gray-400 hover:text-gray-200 text-xs font-semibold uppercase tracking-widest py-2">Отказаться</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ПОЛНОЭКРАННЫЕ ОБЛАКА */}
        <AnimatePresence>
          {isFullCloudActive && (
            <motion.div 
              // Если это первая загрузка - облака сразу 100% видимы. Иначе - плавно появляются из 0.
              initial={{ opacity: isFirstLoad ? 1 : 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 1, ease: "easeInOut" }} 
              className="absolute inset-0 z-[100] w-full h-full overflow-hidden pointer-events-auto"
            >
              <div className="relative w-full h-full">
                <Image src="/full-clouds2.png" alt="Облака" fill className="object-cover" priority />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </main>
  );
}