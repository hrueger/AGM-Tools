import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import {
  categories,
  Emoji,
  EmojiCategory,
  EmojiEvent,
  EmojiService,
} from './public_api';
import { EmojiFrequentlyService } from './emoji-frequently.service';



const I18N: any = {
  search: 'Search',
  emojilist: 'List of emoji',
  notfound: 'No Emoji Found',
  clear: 'Clear',
  categories: {
    search: 'Search Results',
    recent: 'Frequently Used',
    people: 'Smileys & People',
    nature: 'Animals & Nature',
    foods: 'Food & Drink',
    activity: 'Activity',
    places: 'Travel & Places',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags',
    custom: 'Custom',
  },
  skintones: {
    1: 'Default Skin Tone',
    2: 'Light Skin Tone',
    3: 'Medium-Light Skin Tone',
    4: 'Medium Skin Tone',
    5: 'Medium-Dark Skin Tone',
    6: 'Dark Skin Tone',
  },
};

@Component({
  selector: 'emoji-picker',
  templateUrl: './picker.component.html',
  styleUrls: ["./picker.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class PickerComponent implements OnInit {
  @Input() perLine = 10;
  @Input() showEmojiPicker: boolean = false;
  @Input() i18n: any = {};

  @Input() color = '#2b669a';
  @Input() hideObsolete = true;
  /** all categories shown */
  @Input() categories: EmojiCategory[] = [];
  /** used to temporarily draw categories */
  @Input() activeCategories: EmojiCategory[] = [];
  @Input() skin: Emoji['skin'] = 1;
  @Output() emojiClick = new EventEmitter<any>();
  @Output() backspaceClick = new EventEmitter<any>();
  @Output() skinChange = new EventEmitter<Emoji['skin']>();

  recent?: string[];

  NAMESPACE = 'emoji-picker';

  RECENT_CATEGORY: EmojiCategory = {
    id: 'recent',
    name: 'Recent',
    emojis: null,
  };
  showSearch: boolean = false;
  constructor(
    private lastUsedEmojisService: EmojiFrequentlyService,
    private emojiService: EmojiService,
  ) { }



  ngOnInit() {

    this.i18n = { ...I18N, ...this.i18n };
    this.i18n.categories = { ...I18N.categories, ...this.i18n.categories };
    this.skin =
      JSON.parse(localStorage.getItem(`${this.NAMESPACE}.skin`) || 'null') ||
      this.skin;

    var recentEmojis: string[] = this.lastUsedEmojisService.get(40);
    this.categories.push({ id: "recent", name: "Recent Emojis", emojis: recentEmojis });
    this.categories.push(...categories);

  }





  handleSearch($emojis: any[] | null) {

    /*for (const component of this.categoryRefs.toArray()) {
      if (component.name === 'Search') {
        component.emojis = $emojis;
        component.updateDisplay($emojis ? 'block' : 'none');
      } else {
        component.updateDisplay($emojis ? 'none' : 'block');
      }
    }

    this.scrollRef.nativeElement.scrollTop = 0;
    this.handleScroll();*/
  }



  handleEmojiClick($event: EmojiEvent) {
    this.emojiClick.emit($event);

  }
  handleSkinChange(skin: Emoji['skin']) {
    this.skin = skin;
    localStorage.setItem(`${this.NAMESPACE}.skin`, String(skin));
    this.skinChange.emit(skin);
  }

  getImgSrc(emoji) {
    if (emoji) {
      return `~/assets/emojis_apple/${emoji.toLowerCase()}.png`;
    }

  }

  onEmojiClick(emoji) {
    this.lastUsedEmojisService.add(emoji);
    this.emojiClick.emit(emoji);
  }

  backspace() {
    this.backspaceClick.emit();
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }


}
