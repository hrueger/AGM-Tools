import { Component, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "picker-modal-content",
    templateUrl: "./filePickerModal.html",
})
export class FilePickerModalComponent {
    @Input() public title;
    @Input() public multiple = false;
    @Input() public displayRoot = false;
    @Input() public rootName = "";
    @Input() public projectId;
    public itemTree: any[];
    public config: any;

    @ViewChild("treeView") private treeView: TreeViewComponent;

    constructor(public activeModal: NgbActiveModal, public remoteService: RemoteService) {}

    public ngOnInit() {
        this.remoteService.get("get", `files/tree/${this.projectId}`).subscribe((data: any[]) => {
            setTimeout(() => {
                this.itemTree = this.addIconUrls(data);
                if (this.displayRoot) {
                    this.itemTree = [{
                        files: [...this.itemTree],
                        iconUrl: "assets/icons/folder.png",
                        id: -1,
                        name: this.rootName,
                    }];
                }
                this.config = {
                    child: "files",
                    dataSource: this.itemTree,
                    id: "id",
                    imageUrl: "iconUrl",
                    text: "name",
                };
            }, 0);
        });
    }

    public pick() {
        this.activeModal.close(this.treeView.selectedNodes);
    }

    private addIconUrls(itemTree) {
        for (const item of itemTree) {
            if (item.isFolder) {
                item.iconUrl = "assets/icons/folder.png";
            } else {
                const parts = item.name.split(".");
                const ext = parts[parts.length - 1];
                item.iconUrl = `assets/icons/extralarge/${ext}.png`;
            }
            if (item.files.length > 0) {
                item.files = this.addIconUrls(item.files);
            }
        }
        return itemTree;
    }
}
