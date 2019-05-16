import { Injectable } from "@angular/core";

import { Chat } from "../_models//chat.model";
import { Message } from "../_models//message.model";
import { SentStatus } from "../_models/sent-status.model";

import { HttpClient } from "@angular/common/http";
import config from "../_config/config";
import { tap, catchError } from "rxjs/operators";
import { Observable } from "rxjs/internal/Observable";
import { of } from "rxjs";

var cache = require("nativescript-cache");

@Injectable()
export class ChatsDataService {
    constructor(private http: HttpClient) {}

    getMessages(receiverId): Message[] {
        return Array(200)
            .fill("")
            .map((ele, idx) => ({
                // Non-sense phrases
                text: [
                    "\u263A Yay, this course is amazing !!! \u270C",
                    "Sixty-four doesn't like paying taxes.",
                    "A river a thousand paces wide ever stuns the onlooker.",
                    "That stolen figurine is often one floor above you.",
                    "\u263A Yay, this course is amazing !!! \u270C",
                    "Spam sat down once more!",
                    "Whiskey on the table set a treehouse on fire.",
                    "That memory we used to share stole the goods.",
                    "Clear water rains heavily",
                    "Style is interdependant on the relatedness of " +
                        "motivation, subcultures, and management"
                ][Math.floor(Math.random() * 10)],
                chat: null,
                sender: null,
                created: Date.now() - (idx + 1) * 40 * 60 * 1000,
                sent: Math.floor(4 * Math.random())
            }));
    }
    public getChats(): Observable<Chat[]> {
        var action = "chatGetContacts";
        return this.http
            .post<any>(`${config.apiUrl}`, {
                action
            })
            .pipe(
                tap(_ => this.log("fetched " + action)),
                catchError(this.handleError<any>(action, false))
            );
    }
    private handleError<T>(operation = "operation", result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);

            this.log(`${operation} failed: ${error.message}`);
            this.log(error);

            return of(result as T);
        };
    }

    private log(message: string) {
        console.log(`ChatDataService Log: ${message}`);
    }
}
