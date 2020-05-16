import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import isElectron from "is-electron";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { ElectronService } from "../../_services/electron.service";
import { EnvironmentService } from "../../_services/environment.service";

@Component({
    styleUrls: ["./login.component.scss"],
    templateUrl: "login.component.html",
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    public resetPasswordForm: FormGroup;
    public inputNewPasswordForm: FormGroup;

    public loading = false;

    public submitted = false;
    public rpSubmitted = false;
    public inpSubmitted = false;

    public resetPassword = false;
    public inputNewPassword = false;

    public passwordResetSucceeded = false;
    public inputNewPasswordSucceeded = false;

    public returnUrl: string;

    public isElectron = isElectron();
    public isMaximized = true;

    constructor(
        private title: Title,
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private remoteService: RemoteService,
        private route: ActivatedRoute,
        private electronService: ElectronService,
        private environmentService: EnvironmentService,
    ) {}

    public ngOnInit() {
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(["/"]);
            return;
        }
        this.title.setTitle("AGM-Tools");
        this.loginForm = this.formBuilder.group({
            password: ["", Validators.required],
            username: ["", Validators.required],
        });
        if (this.isElectron) {
            this.loginForm.addControl("serverUrl", new FormControl("", [Validators.required]));
        }
        this.resetPasswordForm = this.formBuilder.group({
            email: ["", [Validators.required, Validators.email]],
        });
        this.inputNewPasswordForm = this.formBuilder.group({
            password1: ["", Validators.required],
            password2: ["", Validators.required],
        });

        this.returnUrl = this.route.snapshot.queryParams.returnUrl || "/";

        if (this.route.snapshot.params.resetPasswordToken) {
            this.inputNewPassword = true;
        }

        this.electronService.setTitle("Login");
        this.isElectron = this.electronService.isElectron;
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }
    get rpf() {
        return this.resetPasswordForm.controls;
    }
    get inpf() {
        return this.inputNewPasswordForm.controls;
    }

    public onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        if (this.isElectron) {
            this.environmentService.loadEnvironment(this.f.serverUrl.value).then(() => {
                this.authenticate();
            }).catch((e) => {
                this.loading = false;
                this.alertService.error("Server couldn't be reached!");
            });
        } else {
            this.authenticate();
        }

    }

    private authenticate() {
        this.authenticationService
            .login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(() => {
                this.router.navigate([this.returnUrl]);
                // this.router.navigate(['dashboard'], { skipLocationChange: false });
                // location.reload();
            }, (error) => {
                this.alertService.error(error);
                this.loading = false;
            });
    }

    public onSubmitResetPassword() {
        this.rpSubmitted = true;

        // stop here if form is invalid
        if (this.resetPasswordForm.invalid) {
            return;
        }

        this.loading = true;
        this.remoteService.getNoCache("get", `auth/passwordReset/${this.rpf.email.value}`).subscribe((data) => {
            this.loading = false;
            if (data.status == true) {
                this.passwordResetSucceeded = true;
            }
        });
    }

    public onSubmitNewPassword() {
        this.rpSubmitted = true;

        // stop here if form is invalid
        if (this.inputNewPasswordForm.invalid) {
            return;
        }

        this.loading = true;
        this.remoteService.getNoCache("post",
            `auth/passwordReset/${this.route.snapshot.params.resetPasswordToken}`, {
                password1: this.inpf.password1.value,
                password2: this.inpf.password2.value,
            }).subscribe((data) => {
            this.loading = false;
            if (data.status == true) {
                this.inputNewPasswordSucceeded = true;
            }
        });
    }

    public minWindow() {
        this.electronService.runIfElectron((_, currentWindow) => {
            currentWindow.minimize();
        });
    }

    public maxWindow() {
        this.isMaximized = !this.isMaximized;
        this.electronService.runIfElectron((_, currentWindow) => {
            if (currentWindow.isMaximized()) {
                currentWindow.unmaximize();
            } else {
                currentWindow.maximize();
            }
        });
    }
    public closeWindow() {
        this.electronService.runIfElectron((_, currentWindow) => {
            currentWindow.hide();
        });
    }
}
