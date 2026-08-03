class VibrationSystem {
  public isEnabled = true;

  // Синхронизация с тумблером в настройках
  public updateSettings(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Главная функция вызова
  public play(type: "click" | "crit" | "ui" | "success") {
    
    if (!this.isEnabled || typeof window === "undefined" || !navigator.vibrate) {
      return;
    }

    switch (type) {
      case "click":
        navigator.vibrate(10); 
        break;
      case "crit":
        navigator.vibrate([15, 30, 20]); 
        break;
      case "ui":
        navigator.vibrate(15); 
        break;
      case "success":
        navigator.vibrate([20, 40, 20, 40, 30]);
        break;
    }
  }
}

export const vibrationManager = new VibrationSystem();