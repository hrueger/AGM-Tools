import { Component, ElementRef, HostListener, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: FileUploadComponent,
        },
    ],
    selector: "app-file-upload",
    templateUrl: "./file-upload.component.html",
})
export class FileUploadComponent implements ControlValueAccessor {
    @Input() public progress;
    // tslint:disable-next-line: ban-types
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

    // tslint:disable-next-line: ban-types
    public registerOnChange(fn: Function) {
        this.onChange = fn;
    }

    // tslint:disable-next-line: ban-types tslint:disable-next-line: no-empty
    public registerOnTouched(fn: Function) { }
}
