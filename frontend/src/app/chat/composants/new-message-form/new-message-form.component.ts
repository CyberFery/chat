import { Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-new-message-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
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
