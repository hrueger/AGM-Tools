import { Component, OnInit } from '@angular/core';
import { NavbarService } from '~/app/_services/navbar.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  constructor(private NavbarService: NavbarService) { }

  ngOnInit() {
    this.NavbarService.setHeadline("Files");
    //console.log("Headline change requested");
  }

}
