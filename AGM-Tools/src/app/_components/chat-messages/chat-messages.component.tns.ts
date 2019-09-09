import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import * as camera from "nativescript-camera";
import { PhotoEditor, PhotoEditorControl } from "nativescript-photo-editor";

import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { knownFolders, path } from "tns-core-modules/file-system/file-system";
import { ImageSource } from "tns-core-modules/image-source/image-source";
import config from "../../_config/config";
import { Chat } from "../../_models/chat.model";
import { Contact } from "../../_models/contact.model";
import { Message } from "../../_models/message.model";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "chat-messages",
    styleUrls: ["chat-messages.component.scss"],
    templateUrl: "chat-messages.component.html",
})
export class ChatMessagesComponent
    implements OnInit {
    @Input() public inputReceiverId: number;
    public receiverId: number;
    public showEmojiPicker = false;
    public chat: Chat = {
        contact: new Contact(),
        muted: null,
        rid: null,
        text: null,
        type: null,
        unread: null,
        when: null,
    };
    public dialogOpen: boolean = false;
    public unread: number;
    public messages: ObservableArray<Message> = new ObservableArray<Message>(0);
    public inputMessage: string;

    @ViewChild("inputMessageField", { static: false }) public inputMessageField: ElementRef;
    constructor(
        private remoteService: RemoteService,
        private router: RouterExtensions,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
    ) { }

    public toggleAttachmentDialog() {
        this.dialogOpen = !this.dialogOpen;
    }

    public sendDocument() {
        alert("Noch nicht implementiert!");
    }
    public sendPicture() {
        const that = this;
        camera.requestPermissions().then(
            function success() {
                camera.takePicture({saveToGallery: false}).
                then((imageAsset) => {
                    console.log("picture taken", imageAsset);
                    const source = new ImageSource();
                    source.fromAsset(imageAsset)
                    .then((imageSource) => {
                        const photoEditor = new PhotoEditor();
                        photoEditor.editPhoto({
                            imageSource,
                        }).then((newImage: ImageSource) => {
                            const folderDest = knownFolders.documents();
                            const date = new Date();
                            const filename = "agmtools_" + date.getDate() + "-"
                                            + (date.getMonth())  + "-"
                                            + date.getFullYear() + "_"
                                            + date.getHours() + "-"
                                            + date.getMinutes() + "-"
                                            + date.getSeconds();
                            const pathDest = path.join(folderDest.path, filename + ".png");
                            const saved: boolean = newImage.saveToFile(pathDest, "png");
                            if (saved) {
                                const url = config.apiUrl;
                                const name = pathDest.substr(pathDest.lastIndexOf("/") + 1);

                                // upload configuration
                                const bghttp = require("nativescript-background-http");
                                const session = bghttp.session("image-upload");
                                const request = {
                                    description: "Uploading " + name,
                                    headers: {
                                        "Content-Type": "application/octet-stream",
                                    },
                                    method: "POST",
                                    url,
                                };
                                const params = [
                                    { name: "token", value: that.authService.currentUserValue.token },
                                    { name: "chatFile", filename: pathDest, mimeType: "image/png" },
                                    { name: "type", value: "image" },
                                    ];
                                const task = session.multipartUpload(params, request);
                                task.on("progress", progressHandler);
                                task.on("error", errorHandler);
                                task.on("responded", respondedHandler);
                                task.on("complete", completeHandler);
                                task.on("cancelled", cancelledHandler); // Android only
                            }
                        }).catch((e) => {
                            console.error(e);
                        });
                    });
                }).catch((err) => {
                    console.log("Error -> " + err.message);
                });
            },
            function failure() {
            console.log("no permission");
            },
        );
    }
    public sendGallery() {
        alert("Noch nicht implementiert!");
    }
    public sendAudio() {
        alert("Noch nicht implementiert!");
    }
    public sendLocation() {
        alert("Noch nicht implementiert!");
    }
    public sendContact() {
        alert("Noch nicht implementiert!");
    }

    public sendMessage() {
        let message = {
            chat: null,
            created: Date.now(),
            fromMe: true,
            sendername: "",
            sent: "notsent",
            text: this.inputMessage,
        };
        this.messages.push(message);
        this.remoteService
            .getNoCache("chatSendMessage", {
                message: this.inputMessage,
                rid: this.receiverId,
            })
            .subscribe((data) => {
                message = this.messages.pop();
                message.sent = "sent";
                this.messages.push(message);
                // console.log(this.messages);
                this.cdr.detectChanges();
            });
        this.inputMessage = "";
    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.receiverId = +params.index;
            this.remoteService.get("chatGetContacts").subscribe((chats) => {
                // this.chats = chats;
                from(chats)
                    .pipe(
                        filter(
                            // @ts-ignore
                            (chat) => chat.rid == this.receiverId,
                        ),
                    )
                    .subscribe((chat) => {
                        // @ts-ignore
                        this.chat = chat;
                        this.getMessages(this.receiverId);
                    });
            });
        });
    }

    public onEmojiClick(emoji: string) {
        // @ts-ignore
        this.inputMessage = (this.inputMessage ? this.inputMessage : "") + String.fromCodePoint("0x" + emoji);
        // console.log(this.inputMessageField.nativeElement.android.setSelection);
        if (this.inputMessageField.nativeElement.android) {
            setTimeout(() => {
                this.inputMessageField.nativeElement.android.setSelection(
                    this.inputMessageField.nativeElement.android.length(),
                );
            }, 0);
        }
    }

    public getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe((data) => {
                if (data != null) {
                    this.messages.length = 0;
                    this.messages.push(...data);
                    this.cdr.detectChanges();
                }
            });
    }

    public goBack() {
        // @ts-ignore
        this.router.navigate(["chat"], {
            animated: true,
            transition: {
                name: "slideRight",
            },
        });
    }

    public toggleEmojiPicker() {
        if (this.showEmojiPicker) {
            this.showEmojiPicker = false;
            this.inputMessageField.nativeElement.focus();
        } else {
            this.showEmojiPicker = true;
            this.inputMessageField.nativeElement.dismissSoftInput();
        }
    }
    public showKeyboard() {
        this.showEmojiPicker = false;
    }

    public onBackspaceClick() {
        this.inputMessage = (this.inputMessage ? this.inputMessage.slice(0, -1) : "");
        // console.log(this.inputMessageField.nativeElement.android.setSelection);
        if (this.inputMessageField.nativeElement.android) {
            setTimeout(() => {
                this.inputMessageField.nativeElement.android.setSelection(
                    this.inputMessageField.nativeElement.android.length(),
                );
            }, 0);
        }
    }

}

// event arguments:
// task: Task
// currentBytes: number
// totalBytes: number
function progressHandler(e) {
    alert("uploaded " + e.currentBytes + " / " + e.totalBytes);
}

// event arguments:
// task: Task
// responseCode: number
// error: java.lang.Exception (Android) / NSError (iOS)
// response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
function errorHandler(e) {
    alert("received " + e.responseCode + " code.");
    let serverResponse = e.response;
}

// event arguments:
// task: Task
// responseCode: number
// data: string
function respondedHandler(e) {
    alert("received " + e.responseCode + " code. Server sent: " + e.data);
}

// event arguments:
// task: Task
// responseCode: number
// response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
function completeHandler(e) {
    alert("received " + e.responseCode + " code");
    let serverResponse = e.response;
}

// event arguments:
// task: Task
function cancelledHandler(e) {
    alert("upload cancelled");
}
