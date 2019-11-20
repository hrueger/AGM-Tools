import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";

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

    public resetPassword: boolean = false;
    public inputNewPassword: boolean = false;

    public passwordResetSucceeded: boolean = false;
    public inputNewPasswordSucceeded: boolean = false;

    public returnUrl: string;

    constructor(
        private title: Title,
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private remoteService: RemoteService,
        private route: ActivatedRoute,
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(["/"]);
        }
    }

    public ngOnInit() {
        this.title.setTitle("AGM-Tools | Login");
        this.loginForm = this.formBuilder.group({
            password: ["", Validators.required],
            username: ["", Validators.required],
        });
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
        this.authenticationService
            .login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data) => {
                    this.router.navigate([this.returnUrl]);
                    // this.router.navigate(['dashboard'], { skipLocationChange: false });
                    // location.reload();
                },
                (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                },
            );
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
}
