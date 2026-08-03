import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Zap, TrendingUp, X, Pickaxe, HardHat, Video, Lock, Flame, Gem, Clock, Sparkles, Bot } from "lucide-react";
import { formatNumber } from "../utils";
import { audioManager } from "../audio";
import { vibrationManager } from "../vibration";

interface ShopModalProps {
  isShopOpen: boolean;
  setIsShopOpen: (val: boolean) => void;
  shopTab: "click" | "passive" | "premium";
  setShopTab: (tab: "click" | "passive" | "premium") => void;
  coins: number;
  clickPower: number;
  passiveIncome: number;
  clickUpgradeCost: number;
  passiveUpgradeCost: number;
  isClickAdCooldown: boolean;
  isPassiveAdCooldown: boolean;
  buyClickUpgrade: () => void;
  buyPassiveUpgrade: () => void;
  handleUpgradeViaAd: () => void;
  critChance: number;
  critUpgradeCost: number;
  buyCritUpgrade: () => void;
  isCritUnlocked: boolean;
  clickPowerToAdd: number;
  passiveIncomeToAdd: number;
  
  // --- АЛМАЗЫ И БУСТЫ ---
  currentEpoch: number;
  diamonds: number;
  diamondUpgrades: number;
  diamondUpgradeCost: number;
  buyDiamondUpgrade: () => void;
  lastShopAdTimestamp: number;
  handleShopDiamondAd: () => void;
  goldRushEndTime: number;
  autoForemanEndTime: number;
  currentTime: number;
  buyGoldRush: () => void;
  buyAutoForeman: () => void;
}

