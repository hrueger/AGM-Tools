import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ClientsoftwareComponent } from "./clientsoftware.component";

describe("ClientsoftwareComponent", () => {
  let component: ClientsoftwareComponent;
  let fixture: ComponentFixture<ClientsoftwareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientsoftwareComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsoftwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
