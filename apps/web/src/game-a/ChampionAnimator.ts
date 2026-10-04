import type { AnimationGroup } from "@babylonjs/core";

export class ChampionAnimator {
  private readonly groups = new Map<string, AnimationGroup>();
  private currentLoop: string | null = null;
  private oneShotActive = false;

  constructor(groups: AnimationGroup[]) {
    for (const group of groups) {
      this.groups.set(normalize(group.name), group);
    }
  }

  has(name: string) {
    return Boolean(this.find(name));
  }

  playLoop(name: string, speedRatio = 1) {
    if (this.oneShotActive) return;
    const group = this.find(name);
    if (!group) return;
    const key = normalize(name);
    if (this.currentLoop === key && group.isPlaying) {
      group.speedRatio = speedRatio;
      return;
    }

    this.stopAll();
    this.currentLoop = key;
    group.speedRatio = speedRatio;
    group.start(true);
  }

  playOnce(name: string, fallback: string = "Idle", onEnd?: () => void) {
    const group = this.find(name);
    if (!group) {
      onEnd?.();
      this.oneShotActive = false;
      this.currentLoop = null;
      this.playLoop(fallback);
      return;
    }

    this.stopAll();
    this.oneShotActive = true;
    this.currentLoop = null;
    const token = group.onAnimationGroupEndObservable.addOnce(() => {
      group.onAnimationGroupEndObservable.remove(token);
      this.oneShotActive = false;
      onEnd?.();
      this.playLoop(fallback);
    });
    group.start(false);
  }

  clearOneShot() {
    this.oneShotActive = false;
  }

  isBusy() {
    return this.oneShotActive;
  }

  stopAll() {
    for (const group of this.groups.values()) {
      if (group.isPlaying) group.stop();
    }
  }

  dispose() {
    this.stopAll();
    this.groups.clear();
  }

  private find(name: string) {
    const wanted = normalize(name);
    const exact = this.groups.get(wanted);
    if (exact) return exact;

    for (const [key, group] of this.groups) {
      if (key.endsWith(wanted) || key.includes(wanted)) return group;
    }
    return undefined;
  }
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
