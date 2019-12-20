import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "picker-modal-content",
    templateUrl: "./filePickerModal.html",
  })
  export class FilePickerModalComponent {
    @Input() public title;
    @Input() public multiple: boolean = false;
    @Input() public projectId;
    public itemTree: any[];
    public config: any;

    constructor(public activeModal: NgbActiveModal, public remoteService: RemoteService) {}

    public ngOnInit() {
        this.remoteService.get("get", `files/tree/${this.projectId}`).subscribe((data: any[]) => {
            setTimeout(() => {
                this.itemTree = this.addIconUrls(data);
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
        this.activeModal.close(this.itemTree.filter((item: any) => item.selected));
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
