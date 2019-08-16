import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NgModule } from '@angular/core';
import { PickerComponent } from './picker.component';
import { PreviewComponent } from './preview.component';
import { SearchComponent } from './search.component';
import { SkinComponent } from './skins.component';
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptUIListViewModule
  ],
  exports: [
    PickerComponent,
    SearchComponent,
    PreviewComponent,
    SkinComponent,
  ],
  declarations: [
    PickerComponent,
    SearchComponent,
    PreviewComponent,
    SkinComponent,
  ],
})
export class PickerModule { }
