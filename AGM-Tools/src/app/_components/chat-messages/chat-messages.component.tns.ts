import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { RouterExtensions } from "nativescript-angular/router";
import * as camera from "nativescript-camera";
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
import * as dialogs from "tns-core-modules/ui/dialogs";
import config from "../../_config/config";
import { Chat } from "../../_models/chat.model";
import { Contact } from "../../_models/contact.model";
import { Message } from "../../_models/message.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { ContactPickerComponent } from "../_modals/contact-picker.modal.tns";

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
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
    ) { }

    public toggleAttachmentDialog() {
        this.dialogOpen = !this.dialogOpen;
    }

    public sendDocument() {
        this.toggleAttachmentDialog();
        alert("Noch nicht implementiert!");
    }
    public sendPicture() {
        this.toggleAttachmentDialog();
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
                                            text: "Bild wird hochgeladen...",
                                        };
                                        this.messages.push(message);
                                        this.remoteService
                                            .getNoCache("chatSendMessage", {
                                                message: this.inputMessage,
                                                rid: this.receiverId,
                                            })
                                            .subscribe();*/

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
        this.toggleAttachmentDialog();
        alert("Noch nicht implementiert!");
    }
    public sendAudio() {
        this.toggleAttachmentDialog();
        alert("Noch nicht implementiert!");
    }
    public sendLocation() {
        this.toggleAttachmentDialog();
        alert("Leider wird das nicht unterstützt. Den Button gibts nur für die Ästhetik ;-)");
    }
    public sendContact() {
        this.toggleAttachmentDialog();
        const options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(ContactPickerComponent, options).then((newNotification) => {
            if (newNotification) {
                this.remoteService
                    .getNoCache("notificationsNewNotification", {
                        content: newNotification.content,
                        headline: newNotification.headline,
                        receivers: newNotification.receivers,
                        type: newNotification.importance,
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Benachrichtigung erfolgreich gesendet!",
                            );
                            this.remoteService
                                .get("notificationsGetNotifications")
                                .subscribe((res) => {
                                    this.notifications = res;
                                });
                        }
                    });
            }
        });
        /*permissions.requestPermissions([
            android.Manifest.permission.READ_CONTACTS,
            android.Manifest.permission.WRITE_CONTACTS,
        ]).then(() => {
                contacts.getContact().then((args) => {
                    /// Returns args:
                    /// args.data: Generic cross platform JSON object
                    /// args.reponse: "selected" or "cancelled" depending on wheter the user selected a contact.

                    if (args.response === "selected") {
                        const contact = args.data; // See data structure below
                        dialogs.confirm({
                            cancelButtonText: "Abbrechen",
                            cancelable: true,
                            message: "Soll dieser Kontakt wirklich gesendet werden?",
                            okButtonText: "Senden",
                            title: contact.name.given,
                        }).then((result: boolean) => {
                            const contactToSend = {
                                name: contact.name.given,
                                number: contact.phoneNumbers[0].value,
                            };
                            if (result) {
                                let message: Message = {
                                    chat: null,
                                    contactSrc: contactToSend,
                                    created: Date.now(),
                                    fromMe: true,
                                    sendername: "",
                                    sent: "notsent",
                                    text: "",
                                };
                                this.messages.push(message);
                                this.remoteService
                                    .getNoCache("chatSendMessage", {
                                        contactSrc: contactToSend,
                                        message: this.inputMessage,
                                        rid: this.receiverId,
                                    })
                                    .subscribe((data) => {
                                        message = this.messages.pop();
                                        message.sent = "sent";
                                        this.messages.push(message);
                                        this.cdr.detectChanges();
                                    });
                            }
                        });
                    }
                });
            });*/
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
