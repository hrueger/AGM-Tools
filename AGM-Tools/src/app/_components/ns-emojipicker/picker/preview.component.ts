import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

import { Emoji, EmojiData, EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'emoji-preview',
  template: `
  <StackLayout class="emoji-mart-preview" *ngIf="emoji && emojiData">
    <StackLayout class="emoji-mart-preview-emoji">
      <ngx-emoji
        [emoji]="emoji"
        [size]="38"
        [isNative]="emojiIsNative"
        [skin]="emojiSkin"
        [size]="emojiSize"
        [set]="emojiSet"
        [sheetSize]="emojiSheetSize"
        [backgroundImageFn]="emojiBackgroundImageFn"
      ></ngx-emoji>
    </StackLayout>

    <StackLayout class="emoji-mart-preview-data">
      <StackLayout class="emoji-mart-preview-name">{{ emojiData.name }}</StackLayout>
      <StackLayout class="emoji-mart-preview-shortnames">
        <span class="emoji-mart-preview-shortname" *ngFor="let short_name of emojiData.shortNames">
          :{{ short_name }}:
        </span>
      </StackLayout>
      <StackLayout class="emoji-mart-preview-emoticons">
        <Label class="emoji-mart-preview-emoticon" *ngFor="let emoticon of listedEmoticons">
          {{ emoticon }}
        </Label>
      </StackLayout>
    </StackLayout>
  </StackLayout>

  <StackLayout class="emoji-mart-preview" *ngIf="!emoji">
    <StackLayout class="emoji-mart-preview-emoji">
      <ngx-emoji *ngIf="idleEmoji && idleEmoji.length"
        [isNative]="emojiIsNative"
        [skin]="emojiSkin"
        [set]="emojiSet"
        [emoji]="idleEmoji"
        [backgroundImageFn]="emojiBackgroundImageFn"
        [size]="38"
      ></ngx-emoji>
    </StackLayout>

    <StackLayout class="emoji-mart-preview-data">
      <Label class="emoji-mart-title-label">{{ title }}</Label>
    </StackLayout>

    <StackLayout class="emoji-mart-preview-skins">
      <emoji-skins [skin]="emojiSkin" (changeSkin)="skinChange.emit($event)" [i18n]="i18n">
      </emoji-skins>
    </StackLayout>
  </StackLayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class PreviewComponent implements OnChanges {
  @Input() title?: string;
  @Input() emoji: any;
  @Input() idleEmoji: any;
  @Input() i18n: any;
  @Input() emojiIsNative?: Emoji['isNative'];
  @Input() emojiSkin?: Emoji['skin'];
  @Input() emojiSize?: Emoji['size'];
  @Input() emojiSet?: Emoji['set'];
  @Input() emojiSheetSize?: Emoji['sheetSize'];
  @Input() emojiBackgroundImageFn?: Emoji['backgroundImageFn'];
  @Output() skinChange = new EventEmitter<number>();
  emojiData: Partial<EmojiData> = {};
  listedEmoticons?: string[];

  constructor(
    public ref: ChangeDetectorRef,
    private emojiService: EmojiService,
  ) { }

  ngOnChanges() {
    if (!this.emoji) {
      return;
    }
    this.emojiData = this.emojiService.getData(this.emoji, this.emojiSkin, this.emojiSet) as EmojiData;
    const knownEmoticons: string[] = [];
    const listedEmoticons: string[] = [];
    const emoitcons = this.emojiData.emoticons || [];
    emoitcons.forEach((emoticon: string) => {
      if (knownEmoticons.indexOf(emoticon.toLowerCase()) >= 0) {
        return;
      }
      knownEmoticons.push(emoticon.toLowerCase());
      listedEmoticons.push(emoticon);
    });
    this.listedEmoticons = listedEmoticons;
  }
}
