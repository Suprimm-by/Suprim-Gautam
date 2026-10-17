/**
 * Haptic feedback service for web mobile devices using navigator.vibrate
 */

class HapticsService {
  private enabled: boolean = true;

  constructor() {
    this.enabled = typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  }

  public vibrate(pattern: number | number[]) {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Browser permissions or unsupported platform
    }
  }

  public stop() {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {
        // Safe ignore
      }
    }
  }

  // Pre-configured prank haptic profiles
  public lightTap() {
    this.vibrate(25);
  }

  public success() {
    this.vibrate([30, 60, 40]);
  }

  public hornBlast() {
    this.vibrate([150, 40, 200, 40, 300]);
  }

  public razorContinuous() {
    this.vibrate([80, 20, 80, 20, 80, 20, 100]);
  }

  public taserSparks() {
    this.vibrate([20, 15, 30, 20, 15, 40, 25, 20, 50]);
  }

  public glassCrash() {
    this.vibrate([180, 30, 90, 40, 40, 30, 30]);
  }

  public dogBark() {
    this.vibrate([100, 30, 140]);
  }

  public countdownTick() {
    this.vibrate(15);
  }

  public bombExplode() {
    this.vibrate([200, 50, 400, 50, 600]);
  }
}

export const haptics = new HapticsService();
