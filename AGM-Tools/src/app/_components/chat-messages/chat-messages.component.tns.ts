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
import * as contacts from "nativescript-contacts";
import {
    AudioPickerOptions, FilePickerOptions, ImagePickerOptions,
    Mediafilepicker, VideoPickerOptions,
} from "nativescript-mediafilepicker";
import * as permissions from "nativescript-permissions";
import { PhotoEditor } from "nativescript-photo-editor";
import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { knownFolders, path } from "tns-core-modules/file-system/file-system";
import { ImageSource } from "tns-core-modules/image-source/image-source";
import config from "../../_config/config";
import { Chat } from "../../_models/chat.model";
import { Contact } from "../../_models/contact.model";
import { Message } from "../../_models/message.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";

declare var android: any;

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
        private alertService: AlertService,
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
                camera.takePicture({ saveToGallery: false }).
                    then((imageAsset) => {
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
                                        + (date.getMonth()) + "-"
                                        + date.getFullYear() + "_"
                                        + date.getHours() + "-"
                                        + date.getMinutes() + "-"
                                        + date.getSeconds();
                                    const pathDest = path.join(folderDest.path, filename + ".png");
                                    const saved: boolean = newImage.saveToFile(pathDest, "png");
                                    if (saved) {

                                        // add message to chat
                                        /*let message: Message = {
                                            chat: null,
                                            created: Date.now(),
                                            fromMe: true,
                                            imageSrc: this.inputMessage,
                                            sendername: "",
                                            sent: "notsent",
                                            type: "image",
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
                                            });*/

                                        const url = config.apiUrl + "?token=" +
                                            that.authService.currentUserValue.token.toString();
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
                                            { name: "attachment", filename: pathDest, mimeType: "image/png" },
                                            { name: "type", value: "image" },
                                            {
                                                name: "sendChatAttachment", value: that.receiverId.toString(),
                                            },
                                        ];
                                        const task = session.multipartUpload(params, request);
                                        task.on("progress", progressHandler);
                                        task.on("error", errorHandler);
                                        task.on("responded", respondedHandler);
                                        task.on("complete", completeHandler);
                                        task.on("cancelled", cancelledHandler);

                                    }
                                }).catch((e) => {
                                    that.alertService.error("Folgender Fehler ist aufgetreten: " + e);
                                });
                            });
                    }).catch((err) => {
                        that.alertService.error("Folgender Fehler ist aufgetreten: " + err.message);
                    });
            },
            function failure() {
                that.alertService.error("Leider kann AGM-Tools ohne diese\
                Berechtigungen kein Bild versenden. Bitte versuche es erneut!");
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
        alert("Leider wird das nicht unterstützt. Den Button gibts nur für die Ästhetik ;-)");
    }
    public sendContact() {
        permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
            android.Manifest.permission.WRITE_CONTACTS, android.Manifest.permission.CAMERA])
            .then(() => {
                contacts.getContact().then((args) => {
                    /// Returns args:
                    /// args.data: Generic cross platform JSON object
                    /// args.reponse: "selected" or "cancelled" depending on wheter the user selected a contact.

                    if (args.response === "selected") {
                        const contact = args.data; // See data structure below

                        // lets say you wanted to grab first name and last name
                        console.log(contact.name.given + " " + contact.name.family);

                        // lets say you want to get the phone numbers
                        contact.phoneNumbers.forEach(function (phone) {
                            console.log(phone.value);
                        });

                        // lets say you want to get the addresses
                        contact.postalAddresses.forEach(function (address) {
                            console.log(address.location.street);
                        });
                    }
                });
            });
    }

    public sendMessage() {
        let message: Message = {
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

function progressHandler(e) {
    //
}
function errorHandler(e) {
    alert("Die Datei konnte nicht erfolgreich hochgeladen werden, Fehlercode " + e.responseCode);
}
function respondedHandler(e) {
    // console.log("received " + e.responseCode + " code. Server sent: " + e.data);
}
function completeHandler(e) {
    //
}
function cancelledHandler(e) {
    //
}
