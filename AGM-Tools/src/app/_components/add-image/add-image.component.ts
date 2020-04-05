import {
    Component, OnInit, ViewChild, Input, Output, EventEmitter,
} from "@angular/core";
import { NgbModal, NgbNavChangeEvent, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxAdvancedImageEditorComponent } from "ngx-advanced-image-editor";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { ElectronService } from "../../_services/electron.service";

@Component({
    selector: "image-editor",
    template: `
        <div style="height: calc(100vh - 140px - 3.5rem); width: 100%;">
            <ngx-advanced-image-editor #imageEditor [options]="editorOptions"></ngx-advanced-image-editor>
        </div>
    `,
    styles: [`
        tui-image-editor::ng-deep .tui-image-editor-header {
            display: none;
        }
    `],
})
export class ImageEditorComponent {
    @ViewChild("imageEditor") public imageEditor: NgxAdvancedImageEditorComponent;
    @Input() public url = "";
    public editorOptions = {
        usageStatistics: false,
        includeUI: {
            menuBarPosition: "bottom",
            theme: {
                "common.bi.image": "",
                "common.bisize.width": "0px",
                "common.bisize.height": "20px",
                "common.backgroundImage": "none",
                "common.backgroundColor": "#e1e1e1",
                "common.border": "0px",

                // header
                "header.backgroundImage": "none",
                "header.backgroundColor": "transparent",
                "header.border": "0px",

                // load button
                "loadButton.backgroundColor": "#000",
                "loadButton.border": "1px solid #222222",
                "loadButton.color": "#dddddd",
                "loadButton.fontFamily": "NotoSans, sans-serif",
                "loadButton.fontSize": "12px",

                // download button
                "downloadButton.backgroundColor": "#0245c4",
                "downloadButton.border": "1px solid #0245c4",
                "downloadButton.color": "#fff",
                "downloadButton.fontFamily": "NotoSans, sans-serif",
                "downloadButton.fontSize": "12px",

                // icons default
                "menu.normalIcon.color": "#757575",
                "menu.activeIcon.color": "#aaaaaa",
                "menu.disabledIcon.color": "#bcbcbc",
                "menu.hoverIcon.color": "#161616",
                "submenu.normalIcon.color": "#757575",
                "submenu.activeIcon.color": "#161616",

                "menu.iconSize.width": "24px",
                "menu.iconSize.height": "24px",
                "submenu.iconSize.width": "32px",
                "submenu.iconSize.height": "32px",

                "menu.backgroundColor": "#fff",

                // submenu primary color
                "submenu.backgroundColor": "#e1e1e1",
                "submenu.partition.color": "#7a7a7a",

                // submenu labels
                "submenu.normalLabel.color": "#7a7a7a",
                "submenu.normalLabel.fontWeight": "lighter",
                "submenu.activeLabel.color": "#000",
                "submenu.activeLabel.fontWeight": "lighter",

                // checkbox style
                "checkbox.border": "1px solid #333333",
                "checkbox.backgroundColor": "#000",

                // rango style
                "range.pointer.color": "#000",
                "range.bar.color": "#999999",
                "range.subbar.color": "#2e2e2e",

                "range.disabledPointer.color": "#bebebe",
                "range.disabledBar.color": "#d7d7d7",
                "range.disabledSubbar.color": "#bebebe",

                "range.value.color": "#000",
                "range.value.fontWeight": "lighter",
                "range.value.fontSize": "11px",
                "range.value.border": "1px solid #cacaca",
                "range.value.backgroundColor": "#eaeaea",
                "range.title.color": "#000",
                "range.title.fontWeight": "lighter",

                // colorpicker style
                "colorpicker.button.border": "1px solid #e1e1e1",
                "colorpicker.title.color": "#000",
            },
        },
    }
    public ngAfterViewInit() {
        this.imageEditor.editorInstance.loadImageFromURL(this.url, "image").then((sizeValue) => {
            // @ts-ignore
            this.imageEditor.editorInstance.ui.activeMenuEvent();
            this.imageEditor.editorInstance.ui.resizeEditor({ imageSize: sizeValue });
        });
    }
}

@Component({
    selector: "add-image",
    styleUrls: ["./add-image.component.scss"],
    templateUrl: "./add-image.component.html",
})
export class AddImageComponent implements OnInit {
    public isElectron = false;
    public sources: any[] = [];
    public url = "";
    public imageSelected = false;
    @Output() public image: EventEmitter<string> = new EventEmitter();
    @ViewChild("imageEditor") public imageEditor: ImageEditorComponent;
    public modal: NgbModalRef;
    constructor(private electronService: ElectronService,
        private fts: FastTranslateService, private modalService: NgbModal) { }

    public ngOnInit() {
        this.isElectron = this.electronService.isElectron;
    }

    public async openPicker(content, content2) {
        this.modalService.open(content, { size: "xl" }).result.then((url) => {
            if (url) {
                this.url = url;
                this.modal = this.modalService.open(content2, { size: "xl", windowClass: "fullscreenModal" });
                this.modal.result.then((imageDataUrl) => {
                    this.image.emit(imageDataUrl);
                }).catch(() => {
                    //
                });
            }
        }, () => {
            //
        });
    }

    public async onTabChange(changeEvent: NgbNavChangeEvent) {
        if (changeEvent.nextId == "3") {
            if (this.isElectron) {
                this.sources = await this.electronService.getScreenshotThumbnails();
            }
        }
    }

    public async useImage(image, modal) {
        this.imageSelected = true;
        modal.close(await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        }));
    }
}
