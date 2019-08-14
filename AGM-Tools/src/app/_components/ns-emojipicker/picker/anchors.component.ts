import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { EmojiCategory } from '../emoji/public_api';

@Component({
  selector: 'emoji-picker-anchors',
  templateUrl: "anchors.component.html",
  styleUrls: ["./picker.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class AnchorsComponent {
  @Input() categories: EmojiCategory[] = [];
  @Input() color: string;
  @Input() selected: string;
  @Input() i18n: any;
  @Input() icons: { [key: string]: string } = {};
  @Output() anchorClick = new EventEmitter<{ category: EmojiCategory, index: number }>();

  trackByFn(idx: number, cat: EmojiCategory) {
    return cat.id;
  }
  handleClick($event: Event, index: number) {
    this.anchorClick.emit({
      category: this.categories[index],
      index,
    });
    
  }
  parseIcon(icon: string) {
    return String.fromCharCode(parseInt(icon, 16));
  }
}
