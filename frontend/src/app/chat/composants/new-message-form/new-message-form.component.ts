import { Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChatImageData, NewMessageRequest } from '../../model/message.model';

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
  newMessage = output<NewMessageRequest>();

  messageForm = this.fb.group({
    msg: ['', [Validators.required]],
  });

  file: File | null = null;

  constructor(private fb: FormBuilder) {}

  onPublishMessage() {
    if (this.messageForm.valid && this.messageForm.value.msg) {
      let newMessageRequest: NewMessageRequest = this.buildNewMessageRequest(
        this.messageForm.value.msg
      );

      this.newMessage.emit(newMessageRequest);
    }

    this.messageForm.reset();
  }

  private buildNewMessageRequest(msg: string): NewMessageRequest {
    const newMessageRequest: NewMessageRequest = {
      text: msg,
      username: 'username',
      imageData: null,
    };

    if (this.hasImage) {
      const reader = new FileReader();
      reader.readAsDataURL(this.file!);

      reader.onload = () => {
        const imageData: ChatImageData = {
          data: reader.result as string,
          type: this.file!.type,
        };

        newMessageRequest.imageData = imageData;
      };
    }

    return newMessageRequest;
  }

  get hasImage() {
    return this.file != null;
  }

  fileChanged(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file = input.files ? input.files[0] : null;
  }
}
