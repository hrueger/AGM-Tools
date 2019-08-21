import { Component, ElementRef, HostListener, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    selector: "app-file-upload",
    templateUrl: "./file-upload.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: FileUploadComponent,
            multi: true,
        },
    ],
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

    public writeValue(value: null) {
        // clear file input
        this.host.nativeElement.value = "";
        this.file = null;
    }

    public registerOnChange(fn: Function) {
        this.onChange = fn;
    }

    public registerOnTouched(fn: Function) { }
}
