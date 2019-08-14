import { NgModule } from '@angular/core';
import { ToIconPipe } from './ToIcon.pipe';

@NgModule({
    imports: [],
    declarations: [ToIconPipe],
    exports: [ToIconPipe],
})

export class PipeModule {

    static forRoot() {
        return {
            ngModule: PipeModule,
            providers: [],
        };
    }
} 