import { Directive, EventEmitter, Input, Output } from "@angular/core";

export type SortDirection = "asc" | "desc" | "";
const rotate: { [key: string]: SortDirection } = { "": "asc", "asc": "desc", "desc": "asc" };
export const compare = (v1, v2) => {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
};

export interface ISortEvent {
    column: string;
    direction: SortDirection;
}

@Directive({
    host: {
        "(click)": "rotate()",
        "[class.sortedAsc]": 'direction === "asc"',
        "[class.sortedDesc]": 'direction === "desc"',
    },
    selector: "th[sortable]",
})
export class SortableHeader {

    @Input() public sortable: string;
    @Input() public direction: SortDirection = "";
    @Output() public sort = new EventEmitter<ISortEvent>();

    public rotate() {
        this.direction = rotate[this.direction];
        this.sort.emit({ column: this.sortable, direction: this.direction });
    }
}
