import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NgModule } from '@angular/core';
import { EmojiModule } from '../emoji/public_api';
import { AnchorsComponent } from './anchors.component';
import { CategoryComponent } from './category.component';
import { PickerComponent } from './picker.component';
import { PreviewComponent } from './preview.component';
import { SearchComponent } from './search.component';
import { SkinComponent } from './skins.component';
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";

@NgModule({
  imports: [
    NativeScriptModule,
    EmojiModule,
    NativeScriptUIListViewModule
  ],
  exports: [
    PickerComponent,
    AnchorsComponent,
    CategoryComponent,
    SearchComponent,
    PreviewComponent,
    SkinComponent,
  ],
  declarations: [
    PickerComponent,
    AnchorsComponent,
    CategoryComponent,
    SearchComponent,
    PreviewComponent,
    SkinComponent,
  ],
})
export class PickerModule { }
