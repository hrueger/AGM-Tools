import { Injectable } from '@angular/core';

import {
  categories,
  EmojiData,
  EmojiService,
} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { intersect } from './utils';

@Injectable({ providedIn: 'root' })
export class EmojiSearch {
  originalPool: any = {};
  index: {
    results?: EmojiData[];
    pool?: { [key: string]: EmojiData };
    [key: string]: any;
  } = {};
  emojisList: any = {};
  emoticonsList: { [key: string]: string } = {};
  emojiSearch: { [key: string]: string } = {};

  constructor(private emojiService: EmojiService) {
    for (const emojiData of this.emojiService.emojis) {
      const { shortNames, emoticons } = emojiData;
      const id = shortNames[0];

      emoticons.forEach(emoticon => {
        if (this.emoticonsList[emoticon]) {
          return;
        }

        this.emoticonsList[emoticon] = id;
      });

      this.emojisList[id] = this.emojiService.getSanitizedData(id);
      this.originalPool[id] = emojiData;
    }
  }

  addCustomToPool(custom: any, pool: any) {
    custom.forEach((emoji: any) => {
      const emojiId = emoji.id || emoji.shortNames[0];

      if (emojiId && !pool[emojiId]) {
        pool[emojiId] = this.emojiService.getData(emoji);
        this.emojisList[emojiId] = this.emojiService.getSanitizedData(emoji);
      }
    });
  }

  search(
    value: string,
    emojisToShowFilter?: (x: any) => boolean,
    maxResults = 75,
    include: any[] = [],
    exclude: any[] = [],
    custom: any[] = [],
  ): EmojiData[] | null {
    this.addCustomToPool(custom, this.originalPool);

    let results: EmojiData[] | undefined;
    let pool = this.originalPool;

    if (value.length) {
      if (value === '-' || value === '-1') {
        return [this.emojisList['-1']];
      }
      if (value === '+' || value === '+1') {
        return [this.emojisList['+1']];
      }

      let values = value.toLowerCase().split(/[\s|,|\-|_]+/);
      let allResults = [];

      if (values.length > 2) {
        values = [values[0], values[1]];
      }

      if (include.length || exclude.length) {
        pool = {};

        categories.forEach(category => {
          const isIncluded =
            include && include.length
              ? include.indexOf(category.id) > -1
              : true;
          const isExcluded =
            exclude && exclude.length
              ? exclude.indexOf(category.id) > -1
              : false;
          if (!isIncluded || isExcluded) {
            return;
          }

          category.emojis.forEach(
            emojiId => (pool[emojiId] = this.emojiService.names[emojiId]),
          );
        });

        if (custom.length) {
          const customIsIncluded =
            include && include.length ? include.indexOf('custom') > -1 : true;
          const customIsExcluded =
            exclude && exclude.length ? exclude.indexOf('custom') > -1 : false;
          if (customIsIncluded && !customIsExcluded) {
            this.addCustomToPool(custom, pool);
          }
        }
      }

      allResults = values
        .map(v => {
          let aPool = pool;
          let aIndex = this.index;
          let length = 0;

          // tslint:disable-next-line: prefer-for-of
          for (let charIndex = 0; charIndex < v.length; charIndex++) {
            const char = v[charIndex];
            length++;
            if (!aIndex[char]) {
              aIndex[char] = {};
            }
            aIndex = aIndex[char];

            if (!aIndex.results) {
              const scores: { [key: string]: number } = {};

              aIndex.results = [];
              aIndex.pool = {};

              for (const id of Object.keys(aPool)) {
                const emoji = aPool[id];
                if (!this.emojiSearch[id]) {
                  this.emojiSearch[id] = this.buildSearch(
                    emoji.short_names,
                    emoji.name,
                    emoji.keywords,
                    emoji.emoticons,
                  );
                }
                const query = this.emojiSearch[id];
                const sub = v.substr(0, length);
                const subIndex = query.indexOf(sub);

                if (subIndex !== -1) {
                  let score = subIndex + 1;
                  if (sub === id) {
                    score = 0;
                  }

                  aIndex.results.push(this.emojisList[id]);
                  aIndex.pool[id] = emoji;

                  scores[id] = score;
                }
              }

              aIndex.results.sort((a, b) => {
                const aScore = scores[a.id];
                const bScore = scores[b.id];

                return aScore - bScore;
              });
            }

            aPool = aIndex.pool;
          }

          return aIndex.results;
        })
        .filter(a => a);

      if (allResults.length > 1) {
        results = intersect.apply(null, allResults as any);
      } else if (allResults.length) {
        results = allResults[0];
      } else {
        results = [];
      }
    }

    if (results) {
      if (emojisToShowFilter) {
        results = results.filter((result: EmojiData) =>
          emojisToShowFilter(this.emojiService.names[result.id]),
        );
      }

      if (results && results.length > maxResults) {
        results = results.slice(0, maxResults);
      }
    }
    return results || null;
  }

  buildSearch(
    shortNames: string[],
    name: string,
    keywords: string[],
    emoticons: string[],
  ) {
    const search: string[] = [];

    const addToSearch = (strings: string | string[], split: boolean) => {
      if (!strings) {
        return;
      }

      (Array.isArray(strings) ? strings : [strings]).forEach(str => {
        (split ? str.split(/[-|_|\s]+/) : [str]).forEach(s => {
          s = s.toLowerCase();

          if (!search.includes(s)) {
            search.push(s);
          }
        });
      });
    };

    addToSearch(shortNames, true);
    addToSearch(name, true);
    addToSearch(keywords, false);
    addToSearch(emoticons, false);

    return search.join(',');
  }
}
