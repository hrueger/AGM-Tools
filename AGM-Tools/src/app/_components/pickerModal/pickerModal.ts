import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "picker-modal-content",
    templateUrl: "./pickerModal.html",
})
export class PickerModalComponent {
    @Input() public title;
    @Input() public multiple = false;
    @Input() public items: [];
    constructor(public activeModal: NgbActiveModal) {}
    public pick() {
        this.activeModal.close(this.items.filter((item: any) => item.selected));
    }
    public selectItem(item) {
        if (!this.multiple) {
            for (const i of this.items) {
                // @ts-ignore
                i.selected = false;
            }
        }
        item.selected = !item.selected;
    }
}
