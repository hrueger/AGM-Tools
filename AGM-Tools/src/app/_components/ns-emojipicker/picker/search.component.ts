import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { EmojiSearch } from './emoji-search.service';

let id = 0;

/*
<TextField
        [id]="inputId"
        #inputRef
        type="search"
        (keyup.enter)="handleEnterKey($event)"
        [placeholder]="i18n.search"
        [autofocus]="autoFocus"
        [(ngModel)]="query"
        (ngModelChange)="handleChange()"
         ngDefaultControl
      ></TextField>

      <Label class="emoji-mart-sr-only" [htmlFor]="inputId">
        {{ i18n.search }}
      </Label>
      <Button
        type="button"
        class="emoji-mart-search-icon"
        (click)="clear()"
        (keyup.enter)="clear()"
        [disabled]="!isSearching"
        [attr.aria-label]="i18n.clear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="13"
          height="13"
          opacity="0.5"
        >
          <path [attr.d]="icon" />
        </svg>
      </Button>
*/

@Component({
  selector: 'emoji-search',
  template: `
    <StackLayout class="emoji-mart-search">
      <Label tet="Search"></Label>
    </StackLayout>
  `,
  preserveWhitespaces: false,
})
export class SearchComponent implements AfterViewInit, OnInit {
  @Input() maxResults = 75;
  @Input() autoFocus = false;
  @Input() i18n: any;
  @Input() include: string[] = [];
  @Input() exclude: string[] = [];
  @Input() custom: any[] = [];
  @Input() icons?: { [key: string]: string };
  @Input() emojisToShowFilter?: (x: any) => boolean;
  @Output() searchResults = new EventEmitter<any[]>();
  @Output() enterKey = new EventEmitter<any>();
  @ViewChild('inputRef', { static: true }) private inputRef!: ElementRef;
  isSearching = false;
  icon?: string;
  query = '';
  inputId = `emoji-mart-search-${++id}`;

  constructor(private emojiSearch: EmojiSearch) { }

  ngOnInit() {
    this.icon = this.icons.search;
  }
  ngAfterViewInit() {
    if (this.autoFocus) {
      this.inputRef.nativeElement.focus();
    }
  }
  clear() {
    this.query = '';
    this.handleSearch('');
    this.inputRef.nativeElement.focus();
  }
  handleEnterKey($event: Event) {
    if (!this.query) {
      return;
    }
    this.enterKey.emit($event);
    $event.preventDefault();
  }
  handleSearch(value: string) {
    if (value === '') {
      this.icon = this.icons.search;
      this.isSearching = false;
    } else {
      this.icon = this.icons.delete;
      this.isSearching = true;
    }
    const emojis = this.emojiSearch.search(
      this.query,
      this.emojisToShowFilter,
      this.maxResults,
      this.include,
      this.exclude,
      this.custom,
    );
    this.searchResults.emit(emojis);
  }
  handleChange() {
    this.handleSearch(this.query);
  }
}
