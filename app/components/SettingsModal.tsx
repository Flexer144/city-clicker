import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Edit2, Check, Volume2, VolumeX, Music, Smartphone } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mayorImage: string;
  username: string;
  setUsername: (name: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (val: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (val: boolean) => void;
}

export default function SettingsModal({
  isOpen, onClose, mayorImage, username, setUsername,
  soundEnabled, setSoundEnabled, musicEnabled, setMusicEnabled,
  vibrationEnabled, setVibrationEnabled
}: SettingsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(username);

  const handleSaveName = () => {
    if (tempName.trim().length > 0) {
      setUsername(tempName.trim());
    } else {
      setTempName(username); // Если ввели пустоту, возвращаем старый ник
    }
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#111827] to-black border-t-2 border-yellow-500/50 rounded-t-3xl pt-2 pb-8 px-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">Профиль</h2>
              <button onClick={onClose} className="bg-white/10 p-2 rounded-full active:scale-90 transition-transform">
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* КАРТОЧКА ПРОФИЛЯ */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4 mb-6 shadow-inner relative overflow-hidden">
              
              <div className="w-16 h-16 rounded-full border-2 border-yellow-500/80 overflow-hidden relative shrink-0 shadow-lg bg-gray-800">
                <Image src={mayorImage} alt="Мэр" fill className="object-cover" sizes="64px" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Имя мэра</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={15}
                      className="bg-black/50 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-white font-bold text-sm w-full outline-none focus:border-yellow-400 transition-colors"
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveName}
                      className="bg-green-500 hover:bg-green-400 text-black p-1.5 rounded-lg active:scale-90 transition-all shrink-0"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-yellow-300 truncate">{username}</h3>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-white p-1 active:scale-90 transition-all shrink-0"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* НАСТРОЙКИ */}
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">Настройки игры</h3>
            <div className="flex flex-col gap-3">
              
              {/* Музыка */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${musicEnabled ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-500"}`}>
                    <Music size={20} />
                  </div>
                  <span className="font-bold text-gray-200 text-sm">Музыка</span>
                </div>
                <Toggle isOn={musicEnabled} onToggle={() => setMusicEnabled(!musicEnabled)} />
              </div>

              {/* Звуки */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${soundEnabled ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <span className="font-bold text-gray-200 text-sm">Звуки интерфейса</span>
                </div>
                <Toggle isOn={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
              </div>

              {/* Вибрация */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${vibrationEnabled ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500"}`}>
                    <Smartphone size={20} />
                  </div>
                  <span className="font-bold text-gray-200 text-sm">Вибрация</span>
                </div>
                <Toggle isOn={vibrationEnabled} onToggle={() => setVibrationEnabled(!vibrationEnabled)} />
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Маленький компонент тумблера для красоты (iOS style)
function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isOn ? "bg-yellow-500" : "bg-gray-700"}`}
    >
      <div 
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isOn ? "translate-x-6" : ""}`}
      />
    </div>
  );
}