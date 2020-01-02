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
import { PhotoEditor } from "nativescript-photo-editor";
import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { knownFolders, path } from "tns-core-modules/file-system/file-system";
import { ImageSource } from "tns-core-modules/image-source/image-source";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import { environment } from "../../../environments/environment";
import { Chat } from "../../_models/chat.model";
import { Contact } from "../../_models/contact.model";
import { Message } from "../../_models/message.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { ContactPickerComponent } from "../_modals/contact-picker.modal.tns";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "chat-messages",
    styleUrls: ["chat-messages.component.scss"],
    templateUrl: "chat-messages.component.html",
})
export class ChatMessagesComponent
    implements OnInit {
    @Input() public inputReceiverId: number;
    public chatId: number;
    public chatType: string;
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
        private page: Page,
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

                                        const url = environment.apiUrl + "?token=" +
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
                                                name: "sendChatAttachment", value: that.chatId.toString(),
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
            animated: true,
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(ContactPickerComponent, options).then((contact) => {
            if (contact) {

                dialogs.confirm({
                    cancelButtonText: "Abbrechen",
                    cancelable: true,
                    message: "Soll dieser Kontakt wirklich gesendet werden?",
                    okButtonText: "Senden",
                    title: contact.display_name,
                }).then((result: boolean) => {
                    const contactToSend = {
                        name: contact.display_name,
                        number: contact.phone[0].number,
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
                            .getNoCache("post", "chatSendMessage", {
                                contactSrc: contactToSend,
                                message: "Kontakt",
                                rid: this.chatId,
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
    }

    public sendMessage() {
        if (this.inputMessageField.nativeElement.text && this.inputMessageField.nativeElement.text != "") {
            let message: Message = {
                chat: null,
                created: Date.now(),
                fromMe: true,
                sendername: "",
                sent: "notsent",
                text: this.inputMessageField.nativeElement.text,
            };
            this.messages.push(message);
            this.remoteService
                .getNoCache("post", "chatSendMessage", {
                    message: this.inputMessageField.nativeElement.text,
                    rid: this.chatId,
                })
                .subscribe((data) => {
                    message = this.messages.pop();
                    message.sent = "sent";
                    this.messages.push(message);
                    // console.log(this.messages);
                    this.cdr.detectChanges();
                });
            this.inputMessageField.nativeElement.text = "";
        }
    }

    public ngOnInit() {
        this.page.actionBarHidden = true;
        this.chatId = this.route.snapshot.params.id;
        this.chatType = this.route.snapshot.params.type;
        setTimeout(() => {
            this.remoteService.get("get", "chats").subscribe((chats) => {
                this.chat = chats.filter((chat: any) => chat.id == this.chatId)[0];
                this.cdr.markForCheck();
                this.getMessages();
            });
        });
    }

    public videoCall() {
        //
    }

    public audioCall() {
        //
    }

    public options() {
        //
    }

    public getMessages() {
        setTimeout(() => {
            this.remoteService.get("get", `chats/${this.chatType}/${this.chatId}`)
            .subscribe((data) => {
                if (data != null) {
                    this.messages.length = 0;
                    this.messages.push(...data);
                    this.cdr.markForCheck();
                }
            });
        }, 0);
    }

    public getInitials(name: string) {
        const initials = name.match(/\b\w/g) || [];
        return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
    }

    public goBack() {
        this.router.navigate(["chat"], {
            animated: true,
            transition: {
                name: "slideRight",
            },
        });
    }

    public toggleEmojiPicker() {
        this.inputMessageField.nativeElement.togglePopup();
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