// Вспомогательная функция для красивого вывода времени (04:59)
const formatTimeLeft = (endTime: number, currentTime: number) => {
  const timeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000));
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function ShopModal({
  isShopOpen, setIsShopOpen, shopTab, setShopTab, coins, clickPower, passiveIncome,
  clickUpgradeCost, passiveUpgradeCost, isClickAdCooldown, isPassiveAdCooldown,
  buyClickUpgrade, buyPassiveUpgrade, handleUpgradeViaAd,
  critChance, critUpgradeCost, buyCritUpgrade, isCritUnlocked,
  currentEpoch, diamonds, diamondUpgrades, diamondUpgradeCost, buyDiamondUpgrade,
  lastShopAdTimestamp, handleShopDiamondAd, 
  goldRushEndTime, autoForemanEndTime, currentTime, buyGoldRush, buyAutoForeman, clickPowerToAdd, passiveIncomeToAdd
}: ShopModalProps) {
  
  const isDiamondAdAvailable = currentTime - lastShopAdTimestamp > 7200000;
  
  const isGoldRushActive = goldRushEndTime > currentTime;
  const isAutoForemanActive = autoForemanEndTime > currentTime;

  return (
    <AnimatePresence>
      {isShopOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); setIsShopOpen(false); }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-black border-t-2 border-yellow-600/50 rounded-t-3xl pt-2 pb-8 px-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Управление стройкой</h2>
              <button onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); setIsShopOpen(false); }} className="bg-white/10 p-2 rounded-full active:scale-90">
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* НАВИГАЦИЯ */}
            <div className="flex gap-2 mb-6 bg-black/50 p-1 rounded-xl shrink-0">
              <button
                onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); setShopTab("click"); }}
                className={`flex-1 py-3 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 ${shopTab === "click" ? "bg-yellow-500 text-black shadow-md" : "text-gray-400"}`}
              >
                <Zap size={16} /> Клик
              </button>
              <button
                onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); setShopTab("passive"); }}
                className={`flex-1 py-3 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 ${shopTab === "passive" ? "bg-orange-500 text-black shadow-md" : "text-gray-400"}`}
              >
                <TrendingUp size={16} /> Пассив
              </button>
              <button
                onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); setShopTab("premium"); }}
                className={`flex-1 py-3 font-black text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 ${shopTab === "premium" ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "text-cyan-600/70"}`}
              >
                <Gem size={16} /> Премиум
              </button>
            </div>

            {/* --- ВКЛАДКА КЛИК --- */}
            {shopTab === "click" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-white/20 bg-yellow-500/20 text-yellow-400 shrink-0">
                      <Pickaxe size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Острый топор</h3>
                      <p className="text-gray-400 text-xs mt-1">Сила: {formatNumber(clickPower)}</p>
                      <p className="text-green-400 text-xs font-bold mt-1">+{formatNumber(clickPowerToAdd)} к силе клика</p>
                    </div>
                  </div>
                  {coins >= clickUpgradeCost || isClickAdCooldown ? (
                    <button
                      onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); buyClickUpgrade(); }}
                      disabled={coins < clickUpgradeCost}
                      className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-lg shrink-0"
                    >
                      <span className="text-xs font-bold uppercase mb-1 text-white/80">Купить</span>
                      <div className="flex items-center gap-1">
                        <Image src="/money1.png" alt="coin" width={14} height={14} />
                        <span className="font-black text-white">{formatNumber(clickUpgradeCost)}</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); handleUpgradeViaAd(); }}
                      className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 active:scale-95 transition-all px-3 py-3 rounded-xl min-w-[90px] shadow-[0_0_15px_rgba(219,39,119,0.4)] border border-pink-400/50 shrink-0"
                    >
                      <span className="text-[10px] font-bold uppercase mb-1 text-white flex items-center gap-1"><Video size={12} /> Реклама</span>
                      <span className="font-black text-yellow-300 text-xs drop-shadow-md">+{formatNumber(clickPowerToAdd)} к клику</span>
                    </button>
                  )}
                </div>

                <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shrink-0">
                  {!isCritUnlocked && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center text-center p-3 border border-yellow-500/30 rounded-2xl">
                      <Lock className="text-yellow-400 mb-1 animate-bounce" size={24} />
                      <p className="text-xs font-bold text-yellow-300 uppercase tracking-wide">Удачный удар</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">Откроется после постройки палатки!</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-red-500/30 bg-red-500/20 text-red-400 shrink-0">
                      <Flame size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Удачный удар</h3>
                      <p className="text-gray-400 text-xs mt-1">Шанс крита: {critChance}% (x5)</p>
                      <p className="text-red-400 text-xs font-bold mt-1">+5% к шансу крита</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); buyCritUpgrade(); }}
                    disabled={!isCritUnlocked || coins < critUpgradeCost || critChance >= 50}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-red-600 to-orange-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-lg shrink-0"
                  >
                    <span className="text-xs font-bold uppercase mb-1 text-white/80">{critChance >= 50 ? "МАКС" : "Купить"}</span>
                    <div className="flex items-center gap-1">
                      <Image src="/money1.png" alt="coin" width={14} height={14} />
                      <span className="font-black text-white">{critChance >= 50 ? "MAX" : formatNumber(critUpgradeCost)}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* --- ВКЛАДКА ПАССИВ --- */}
            {shopTab === "passive" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-white/20 bg-orange-500/20 text-orange-400 shrink-0">
                    <HardHat size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Нанять рабочих</h3>
                    <p className="text-gray-400 text-xs mt-1">Доход: {formatNumber(passiveIncome)}/сек</p>
                    <p className="text-green-400 text-xs font-bold mt-1">+{formatNumber(passiveIncomeToAdd)} / сек</p>
                  </div>
                </div>
                {coins >= passiveUpgradeCost || isPassiveAdCooldown ? (
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); buyPassiveUpgrade(); }}
                    disabled={coins < passiveUpgradeCost}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-lg shrink-0"
                  >
                    <span className="text-xs font-bold uppercase mb-1 text-white/80">Купить</span>
                    <div className="flex items-center gap-1">
                      <Image src="/money1.png" alt="coin" width={14} height={14} />
                      <span className="font-black text-white">{formatNumber(passiveUpgradeCost)}</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); handleUpgradeViaAd(); }}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 active:scale-95 transition-all px-3 py-3 rounded-xl min-w-[90px] shadow-[0_0_15px_rgba(219,39,119,0.4)] border border-pink-400/50 shrink-0"
                  >
                    <span className="text-[10px] font-bold uppercase mb-1 text-white flex items-center gap-1"><Video size={12} /> Реклама</span>
                    <span className="font-black text-yellow-300 text-xs drop-shadow-md">+{formatNumber(passiveIncomeToAdd)}/сек</span>
                  </button>
                )}
              </div>
            )}

            {/* --- ВКЛАДКА ПРЕМИУМ (АЛМАЗЫ) --- */}
            {shopTab === "premium" && (
              <div className="relative flex flex-col gap-4 min-h-[200px] shrink-0">
                
                {currentEpoch < 2 && (
                  <div className="absolute -inset-2 z-20 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center text-center p-6 border-2 border-cyan-500/30 rounded-2xl shadow-[inset_0_0_30px_rgba(34,211,238,0.1)]">
                    <Lock className="text-cyan-400 mb-2 animate-bounce" size={32} />
                    <p className="text-base font-black text-cyan-300 uppercase tracking-widest drop-shadow-md">Премиум технологии</p>
                    <p className="text-xs text-cyan-100/70 mt-2 max-w-[250px] leading-relaxed">
                      Эта вкладка откроется, когда ваша цивилизация перейдет во <span className="text-yellow-400 font-bold">Вторую Эпоху</span>.
                    </p>
                  </div>
                )}

                {/* Бесплатные алмазы за рекламу */}
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(34,211,238,0.1)] shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shrink-0">
                      <Video size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-cyan-300 text-lg tracking-wide">Поддержка</h3>
                      <p className="text-cyan-100/70 text-xs mt-0.5">Посмотрите рекламу</p>
                      <p className="text-cyan-400 text-xs font-bold mt-1">+5 алмазов бесплатно</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); handleShopDiamondAd(); }}
                    disabled={!isDiamondAdAvailable}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-[0_4px_15px_rgba(34,211,238,0.4)] disabled:shadow-none border border-cyan-400/50 disabled:border-gray-700 shrink-0"
                  >
                    {isDiamondAdAvailable ? (
                      <>
                        <span className="text-xs font-bold uppercase mb-1 text-white">Смотреть</span>
                        <div className="flex items-center gap-1">
                          <span className="font-black text-white">+5</span>
                          <Image src="/diamond1.png" alt="gem" width={19} height={17} className="drop-shadow-md" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock size={18} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase">Ждите</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Золотая Лихорадка (Буст x3) */}
                <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg shrink-0 transition-all ${isGoldRushActive ? "bg-gradient-to-r from-yellow-900/60 to-amber-900/60 border-yellow-500/80" : "bg-black/50 border-yellow-500/30"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border shrink-0 ${isGoldRushActive ? "border-yellow-400 bg-yellow-500 text-black animate-pulse" : "border-yellow-500/50 bg-yellow-500/20 text-yellow-400"}`}>
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h3 className={`font-black text-lg tracking-wide ${isGoldRushActive ? "text-yellow-400" : "text-yellow-500"}`}>
                        Золотая Лихорадка
                      </h3>
                      <p className="text-yellow-100/70 text-xs mt-0.5">Доход х3 на 2 минуты</p>
                      {isGoldRushActive && (
                        <p className="text-yellow-300 text-xs font-bold mt-1 tracking-widest uppercase">
                          Активно: {formatTimeLeft(goldRushEndTime, currentTime)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); buyGoldRush(); }}
                    disabled={diamonds < 20 || isGoldRushActive}
                    className={`flex flex-col items-center justify-center active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] border shrink-0 ${isGoldRushActive ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gradient-to-r from-yellow-500 to-amber-600 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 border-yellow-400/50 disabled:border-gray-700"}`}
                  >
                    <span className="text-xs font-bold uppercase text-white/90">
                      {isGoldRushActive ? "РАБОТАЕТ" : "Купить"}
                    </span>
                    {!isGoldRushActive && (
                      <div className="flex items-center gap-1">
                        <span className="font-black text-white">20</span>
                        <Image src="/diamond1.png" alt="gem" width={19} height={17} />
                      </div>
                    )}
                  </button>
                </div>

                {/* Авто-Прораб (Автокликер) */}
                <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg shrink-0 transition-all ${isAutoForemanActive ? "bg-gradient-to-r from-emerald-900/60 to-green-900/60 border-emerald-500/80" : "bg-black/50 border-emerald-500/30"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border shrink-0 ${isAutoForemanActive ? "border-emerald-400 bg-emerald-500 text-black animate-pulse" : "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"}`}>
                      <Bot size={28} />
                    </div>
                    <div>
                      <h3 className={`font-black text-lg tracking-wide ${isAutoForemanActive ? "text-emerald-400" : "text-emerald-500"}`}>
                        Авто-Прораб
                      </h3>
                      <p className="text-emerald-100/70 text-xs mt-0.5">10 кликов/сек на 2 минуты</p>
                      {isAutoForemanActive && (
                        <p className="text-emerald-300 text-xs font-bold mt-1 tracking-widest uppercase">
                          Активно: {formatTimeLeft(autoForemanEndTime, currentTime)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); buyAutoForeman(); }}
                    disabled={diamonds < 15 || isAutoForemanActive}
                    className={`flex flex-col items-center justify-center active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] border shrink-0 ${isAutoForemanActive ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gradient-to-r from-emerald-500 to-green-600 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 border-emerald-400/50 disabled:border-gray-700"}`}
                  >
                    <span className="text-xs font-bold uppercase text-white/90">
                      {isAutoForemanActive ? "РАБОТАЕТ" : "Купить"}
                    </span>
                    {!isAutoForemanActive && (
                      <div className="flex items-center gap-1">
                        <span className="font-black text-white">15</span>
                        <Image src="/diamond1.png" alt="gem" width={19} height={17} />
                      </div>
                    )}
                  </button>
                </div>

                {/* Глобальный множитель */}
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.1)] shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-purple-400/50 bg-purple-500/20 text-purple-300 shrink-0">
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-purple-300 text-lg tracking-wide">Вечный буст</h3>
                      <p className="text-purple-100/70 text-xs mt-0.5">Куплено: {diamondUpgrades} раз</p>
                      <p className="text-purple-400 text-xs font-bold mt-1">+10% ко ВСЕМУ доходу</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { audioManager.play("ui"); vibrationManager.play("ui"); buyDiamondUpgrade(); }}
                    disabled={diamonds < diamondUpgradeCost}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-fuchsia-600 to-purple-600 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-[0_4px_15px_rgba(192,38,211,0.4)] disabled:shadow-none border border-fuchsia-400/50 disabled:border-gray-700 shrink-0"
                  >
                    <span className="text-xs font-bold uppercase mb-1 text-white/90">Купить</span>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-white">{formatNumber(diamondUpgradeCost)}</span>
                      <Image src="/diamond1.png" alt="gem" width={19} height={17} />
                    </div>
                  </button>
                </div>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}