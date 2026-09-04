import { Howl } from 'howler';

class AudioSystem {
  private bgm: Howl | null = null;
  private sounds: Record<string, Howl> = {};
  
  public isMusicEnabled = true;
  public isSoundEnabled = true;

  // Инициализация загрузит звуки в память браузера
  public init() {
    // Если уже инициализировано - пропускаем
    if (this.bgm) return;

    // Фоновая музыка (зацикленная, тихая)
    this.bgm = new Howl({ 
      src: ['./sounds/bgm.mp3'], // <-- ДОБАВЛЕНА ТОЧКА
      loop: true, 
      volume: 0.2 
    });

    // Звуковые эффекты
    this.sounds = {
      click: new Howl({ src: ['./sounds/click.mp3'], volume: 0.4 }), // <-- ДОБАВЛЕНА ТОЧКА
      ui: new Howl({ src: ['./sounds/ui.mp3'], volume: 0.4 }),
      build: new Howl({ src: ['./sounds/build.mp3'], volume: 0.7 }),
      whoosh: new Howl({ src: ['./sounds/whoosh.mp3'], volume: 0.6 }),
      pop: new Howl({ src: ['./sounds/pop.mp3'], volume: 0.6 }),
      reward: new Howl({ src: ['./sounds/reward.mp3'], volume: 0.7 }),
    };
  }

  // --- УПРАВЛЕНИЕ МУЗЫКОЙ ---
  public playBgm() {
    if (this.isMusicEnabled && this.bgm && !this.bgm.playing()) {
      this.bgm.play();
    }
  }

  public stopBgm() {
    if (this.bgm && this.bgm.playing()) {
      this.bgm.stop();
    }
  }

  // --- УПРАВЛЕНИЕ ЗВУКАМИ ---
  public play(soundName: "click" | "ui" | "build" | "whoosh" | "pop" | "reward") {
    if (this.isSoundEnabled && this.sounds[soundName]) {
      // Если это главный клик, немного меняем его тональность (от 0.8 до 1.2)
      if (soundName === "click") {
        this.sounds[soundName].rate(0.8 + Math.random() * 0.4);
      }
      this.sounds[soundName].play();
    }
  }

  // --- СИНХРОНИЗАЦИЯ С НАСТРОЙКАМИ ИГРЫ ---
  public updateSettings(music: boolean, sound: boolean) {
    this.isMusicEnabled = music;
    this.isSoundEnabled = sound;

    if (music) {
      this.playBgm();
    } else {
      this.stopBgm();
    }
  }
}

// Экспортируем готовый объект, чтобы использовать его из любого файла!
export const audioManager = new AudioSystem();