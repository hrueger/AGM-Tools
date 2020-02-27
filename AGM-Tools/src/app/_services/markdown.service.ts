import { Injectable } from "@angular/core";
import * as TurndownService from "turndown";
import { MarkdownService as MdService } from "ngx-markdown";

@Injectable()
export class MarkdownService {
    constructor(private mdService: MdService) {}
    public from(content: string) {
        // @ts-ignore
        return TurndownService.default().turndown(content) as string;
    }
    public to(content: string) {
        return this.mdService.compile(content);
    }
}
