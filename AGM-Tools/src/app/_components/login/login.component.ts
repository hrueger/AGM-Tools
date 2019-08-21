import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { DashboardComponent } from "../dashboard/dashboard.component";

@Component({
    styleUrls: ["./login.component.scss"],
    templateUrl: "login.component.html",
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    public loading = false;
    public submitted = false;
    public returnUrl: string;

    constructor(
        private title: Title,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
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

        // get return url from route parameters or default to '/'
        // this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
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
                    // this.router.navigate([this.returnUrl]);
                    // this.router.navigate(['dashboard'], { skipLocationChange: false });
                    location.reload();
                },
                (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                },
            );
    }
}
