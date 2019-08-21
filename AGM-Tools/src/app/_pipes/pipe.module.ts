import { NgModule } from "@angular/core";
import { ToIconPipe } from "./ToIcon.pipe";

@NgModule({
    declarations: [ToIconPipe],
    exports: [ToIconPipe],
    imports: [],
})

export class PipeModule {

    public static forRoot() {
        return {
            ngModule: PipeModule,
            providers: [],
        };
    }
}
