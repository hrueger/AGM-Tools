import {
    Component, ElementRef, HostListener, Input,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            useExisting: FileUploadComponent,
        },
    ],
    selector: "app-file-upload",
    templateUrl: "./file-upload.component.html",
})
export class FileUploadComponent implements ControlValueAccessor {
    @Input() public progress;
    public onChange: Function;
    public file: File | null = null;

    constructor(private host: ElementRef<HTMLInputElement>) { }

    @HostListener("change", ["$event.target.files"]) public emitFiles(
        event: FileList,
    ) {
        const file = event && event.item(0);
        this.onChange(file);
        this.file = file;
    }

    public writeValue() {
        // clear file input
        this.host.nativeElement.value = "";
        this.file = null;
    }

    public registerOnChange(fn: Function) {
        this.onChange = fn;
    }

    // eslint-disable-next-line
    public registerOnTouched() { }
}
