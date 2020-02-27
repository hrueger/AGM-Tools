import { Injectable } from "@angular/core";
import * as TurndownService from "turndown";

@Injectable()
export class MarkdownService {
    public from(content: string) {
        // @ts-ignore
        return TurndownService.default().turndown(content) as string;
    }
}
