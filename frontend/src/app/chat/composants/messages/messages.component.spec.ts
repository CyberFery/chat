import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessagesComponent } from './messages.component';
import { ComponentRef } from '@angular/core';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let componentRef: ComponentRef<MessagesComponent>;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;
    componentRef.setInput('messages', []);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
