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
import * as geolocation from "nativescript-geolocation";
import { PhotoEditor } from "nativescript-photo-editor";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { knownFolders, path } from "tns-core-modules/file-system/file-system";
import { ImageSource } from "tns-core-modules/image-source/image-source";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { confirm } from "tns-core-modules/ui/dialogs";
import { Accuracy } from "tns-core-modules/ui/enums";
import { Page } from "tns-core-modules/ui/page/page";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { ContactPickerComponent } from "../_modals/contact-picker.modal.tns";
import { EnvironmentService } from "../../_services/environment.service";


function progressHandler(): void {
    //
}
function errorHandler(e: { responseCode: string }): void {
    // eslint-disable-next-line no-alert
    alert(`Die Datei konnte nicht erfolgreich hochgeladen werden, Fehlercode ${e.responseCode}`);
}
function respondedHandler(): void {
    // console.log("received " + e.responseCode + " code. Server sent: " + e.data);
}
function completeHandler(): void {
    //
}
function cancelledHandler(): void {
    //
}


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
    public chat = {
        id: null,
        isUser: null,
        muted: null,
        name: null,
        rid: null,
        text: null,
        type: null,
        unread: null,
        when: null,
    };
    public dialogOpen = false;
    public unread: number;
    public messages: ObservableArray<any> = new ObservableArray<any>(0);

    @ViewChild("inputMessageField", { static: false }) public inputMessageField: ElementRef;
    public constructor(
        private remoteService: RemoteService,
        private router: RouterExtensions,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private page: Page,
        private environmentService: EnvironmentService,
    ) { }

    public toggleAttachmentDialog(): void {
        this.dialogOpen = !this.dialogOpen;
    }

    public sendDocument(): void {
        this.toggleAttachmentDialog();
        // eslint-disable-next-line no-alert
        alert("Noch nicht implementiert!");
    }
    public sendPicture(): void {
        this.toggleAttachmentDialog();
        const that = this;
        camera.requestPermissions().then(
            (): void => {
                camera.takePicture({ saveToGallery: false })
                    .then((imageAsset): void => {
                        const source = new ImageSource();
                        source.fromAsset(imageAsset)
                            .then((imageSource): void => {
                                const photoEditor = new PhotoEditor();
                                photoEditor.editPhoto({
                                    imageSource,
                                }).then((newImage: ImageSource): void => {
                                    const folderDest = knownFolders.documents();
                                    const date = new Date();
                                    const filename = `agmtools_${date.getDate()}-${
                                        date.getMonth()}-${
                                        date.getFullYear()}_${
                                        date.getHours()}-${
                                        date.getMinutes()}-${
                                        date.getSeconds()}`;
                                    const pathDest = path.join(folderDest.path, `${filename}.png`);
                                    const saved: boolean = newImage.saveToFile(pathDest, "png");
                                    if (saved) {
                                        // add message to chat
                                        /* let message: Message = {
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
                                            .subscribe(); */

                                        const url = `${this.environmentService.environment.apiUrl}?token=${
                                            that.authService.currentUserValue.token.toString()}`;
                                        const name = pathDest.substr(pathDest.lastIndexOf("/") + 1);

                                        // upload configuration
                                        // eslint-disable-next-line
                                        const bghttp = require("nativescript-background-http");
                                        const session = bghttp.session("image-upload");
                                        const request = {
                                            description: `Uploading ${name}`,
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
                                }).catch((e): void => {
                                    that.alertService.error(`Folgender Fehler ist aufgetreten: ${e}`);
                                });
                            });
                    }).catch((err): void => {
                        that.alertService.error(`Folgender Fehler ist aufgetreten: ${err.message}`);
                    });
            },
            (): void => {
                that.alertService.error("Leider kann AGM-Tools ohne diese\
                Berechtigungen kein Bild versenden. Bitte versuche es erneut!");
            },
        );
    }
    public sendGallery(): void {
        this.toggleAttachmentDialog();
        // eslint-disable-next-line no-alert
        alert("Noch nicht implementiert!");
    }
    public sendAudio(): void {
        this.toggleAttachmentDialog();
        // eslint-disable-next-line no-alert
        alert("Noch nicht implementiert!");
    }
    public sendLocation(): void {
        this.toggleAttachmentDialog();
        geolocation.enableLocationRequest().then((): void => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((l): void => {
                // eslint-disable-next-line no-console
                console.log(l);
            });
        });
    }
    public sendContact(): void {
        this.toggleAttachmentDialog();
        const options = {
            animated: true,
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(ContactPickerComponent, options).then((contact): void => {
            if (contact) {
                dialogs.confirm({
                    cancelButtonText: "Abbrechen",
                    cancelable: true,
                    message: "Soll dieser Kontakt wirklich gesendet werden?",
                    okButtonText: "Senden",
                    title: contact.display_name,
                }).then((result: boolean): void => {
                    const contactToSend = {
                        name: contact.display_name,
                        number: contact.phone[0].number,
                    };
                    if (result) {
                        this.displayAndSendMessage({ contact: contactToSend });
                    }
                });
            }
        });
    }

    public sendMessage(): void {
        if (this.inputMessageField.nativeElement.text && this.inputMessageField.nativeElement.text != "") {
            this.displayAndSendMessage({ content: this.inputMessageField.nativeElement.text });
        }
    }

    public ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.chatId = this.route.snapshot.params.id;
        this.chatType = this.route.snapshot.params.type;
        setTimeout((): void => {
            this.remoteService.get("get", "chats").subscribe((chats): void => {
                [this.chat] = chats.filter((chat: any): boolean => chat.id == this.chatId);
                this.cdr.markForCheck();
                this.getMessages();
            });
        });
    }

    public async videoCall(): Promise<void> {
        if (await confirm(`Möchtest du einen Videoanruf mit ${this.chat.name} starten?`)) {
            this.router.navigate(["call", "user", this.chat.id, "video"]);
        }
    }

    public async audioCall(): Promise<void> {
        if (await confirm(`Möchtest du einen Sprachanruf mit ${this.chat.name} starten?`)) {
            this.router.navigate(["call", "user", this.chat.id, "audio"]);
        }
    }

    public options(): void {
        //
    }

    public getMessages(): void {
        setTimeout((): void => {
            this.remoteService.get("get", `chats/${this.chatType}/${this.chatId}`)
                .subscribe((data): void => {
                    if (data != null) {
                        this.messages.length = 0;
                        this.messages.push(...data);
                        this.cdr.markForCheck();
                    }
                });
        }, 0);
    }

    public getInitials(name: string): string {
        const initials = name.match(/\b\w/g) || [];
        return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
    }

    public goBack(): void {
        this.router.navigate(["chat"], {
            animated: true,
            transition: {
                name: "slideRight",
            },
        });
    }

    public toggleEmojiPicker(): void {
        this.inputMessageField.nativeElement.togglePopup();
    }

    private displayAndSendMessage(options: {
        contact?: { name: any; number: any };
        location?: {lat: number; long: number};
        content?: string;
    }): void {
        let message = {
            chat: null,
            contactSrc: options.contact,
            content: options.content,
            created: Date.now(),
            fromMe: true,
            sendername: "",
            sent: "notsent",
        };
        this.messages.push(message);
        const url = `chats/${this.chat.isUser ? "user" : "project"}/${this.chat.id}${options.content ? "" : "/attachment"}`;
        let o: any = { message: options.content };
        if (options.contact) {
            o.contactName = options.contact.name;
            o.contactNumber = options.contact.number;
        } else if (options.location) {
            o = {
                locationLat: options.location.lat,
                locationLong: options.location.long,
            };
        }
        this.remoteService
            .getNoCache("post", url, o)
            .subscribe((): void => {
                message = this.messages.pop();
                message.sent = "sent";
                this.messages.push(message);
                this.cdr.markForCheck();
                if (options.content) { this.inputMessageField.nativeElement.text = ""; }
            });
    }
}
