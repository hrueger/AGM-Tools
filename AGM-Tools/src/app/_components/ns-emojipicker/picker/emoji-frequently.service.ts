import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmojiFrequentlyService {
  NAMESPACE = 'emoji-mart';
  frequently: { [key: string]: number } | null = null;
  defaults: { [key: string]: number } = {};
  initialized = false;
  DEFAULTS = ["1f44d", "1f60e", "1f605", "1f602", "1f600"];

  init() {
    this.frequently = JSON.parse(localStorage.getItem(`${this.NAMESPACE}.frequently`) || 'null');
    this.initialized = true;
  }
  add(emojiId: string) {
    if (!this.initialized) {
      this.init();
    }
    if (!this.frequently) {
      this.frequently = this.defaults;
    }
    if (!this.frequently[emojiId]) {
      this.frequently[emojiId] = 0;
    }
    this.frequently[emojiId] += 1;

    localStorage.setItem(`${this.NAMESPACE}.last`, emojiId);
    localStorage.setItem(`${this.NAMESPACE}.frequently`, JSON.stringify(this.frequently));
  }
  get(quantity: number) {
    if (!this.initialized) {
      this.init();
    }
    if (this.frequently === null) {
      this.defaults = {};
      const result = [];

      for (let i = 0; i < this.DEFAULTS.length; i++) {
        this.defaults[this.DEFAULTS[i]] = this.DEFAULTS.length - i;
        result.push(this.DEFAULTS[i]);
      }
      return result;
    }


    const frequentlyKeys = Object.keys(this.frequently);

    const sorted = frequentlyKeys
      .sort((a, b) => this.frequently[a] - this.frequently[b])
      .reverse();
    const sliced = sorted.slice(0, quantity);

    const last = localStorage.getItem(`${this.NAMESPACE}.last`);

    if (last && !sliced.includes(last)) {
      sliced.pop();
      sliced.push(last);
    }
    return sliced;
  }
}
