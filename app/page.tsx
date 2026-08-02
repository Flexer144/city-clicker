"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "./utils";
import { audioManager } from "./audio";

// ИМПОРТЫ КОМПОНЕНТОВ
import { ClickParticle, LeaderboardEntry, SaveData } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GameField from "./components/GameField";
import ShopModal from "./components/ShopModal";
import OfflineModal from "./components/OfflineModal";
import RatingModal from "./components/RatingModal";
import SettingsModal from "./components/SettingsModal";

const SAVE_KEY = "construction_century_save_v3";


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
    objects: ["/reed-house1.png", "/stone-house.png", "/reed-house1.png"],
    mayor: "/mayor2.png",
  },
};

export default function Game() {
  // --- БАЗОВЫЕ СТЕЙТЫ ---
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isFirstLoad, setIsFirstLoad] = useState(true); 
  const [coins, setCoins] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [diamondUpgrades, setDiamondUpgrades] = useState(0);
  const [lastDiamondChestTimestamp, setLastDiamondChestTimestamp] = useState(0);
  const [lastShopAdTimestamp, setLastShopAdTimestamp] = useState(0);
  const [isDiamondChestVisible, setIsDiamondChestVisible] = useState(false);
  const [isDiamondChestModalOpen, setIsDiamondChestModalOpen] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [stage, setStage] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(1); 
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const [clickPower, setClickPower] = useState(1);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [clickLevel, setClickLevel] = useState(1);
  const [passiveLevel, setPassiveLevel] = useState(0)
  const [critChance, setCritChance] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const [goldRushEndTime, setGoldRushEndTime] = useState(0);
  const [autoForemanEndTime, setAutoForemanEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // --- СТЕЙТЫ ИНТЕРФЕЙСА ---
  const [isChestVisible, setIsChestVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickParticles, setClickParticles] = useState<ClickParticle[]>([]);

  const [isFullCloudActive, setIsFullCloudActive] = useState(true);
  const [isLocalCloudActive, setIsLocalCloudActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<"click" | "passive" | "premium">("click");

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
  const [bubbleType, setBubbleType] = useState<"coins" | "diamonds">("coins");
  const [isBubbleModalOpen, setIsBubbleModalOpen] = useState(false);

  const clickUpgradeCost = Math.floor(25 * Math.pow(1.15, clickLevel - 1));
  const clickPowerToAdd = Math.floor(1 + Math.pow(1.045, clickLevel - 1));

  const passiveUpgradeCost = Math.floor(50 * Math.pow(1.16, passiveLevel));
  const passiveIncomeToAdd = Math.floor(2 + Math.pow(1.05, passiveLevel));

  // ==========================================
  // СИСТЕМА СОХРАНЕНИЙ И ОФФЛАЙН ДОХОДА, ЗВУКИ
  // ==========================================

  // --- УПРАВЛЕНИЕ АУДИО ---
  useEffect(() => {
    if (isLoaded) {
      audioManager.init();
      audioManager.updateSettings(musicEnabled, soundEnabled);
    }
  }, [isLoaded, musicEnabled, soundEnabled]);

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
        setClickLevel(data.clickLevel ?? data.clickPower ?? 1);
        setPassiveLevel(data.passiveLevel ?? (data.passiveIncome ? data.passiveIncome / 2 : 0));
        setCritChance(data.critChance ?? 0);
        setDiamonds(data.diamonds ?? 0);
        setDiamondUpgrades(data.diamondUpgrades ?? 0);
        setGoldRushEndTime(data.goldRushEndTime ?? 0);
        setAutoForemanEndTime(data.autoForemanEndTime ?? 0);
        const savedChestTime = data.lastDiamondChestTimestamp ?? 0;
        setLastDiamondChestTimestamp(savedChestTime);
        setLastShopAdTimestamp(data.lastShopAdTimestamp ?? 0);
        // Проверяем: если прошло 24 часа (86 400 000 мс) с прошлого сундука - показываем новый!
        if (Date.now() - savedChestTime > 86400000) {
          setIsDiamondChestVisible(true);
        }

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
        diamonds,
        diamondUpgrades,
        goldRushEndTime,
        autoForemanEndTime,
        lastDiamondChestTimestamp,
        lastShopAdTimestamp, 
        clickLevel,
        passiveLevel,

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
  }, [isLoaded, coins, totalEarned, stage, currentEpoch, clickPower, passiveIncome, critChance, username, soundEnabled, musicEnabled, vibrationEnabled, diamonds, lastDiamondChestTimestamp, lastShopAdTimestamp, diamondUpgrades, goldRushEndTime, autoForemanEndTime, clickLevel, passiveLevel]);

  // ==========================================
  // ОСТАЛЬНАЯ ЛОГИКА
  // ==========================================

  const mockLeaderboard: LeaderboardEntry[] = [
    { id: "1", rank: 1, name: "Император", epoch: 2, coins: 15400000, totalEarned: 25000000, diamonds: 450 },
    { id: "2", rank: 2, name: "МастерКирка", epoch: 2, coins: 8200000, totalEarned: 12000000, diamonds: 120 },
    { id: "3", rank: 3, name: "Саня_Стройка", epoch: 1, coins: 95000, totalEarned: 99000, diamonds: 0 },
    { id: "4", rank: 4, name: username, epoch: currentEpoch, coins: coins, totalEarned: totalEarned, diamonds: diamonds, isCurrentPlayer: true },
    { id: "5", rank: 5, name: "Новичок2026", epoch: 1, coins: 1500, totalEarned: 2000, diamonds: 0 },
  ].sort((a, b) => b.totalEarned - a.totalEarned).map((player, index) => ({...player, rank: index + 1}));

  // Обновляем часы каждую секунду, чтобы интерфейс понимал, когда буст закончился
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isGoldRushActive = goldRushEndTime > currentTime;
  const isAutoForemanActive = autoForemanEndTime > currentTime;

  const baseDiamondMultiplier = 1 + (diamondUpgrades * 0.1); 
  const activeMultiplier = baseDiamondMultiplier * (isGoldRushActive ? 3 : 1);

  const diamondUpgradeCost = Math.floor(50 * Math.pow(1.5, diamondUpgrades));
  const GOLD_RUSH_COST = 20;
  const AUTO_FOREMAN_COST = 15;

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

  const handleWatchDiamondChestAd = () => {
    // В будущем здесь будет вызов рекламы: ysdk.adv.showRewardedVideo(...)
    audioManager.play("reward");
    setDiamonds((prev) => prev + 15); 
    setLastDiamondChestTimestamp(Date.now()); 
    setIsDiamondChestVisible(false); 
    setIsDiamondChestModalOpen(false); 
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
      }
    }
  }, [totalEarned, stage, currentEpoch, thresholds, isTransitioning, isLoaded]);

  const triggerObjectEvolution = (nextStage: number) => {
    setIsTransitioning(true);
    setIsLocalCloudActive(true);
    audioManager.play("build"); // <-- ЗВУК СТРОЙКИ (воздух + молоток)
    setDiamonds((prev) => prev + 1);
    setTimeout(() => setStage(nextStage), 700); 
    setTimeout(() => {
      setIsLocalCloudActive(false);
      setIsTransitioning(false); 
    }, 1500);
  };

  const triggerEpochTransition = (nextEpoch: number) => {
    setIsTransitioning(true);
    setIsFullCloudActive(true); 
    setDiamonds((prev) => prev + 10);
    audioManager.play("whoosh"); // <-- ЗВУК ВОЗДУХА
    
    setTimeout(() => {
      setCurrentEpoch(nextEpoch);
      setStage(0);
    }, 1000); 

    setTimeout(() => {
      setIsFullCloudActive(false); 
      setIsTransitioning(false); 
    }, 2500); 
  };

  // ЭФФЕКТ АВТО-ПРОРАБА
  useEffect(() => {
    if (!isLoaded || !isAutoForemanActive) return;

    const interval = setInterval(() => {
      const earned = clickPower * activeMultiplier;
      setCoins((prev) => prev + earned);
      setTotalEarned((prev) => prev + earned);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoaded, isAutoForemanActive, clickPower, activeMultiplier]);

  useEffect(() => {
    if (passiveIncome === 0 || !isLoaded) return;
    const interval = setInterval(() => {
      const earned = passiveIncome * activeMultiplier; 
      setCoins((prev) => prev + earned);
      setTotalEarned((prev) => prev + earned);
    }, 1000);
    return () => clearInterval(interval);
  }, [passiveIncome, isLoaded, activeMultiplier]);

  const buyClickUpgrade = () => {
    if (coins >= clickUpgradeCost) {
      setCoins((prev) => prev - clickUpgradeCost);
      setClickPower((prev) => prev + clickPowerToAdd);
      setClickLevel((prev) => prev + 1);
    }
  };

  const buyDiamondUpgrade = () => {
    if (diamonds >= diamondUpgradeCost) {
      setDiamonds((prev) => prev - diamondUpgradeCost);
      setDiamondUpgrades((prev) => prev + 1);
    }
  };

  const buyGoldRush = () => {
    if (diamonds >= GOLD_RUSH_COST && !isGoldRushActive) {
      setDiamonds((prev) => prev - GOLD_RUSH_COST);
      setGoldRushEndTime(Date.now() + 5 * 60 * 1000); // 5 минут
    }
  };

  const buyAutoForeman = () => {
    if (diamonds >= AUTO_FOREMAN_COST && !isAutoForemanActive) {
      setDiamonds((prev) => prev - AUTO_FOREMAN_COST);
      setAutoForemanEndTime(Date.now() + 2 * 60 * 1000); // 2 минуты
    }
  };

  const handleShopDiamondAd = () => {
    // В будущем здесь будет ysdk.adv.showRewardedVideo(...)
    setDiamonds((prev) => prev + 5);
    setLastShopAdTimestamp(Date.now());
  };

  const buyPassiveUpgrade = () => {
    if (coins >= passiveUpgradeCost) {
      setCoins((prev) => prev - passiveUpgradeCost);
      setPassiveIncome((prev) => prev + passiveIncomeToAdd);
      setPassiveLevel((prev) => prev + 1);
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
      setClickPower((prev) => prev + clickPowerToAdd);
      setClickLevel((prev) => prev + 1);
      setIsClickAdCooldown(true);
      setTimeout(() => setIsClickAdCooldown(false), 60000);
    } else {
      setPassiveIncome((prev) => prev + passiveIncomeToAdd);
      setPassiveLevel((prev) => prev + 1);
      setIsPassiveAdCooldown(true);
      setTimeout(() => setIsPassiveAdCooldown(false), 60000);
    }
  };

  const handleMainClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTransitioning) return;

    const isCrit = Math.random() * 100 < critChance;
    const baseEarned = isCrit ? clickPower * 5 : clickPower;
    const earned = baseEarned * activeMultiplier;
    audioManager.play("click"); // <-- ЗВУК КЛИКА

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
    audioManager.play("reward"); // <-- ЗВУК ЗВОНА МОНЕТ
    setCoins((prev) => prev + reward);
    setTotalEarned((prev) => prev + reward);
    setIsModalOpen(false);
    setIsChestVisible(false);
    setTimeout(() => setIsChestVisible(true), 45000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const isDiamond = Math.random() < 0.1;
      setBubbleType(isDiamond ? "diamonds" : "coins");
      setIsBubbleVisible(true);
    }, 90000);
    return () => clearInterval(interval);
  }, []);

  const handleBubbleClick = () => {
    setIsBubbleVisible(false);
    audioManager.play("pop");
    
    if (bubbleType === "diamonds") {
      const reward = Math.floor(Math.random() * 3) + 1;
      setDiamonds((prev) => prev + reward);
    } else {
      setIsBubbleModalOpen(true);
    }
  };

  const handleWatchBubbleAd = () => {
    setCoins((prev) => prev + bubbleReward);
    audioManager.play("reward"); // <-- ЗВУК ЗВОНА МОНЕТ
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
              +{formatNumber(particle.value)} {particle.isCrit}
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
          mayorImage={EPOCHS[currentEpoch]?.mayor || "/mayor1.png"} diamonds={diamonds} currentEpoch={currentEpoch}
          openSettings={() => setIsSettingsOpen(true)}
        />

        <GameField 
          isBubbleVisible={isBubbleVisible} setIsBubbleVisible={setIsBubbleVisible} 
          handleBubbleClick={handleBubbleClick} isLocalCloudActive={isLocalCloudActive}
          centerObjectSrc={getCenterObject()} handleMainClick={handleMainClick} bubbleType={bubbleType}
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
          currentEpoch={currentEpoch}
          diamonds={diamonds}
          diamondUpgrades={diamondUpgrades}
          diamondUpgradeCost={diamondUpgradeCost}
          buyDiamondUpgrade={buyDiamondUpgrade}
          lastShopAdTimestamp={lastShopAdTimestamp}
          handleShopDiamondAd={handleShopDiamondAd}
          critChance={critChance}
          critUpgradeCost={critUpgradeCost}
          buyCritUpgrade={buyCritUpgrade}
          isCritUnlocked={isCritUnlocked}
          goldRushEndTime={goldRushEndTime}
          autoForemanEndTime={autoForemanEndTime}
          currentTime={currentTime}
          buyGoldRush={buyGoldRush}
          buyAutoForeman={buyAutoForeman}
          clickPowerToAdd={clickPowerToAdd}
          passiveIncomeToAdd={passiveIncomeToAdd} 
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
                <p className="text-yellow-100/90 text-center text-sm mb-6 leading-relaxed">Инвесторы привезли ресурсы. Посмотри видео и забери бонус: <span className="text-yellow-300 font-black text-xl block mt-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">+{formatNumber(adReward)} монет</span></p>
                <button onClick={() => { audioManager.play("ui"); handleWatchAd(); }} className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black text-lg py-4 rounded-2xl mb-3 shadow-[0_6px_0_#9a3412] active:translate-y-[6px] transition-all uppercase tracking-wider">Посмотреть видео</button>
                <button onClick={() => { audioManager.play("ui"); setIsModalOpen(false); }} className="text-gray-400 hover:text-gray-200 text-xs font-semibold uppercase tracking-widest py-2">Отказаться от награды</button>
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
                <p className="text-blue-100/90 text-center text-sm mb-6 leading-relaxed">Редкий пузырь! Посмотрите видео и заберите солидный бонус: <span className="text-yellow-300 font-black text-2xl block mt-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">+{formatNumber(bubbleReward)} монет</span></p>
                <button onClick={() => { audioManager.play("ui"); handleWatchBubbleAd(); }} className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-2xl mb-3 shadow-[0_6px_0_#1e3a8a] active:translate-y-[6px] transition-all uppercase tracking-wider">Забрать куш</button>
                <button onClick={() => { audioManager.play("ui"); setIsBubbleModalOpen(false); }} className="text-gray-400 hover:text-gray-200 text-xs font-semibold uppercase tracking-widest py-2">Отказаться</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ИКОНКА АЛМАЗНОГО СУНДУКА НА ЭКРАНЕ (появляется раз в сутки) */}
        <AnimatePresence>
          {isDiamondChestVisible && !isDiamondChestModalOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute bottom-29 -right-3 w-28 h-28 sm:w-32 sm:h-32 animate-pulse cursor-pointer hover:scale-110 active:scale-95 transition-all drop-shadow-[0_0_30px_rgba(34,211,238,0.9)] z-40"
              onClick={() => setIsDiamondChestModalOpen(true)}
            >
              <Image src="/chest.png" alt="Алмазный Сундук" fill className="object-contain drop-shadow-2xl hue-rotate-180 brightness-125" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* МОДАЛЬНОЕ ОКНО АЛМАЗНОГО СУНДУКА */}
        <AnimatePresence>
          {isDiamondChestModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center px-6 bg-black/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="bg-gradient-to-b from-[#082f49] via-[#0c4a6e] to-black border-2 border-cyan-400/80 rounded-3xl p-6 flex flex-col items-center w-full max-w-sm shadow-[0_0_60px_rgba(34,211,238,0.4)] relative">
                
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="relative w-64 h-64 mb-0 drop-shadow-[0_10px_35px_rgba(34,211,238,0.7)]">
                  <Image src="/chest1.png" alt="Алмазный Сундук" fill className="object-contain hue-rotate-180 brightness-125" />
                </motion.div>
                
                <h2 className="text-2xl font-black text-cyan-300 mb-2 uppercase tracking-wide text-center drop-shadow-md">
                  Сокровище Империи!
                </h2>
                <p className="text-cyan-100/90 text-center text-sm mb-6 leading-relaxed">
                  Вам попался невероятно редкий сундук. Посмотрите видео, чтобы забрать награду: 
                  <span className="text-cyan-300 font-black text-2xl block mt-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                    +15 алмазов
                  </span>
                </p>
                
                <button onClick={handleWatchDiamondChestAd} className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-white font-black text-lg py-4 rounded-2xl mb-3 shadow-[0_6px_0_#1e3a8a] active:translate-y-[6px] transition-all uppercase tracking-wider flex justify-center items-center gap-2">
                  <span>🎬 Открыть</span>
                </button>
                
                <button onClick={() => setIsDiamondChestModalOpen(false)} className="text-gray-400 hover:text-gray-200 text-xs font-semibold uppercase tracking-widest py-2">
                  Спрятать сундук
                </button>
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