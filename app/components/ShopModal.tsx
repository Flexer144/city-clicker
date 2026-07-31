import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Zap, TrendingUp, X, Pickaxe, HardHat, Video, Lock, Flame } from "lucide-react";

interface ShopModalProps {
  isShopOpen: boolean;
  setIsShopOpen: (val: boolean) => void;
  shopTab: "click" | "passive";
  setShopTab: (tab: "click" | "passive") => void;
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
  // Крит
  critChance: number;
  critUpgradeCost: number;
  buyCritUpgrade: () => void;
  isCritUnlocked: boolean;
}

export default function ShopModal({
  isShopOpen, setIsShopOpen, shopTab, setShopTab, coins, clickPower, passiveIncome,
  clickUpgradeCost, passiveUpgradeCost, isClickAdCooldown, isPassiveAdCooldown,
  buyClickUpgrade, buyPassiveUpgrade, handleUpgradeViaAd,
  critChance, critUpgradeCost, buyCritUpgrade, isCritUnlocked
}: ShopModalProps) {
  return (
    <AnimatePresence>
      {isShopOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsShopOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-black border-t-2 border-yellow-600/50 rounded-t-3xl pt-2 pb-8 px-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Управление стройкой</h2>
              <button onClick={() => setIsShopOpen(false)} className="bg-white/10 p-2 rounded-full active:scale-90">
                <X className="text-white" size={24} />
              </button>
            </div>

            <div className="flex gap-2 mb-6 bg-black/50 p-1 rounded-xl">
              <button
                onClick={() => setShopTab("click")}
                className={`flex-1 py-3 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${shopTab === "click" ? "bg-yellow-500 text-black shadow-md" : "text-gray-400"}`}
              >
                <Zap size={18} /> Клик
              </button>
              <button
                onClick={() => setShopTab("passive")}
                className={`flex-1 py-3 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${shopTab === "passive" ? "bg-orange-500 text-black shadow-md" : "text-gray-400"}`}
              >
                <TrendingUp size={18} /> Пассив
              </button>
            </div>

            {/* ВКЛАДКА КЛИКА */}
            {shopTab === "click" && (
              <div className="flex flex-col gap-4">
                {/* Основное улучшение клика */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-white/20 bg-yellow-500/20 text-yellow-400">
                      <Pickaxe size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Острый топор</h3>
                      <p className="text-gray-400 text-xs mt-1">Текущая сила: {clickPower}</p>
                      <p className="text-green-400 text-xs font-bold mt-1">+1 к силе клика</p>
                    </div>
                  </div>

                  {coins >= clickUpgradeCost || isClickAdCooldown ? (
                    <button
                      onClick={buyClickUpgrade}
                      disabled={coins < clickUpgradeCost}
                      className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-lg"
                    >
                      <span className="text-xs font-bold uppercase mb-1 text-white/80">Купить</span>
                      <div className="flex items-center gap-1">
                        <Image src="/money1.png" alt="coin" width={14} height={14} />
                        <span className="font-black text-white">{clickUpgradeCost}</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgradeViaAd}
                      className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 active:scale-95 transition-all px-3 py-3 rounded-xl min-w-[90px] shadow-[0_0_15px_rgba(219,39,119,0.4)] border border-pink-400/50"
                    >
                      <span className="text-[10px] font-bold uppercase mb-1 text-white flex items-center gap-1">
                        <Video size={12} /> Реклама
                      </span>
                      <span className="font-black text-yellow-300 text-xs drop-shadow-md">+1 к клику</span>
                    </button>
                  )}
                </div>

                {/* ДОПОЛНИТЕЛЬНО: КРИТИЧЕСКИЙ КЛИК (С БАВЕРОМ БЛОКИРОВКИ) */}
                <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  
                  {/* Если НЕ разблокировано — накладываем заблюренный баннер */}
                  {!isCritUnlocked && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center text-center p-3 border border-yellow-500/30 rounded-2xl">
                      <Lock className="text-yellow-400 mb-1 animate-bounce" size={24} />
                      <p className="text-xs font-bold text-yellow-300 uppercase tracking-wide">
                        Удачный удар
                      </p>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        Откроется после постройки палатки!
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-red-500/30 bg-red-500/20 text-red-400">
                      <Flame size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Удачный удар</h3>
                      <p className="text-gray-400 text-xs mt-1">Шанс крита: {critChance}% (x5 монет)</p>
                      <p className="text-red-400 text-xs font-bold mt-1">+5% к шансу крита</p>
                    </div>
                  </div>

                  <button
                    onClick={buyCritUpgrade}
                    disabled={!isCritUnlocked || coins < critUpgradeCost || critChance >= 50}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-red-600 to-orange-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-lg"
                  >
                    <span className="text-xs font-bold uppercase mb-1 text-white/80">
                      {critChance >= 50 ? "МАКС" : "Купить"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Image src="/money1.png" alt="coin" width={14} height={14} />
                      <span className="font-black text-white">
                        {critChance >= 50 ? "MAX" : critUpgradeCost}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ВКЛАДКА ПАССИВНОГО ДОХОДА */}
            {shopTab === "passive" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-white/20 bg-orange-500/20 text-orange-400">
                    <HardHat size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Нанять рабочих</h3>
                    <p className="text-gray-400 text-xs mt-1">Доход: {passiveIncome}/сек</p>
                    <p className="text-green-400 text-xs font-bold mt-1">+2 монеты в секунду</p>
                  </div>
                </div>

                {coins >= passiveUpgradeCost || isPassiveAdCooldown ? (
                  <button
                    onClick={buyPassiveUpgrade}
                    disabled={coins < passiveUpgradeCost}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 active:scale-95 transition-all px-4 py-3 rounded-xl min-w-[90px] shadow-lg"
                  >
                    <span className="text-xs font-bold uppercase mb-1 text-white/80">Купить</span>
                    <div className="flex items-center gap-1">
                      <Image src="/money1.png" alt="coin" width={14} height={14} />
                      <span className="font-black text-white">{passiveUpgradeCost}</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={handleUpgradeViaAd}
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 active:scale-95 transition-all px-3 py-3 rounded-xl min-w-[90px] shadow-[0_0_15px_rgba(219,39,119,0.4)] border border-pink-400/50"
                  >
                    <span className="text-[10px] font-bold uppercase mb-1 text-white flex items-center gap-1">
                      <Video size={12} /> Реклама
                    </span>
                    <span className="font-black text-yellow-300 text-xs drop-shadow-md">+2/сек</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}