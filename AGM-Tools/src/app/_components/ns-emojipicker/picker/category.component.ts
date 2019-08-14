import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { Emoji, EmojiService } from '../emoji/public_api';
import { EmojiFrequentlyService } from './emoji-frequently.service';

@Component({
  selector: 'emoji-category',
  templateUrl: "./category.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class CategoryComponent implements OnInit {
  @Input() emojis?: any[] | null;
  @Input() hasStickyPosition = true;
  @Input() perLine = 9;
  @Input() totalFrequentLines = 4;
  @Input() recent: string[] = [];
  @Input() name: string;
  @Input() id: string;
  @Input() custom: any[] = [];
  @Input() i18n: any;
  @Input() hideObsolete = true;
  @Input() notFoundEmoji?: string;
  @Input() emojiIsNative?: Emoji['isNative'];
  @Input() emojiSkin?: Emoji['skin'];
  @Input() emojiSize?: Emoji['size'];
  @Input() emojiSet?: Emoji['set'];
  @Input() emojiSheetSize?: Emoji['sheetSize'];
  @Input() emojiForceSize?: Emoji['forceSize'];
  @Input() emojiTooltip?: Emoji['tooltip'];
  @Input() emojiBackgroundImageFn?: Emoji['backgroundImageFn'];
  @Output() emojiOver: Emoji['emojiOver'] = new EventEmitter();
  @Output() emojiLeave: Emoji['emojiLeave'] = new EventEmitter();
  @Output() emojiClick: Emoji['emojiClick'] = new EventEmitter();

  containerStyles: any = {};
  labelStyles: any = {};
  labelSpanStyles: any = {};
  margin = 0;
  minMargin = 0;
  maxMargin = 0;
  top = 0;

  constructor(
    public ref: ChangeDetectorRef,
    private emojiService: EmojiService,
    private frequently: EmojiFrequentlyService,
  ) { }

  ngOnInit() {
    this.emojis = this.getEmojis();

    //console.log(this.emojis, this.emojis.length);

  }

  getEmojis() {
    if (this.name === 'Recent') {
      let frequentlyUsed = this.recent || this.frequently.get(this.perLine, this.totalFrequentLines);
      if (!frequentlyUsed || !frequentlyUsed.length) {
        frequentlyUsed = this.frequently.get(this.perLine, this.totalFrequentLines);
      }
      if (frequentlyUsed.length) {
        this.emojis = frequentlyUsed
          .map(id => {
            //const emoji = this.custom.filter((e: any) => e.id === id)[0];
            //if (emoji) {
            //  return emoji;
            //}

            return id;
          })
          .filter(id => !!this.emojiService.getData(id));
      }

      if ((!this.emojis || this.emojis.length === 0) && frequentlyUsed.length > 0) {
        return null;
      }
    }

    if (this.emojis) {
      this.emojis = this.emojis.slice(0);
    }

    return this.emojis;
  }
  
  trackById(index: number, item: any) {
    return item;
  }
}
