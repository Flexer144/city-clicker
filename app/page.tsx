"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "./utils";
import { audioManager } from "./audio";
import { vibrationManager } from "./vibration";

// ИМПОРТЫ КОМПОНЕНТОВ
import { ClickParticle, LeaderboardEntry, SaveData } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GameField from "./components/GameField";
import ShopModal from "./components/ShopModal";
import OfflineModal from "./components/OfflineModal";
import RatingModal from "./components/RatingModal";
import SettingsModal from "./components/SettingsModal";

const SAVE_KEY = "construction_century_save_v8";

type ObjectConfig = {
  src: string;
  scale: number; 
};

type EpochConfig = {
  name: string; 
  thresholds: number[];
  bg: string;
  objects: ObjectConfig[]; 
  mayor: string; 
};

const EPOCHS: Record<number, EpochConfig> = {
  1: {
    name: "Лесная поляна",
    thresholds: [1000, 15000, 100000],
    bg: "/lawn-1.PNG",
    objects: [
      { src: "/stump.PNG", scale: 0.7 }, 
      { src: "/hut12.PNG", scale: 0.85 }, 
      { src: "/tent1.PNG", scale: 1.0 },  
    ],
    mayor: "/mayor1.png",
  },
  2: {
    name: "Деревня",
    thresholds: [500000, 5000000, 20000000],
    bg: "/background.png",
    objects: [
      { src: "/reed-house5.png", scale: 0.8 },
      { src: "/wood-house2.png", scale: 1.0 },
      { src: "/break-house2.png", scale: 1.0 },
    ],
    mayor: "/mayor2.png",
  },
};
export default function Game() {
  // --- YANDEX SDK СТЕЙТЫ ---
  const [ysdk, setYsdk] = useState<any>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [player, setPlayer] = useState<any>(null); 

  // --- БАЗОВЫЕ СТЕЙТЫ ---
  const [isLoaded, setIsLoaded] = useState(false); 
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [hasSeenComingSoon, setHasSeenComingSoon] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
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

  const [isFullCloudActive, setIsFullCloudActive] = useState(false);
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
  // YANDEX SDK ИНИЦИАЛИЗАЦИЯ
  // ==========================================

  // ИНИЦИАЛИЗАЦИЯ YANDEX SDK И ИГРОКА
  useEffect(() => {
    if (typeof window !== "undefined" && window.YaGames) {
      window.YaGames.init()
        .then((ysdkInstance: any) => {
          setYsdk(ysdkInstance);
          window.ysdk = ysdkInstance;
          
          ysdkInstance.getPlayer({ scopes: false })
            .then((_player: any) => {
              setPlayer(_player);
              console.log("Player API готов! Облачные сохранения подключены.");
            })
            .catch((err: any) => {
              console.warn("Игрок не авторизован. Облако недоступно.");
            });
        })
        .catch((err: any) => console.error("Ошибка SDK:", err));
    }
  }, []);


  // ==========================================
  // СИСТЕМА СОХРАНЕНИЙ И ОФФЛАЙН ДОХОДА, ЗВУКИ
  // ==========================================

  // --- УПРАВЛЕНИЕ АУДИО ---
  useEffect(() => {
    if (isLoaded && hasStarted) {
      if (isAdPlaying) {
        vibrationManager.updateSettings(vibrationEnabled);
        audioManager.updateSettings(false, false);
      } else {
        audioManager.updateSettings(musicEnabled, soundEnabled);
      }
    }
  }, [isLoaded, hasStarted, musicEnabled, soundEnabled, isAdPlaying]);

  // --- ЛОГИКА ЗАГРУЗОЧНОГО ЭКРАНА ---
  useEffect(() => {
    if (!isLoaded) return;
    
    // Имитация загрузки ассетов (от 0 до 100)
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReadyToStart(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 4) + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Срабатывает, когда игрок кликает "Начать"
  const handleStartGame = () => {
    if (!isReadyToStart) return;
    
    audioManager.init();
    setHasStarted(true); 

    if (ysdk && ysdk.features.LoadingAPI) {
      ysdk.features.LoadingAPI.ready();
    }
  };

  // 1. Загрузка данных при старте (Облако Яндекса + Локальный бэкап)
  useEffect(() => {
    const initLoad = async () => {
      let data: SaveData | null = null;

      if (player) {
        try {
          const cloudData = await player.getData();
          if (cloudData && Object.keys(cloudData).length > 0) {
            data = cloudData as SaveData;
          }
        } catch (e) { console.warn("Не удалось загрузить из облака", e); }
      }

      if (!data) {
        const local = localStorage.getItem(SAVE_KEY);
        if (local) data = JSON.parse(local) as SaveData;
      }

      if (data) {
        setCoins(data.coins ?? 0);
        setTotalEarned(data.totalEarned ?? 0);
        setStage(data.stage ?? 0);
        setCurrentEpoch(data.currentEpoch ?? 1);
        setClickPower(data.clickPower ?? 1);
        setPassiveIncome(data.passiveIncome ?? 0);
        setCritChance(data.critChance ?? 0);
        setDiamonds(data.diamonds ?? 0);
        setDiamondUpgrades(data.diamondUpgrades ?? 0);
        setGoldRushEndTime(data.goldRushEndTime ?? 0);
        setAutoForemanEndTime(data.autoForemanEndTime ?? 0);
        
        setClickLevel(data.clickLevel ?? data.clickPower ?? 1);
        setPassiveLevel(data.passiveLevel ?? (data.passiveIncome ? data.passiveIncome / 2 : 0));
        setHasSeenComingSoon(data.hasSeenComingSoon ?? false); 
        
        const savedChestTime = data.lastDiamondChestTimestamp ?? 0;
        setLastDiamondChestTimestamp(savedChestTime);
        setLastShopAdTimestamp(data.lastShopAdTimestamp ?? 0);
        if (Date.now() - savedChestTime > 86400000) {
          setIsDiamondChestVisible(true);
        }

        setUsername(data.username || `Игрок${Math.floor(Math.random() * 90000) + 10000}`);        
        setSoundEnabled(data.soundEnabled ?? true);
        setMusicEnabled(data.musicEnabled ?? true);
        setVibrationEnabled(data.vibrationEnabled ?? true);

        // Расчет оффлайн-дохода
        if (data.lastOnlineTimestamp && data.passiveIncome && data.passiveIncome > 0) {
          const secondsOffline = Math.floor((Date.now() - data.lastOnlineTimestamp) / 1000);
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
      } else {
        setUsername(`Игрок${Math.floor(Math.random() * 90000) + 10000}`);
      }
      
      setIsLoaded(true);
    };

    const timer = setTimeout(initLoad, 500);
    return () => clearTimeout(timer);
  }, [player]);

  // 2. Автосохранение (каждые 5 сек + при закрытии вкладки)
  useEffect(() => {
    if (!isLoaded) return;

    const saveProgress = () => {
      const saveData: SaveData = {
        coins, totalEarned, stage, currentEpoch, clickPower, critChance, passiveIncome,
        username, soundEnabled, musicEnabled, vibrationEnabled, diamonds, diamondUpgrades,
        goldRushEndTime, autoForemanEndTime, clickLevel, passiveLevel,
        lastDiamondChestTimestamp, lastShopAdTimestamp, hasSeenComingSoon,
        lastOnlineTimestamp: Date.now(),
      };
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      if (player) {
        player.setData(saveData, true).catch(() => {});
      }

      if (ysdk && ysdk.getLeaderboards) {
        ysdk.getLeaderboards()
          .then((lb: any) => {
            // 'top_builders' — это техническое имя лидерборда. 
            // Тебе нужно будет точно так же назвать его в консоли разработчика Яндекс Игр!
            lb.setLeaderboardScore('top_builders', totalEarned);
          })
          .catch(() => {});
      }
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
  }, [isLoaded, coins, totalEarned, stage, currentEpoch, clickPower, passiveIncome, critChance, username, soundEnabled, musicEnabled, vibrationEnabled, diamonds, lastDiamondChestTimestamp, lastShopAdTimestamp, diamondUpgrades, goldRushEndTime, autoForemanEndTime, clickLevel, passiveLevel, player, ysdk, hasSeenComingSoon]);

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
    showRewardedVideo(() => {
      audioManager.play("reward");
      vibrationManager.play("success");
      setDiamonds((prev) => prev + 15);
      setLastDiamondChestTimestamp(Date.now());
      setIsDiamondChestVisible(false);
      setIsDiamondChestModalOpen(false);
    });
  };

   // --- ЛОГИКА РУЧНОЙ ЭВОЛЮЦИИ ---
  const isMaxEpoch = !EPOCHS[currentEpoch + 1];
  const isMaxStage = stage === thresholds.length - 1;
  const isGameCompleted = isMaxEpoch && isMaxStage && totalEarned >= nextThreshold;

  const handleEvolution = () => {
    if (isTransitioning) return;

    audioManager.play("ui"); // Звук нажатия

    if (stage < thresholds.length - 1) {
      // Эволюция объекта внутри эпохи
      triggerObjectEvolution(stage + 1);
    } else if (!isMaxEpoch) {
      // Переход в новую эпоху
      triggerEpochTransition(currentEpoch + 1);
    } else {
      // Контента больше нет - показываем тизер!
      setIsComingSoonOpen(true);
      setHasSeenComingSoon(true);
    }
  };

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

  // --- ГЛОБАЛЬНАЯ ФУНКЦИЯ ПОКАЗА РЕКЛАМЫ ---
  const showRewardedVideo = (onReward: () => void) => {
    // Проверяем, запускаем ли мы игру на локальном компьютере
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (ysdk && ysdk.adv && !isLocalhost) {
      try {
        ysdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              setIsAdPlaying(true); // Глушим звуки
            },
            onRewarded: () => {
              onReward(); // Выдаем награду
            },
            onClose: () => {
              setIsAdPlaying(false); // Включаем звуки
            },
            onError: (e: any) => {
              console.error("Ошибка показа рекламы от Яндекса:", e);
              setIsAdPlaying(false);
            }
          }
        });
      } catch (error) {
        console.error("Критическая ошибка вызова SDK:", error);
        setIsAdPlaying(false);
      }
    } else {
      // Режим разработчика (localhost или если SDK не загрузился)
      console.log("Режим локального теста: Реклама пропущена, награда выдана!");
      onReward();
    }
  };

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
      setGoldRushEndTime(Date.now() + 2 * 60 * 1000);
    }
  };

  const buyAutoForeman = () => {
    if (diamonds >= AUTO_FOREMAN_COST && !isAutoForemanActive) {
      setDiamonds((prev) => prev - AUTO_FOREMAN_COST);
      setAutoForemanEndTime(Date.now() + 2 * 60 * 1000);
    }
  };

  const handleShopDiamondAd = () => {
    showRewardedVideo(() => {
      audioManager.play("reward");
      setDiamonds((prev) => prev + 5);
      setLastShopAdTimestamp(Date.now());
    });
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
    showRewardedVideo(() => {
      audioManager.play("reward");
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
    });
  };

  const handleMainClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTransitioning) return;

    const isCrit = Math.random() * 100 < critChance;
    if (isCrit) {
      vibrationManager.play("crit");
    } else {
      vibrationManager.play("click");
    }
    const baseEarned = isCrit ? clickPower * 5 : clickPower;
    const earned = baseEarned * activeMultiplier;
    audioManager.play("click");

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
    showRewardedVideo(() => {
      audioManager.play("reward");
      vibrationManager.play("success");
      const reward = calculateAdReward();
      setCoins((prev) => prev + reward);
      setTotalEarned((prev) => prev + reward);
      setIsModalOpen(false);
      setIsChestVisible(false);
      setTimeout(() => setIsChestVisible(true), 45000);
    });
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
    showRewardedVideo(() => {
      audioManager.play("reward");
      vibrationManager.play("success");
      setCoins((prev) => prev + bubbleReward);
      setTotalEarned((prev) => prev + bubbleReward);
      setIsBubbleModalOpen(false);
    });
  };

  // Забрать обычную награду (базовые монеты уже начислены при загрузке)
  const handleClaimNormalOffline = () => {
    setIsOfflineModalOpen(false);
  };

  // Удвоить награду (через рекламу)
  const handleDoubleOfflineReward = () => {
    showRewardedVideo(() => {
      audioManager.play("reward");
      setCoins((prev) => prev + offlineEarned);
      setTotalEarned((prev) => prev + offlineEarned);
      setIsOfflineModalOpen(false);
    });
  };

  const getCurrentObject = () => {
    return EPOCHS[currentEpoch]?.objects[stage] || { src: "/stump.PNG", scale: 0.5 };
  };
  
  const currentObj = getCurrentObject();

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

        { /* ЗАГРУЗОЧНЫЙ ЭКРАН (SPLASH SCREEN) */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-black cursor-pointer"
            onClick={handleStartGame}
          >
            {/* Фоновая картинка */}
            <Image 
              src="/start-screen1.PNG" 
              alt="Загрузка..." 
              fill 
              className="object-cover" 
              priority 
            />
            
            {/* Контейнер ползунка */}
            <div className="absolute bottom-[20%] w-3/4 max-w-sm flex flex-col items-center">
              {/* Внешняя рамка бара */}
              <div className="w-full h-12 bg-black/60 backdrop-blur-sm rounded-xl border-2 border-yellow-700/80 p-1 shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Сам заполняющийся ползунок */}
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 rounded-xl transition-all duration-100 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              
              {/* Текст под баром */}
              <div className="mt-5 h-8 flex items-center justify-center">
                {isReadyToStart ? (
                  <span className="text-yellow-300 text-center font-black text-lg uppercase tracking-widest animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    Нажмите, чтобы продолжить
                  </span>
                ) : (
                  <span className="text-white/90 font-bold text-sm tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    Загрузка... {loadingProgress}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        
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
          handleEvolution={handleEvolution} isGameCompleted={isGameCompleted}
          openSettings={() => setIsSettingsOpen(true)}
        />

        <GameField 
          isBubbleVisible={isBubbleVisible} setIsBubbleVisible={setIsBubbleVisible} 
          handleBubbleClick={handleBubbleClick} isLocalCloudActive={isLocalCloudActive}
          centerObjectSrc={currentObj.src} objectScale={currentObj.scale} handleMainClick={handleMainClick} bubbleType={bubbleType}
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
              initial={{ opacity: 0 }}
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
        
        {/* ЭКРАН "ПРОДОЛЖЕНИЕ СЛЕДУЕТ" */}
        <AnimatePresence>
          {isComingSoonOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-[150] flex flex-col items-center justify-end pb-12 px-6 bg-black"
            >
              <Image 
                src="/coming-soon.png"
                alt="Coming Soon" 
                fill 
                className="object-cover" 
                priority 
              />
              
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="relative z-10 w-full max-w-xs"
              >
                <button 
                  onClick={() => {
                    audioManager.play("ui");
                    setIsComingSoonOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black text-lg py-4 rounded-2xl shadow-[0_6px_0_#9a3412] active:translate-y-[6px] transition-all uppercase tracking-wider"
                >
                  Вернуться к стройке
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}