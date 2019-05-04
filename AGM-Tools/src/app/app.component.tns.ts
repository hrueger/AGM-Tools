import { Component, ElementRef } from '@angular/core';
import { User } from './_models/user';
import { Router } from '@angular/router';
import { AuthenticationService } from './_services/authentication.service';
import { OnInit, ViewChild } from "@angular/core";
import * as app from "tns-core-modules/application";
import { RouterExtensions } from "nativescript-angular/router";
import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _sideDrawerTransition: DrawerTransitionBase;
  @ViewChild("rsd") rSideDrawer: ElementRef;
  currentUser: User;
  username = "";
  useremail = "";
  

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe(
      x => {
        this.currentUser = x;
        this.useremail = "Email";
        this.username = x.firstName + " " + x.lastName
      }
    );
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(["/login"]);
    
  }
  ngOnInit() {
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }
  get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition;
  }
  onDrawerButtonTap(): void {
    this.rSideDrawer.nativeElement.toggleDrawerState();
  }
}
