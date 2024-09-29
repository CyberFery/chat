import { Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-message-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-message-form.component.html',
  styleUrl: './new-message-form.component.css',
})
export class NewMessageFormComponent {
  newMessage = output<string>();

  messageForm = this.fb.group({
    msg: '',
  });

  constructor(private fb: FormBuilder) {}

  onPublishMessage() {
    if (this.messageForm.valid && this.messageForm.value.msg) {
      this.newMessage.emit(this.messageForm.value.msg);
    }

    this.messageForm.reset();
  }
}
