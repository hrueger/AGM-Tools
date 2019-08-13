import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { EmojiCategory } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'emoji-mart-anchors',
  template: `
  <StackLayout class="emoji-mart-anchors">
    <ng-template ngFor let-category [ngForOf]="categories" let-idx="index" [ngForTrackBy]="trackByFn">
      <Label
        *ngIf="category.anchor !== false"
        [attr.title]="i18n.categories[category.id]"
        (click)="this.handleClick($event, idx)"
        class="emoji-mart-anchor"
        [class.emoji-mart-anchor-selected]="category.name === selected"
        [style.color]="category.name === selected ? color : null"
      ></Label>
        <StackLayout>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path [attr.d]="icons[category.id]" />
          </svg>
        </StackLayout>
        <Label class="emoji-mart-anchor-bar" [style.background-color]="color">
      </Label>
    </ng-template>
  </StackLayout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class AnchorsComponent {
  @Input() categories: EmojiCategory[] = [];
  @Input() color?: string;
  @Input() selected?: string;
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
}
