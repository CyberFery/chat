import { Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChatImageData, NewMessageRequest } from '../../model/message.model';
import { FileReaderService } from '../../services/FileReaderService.service';

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

  constructor(private fb: FormBuilder, private fileReader: FileReaderService) {}

  onPublishMessage() {
    // TODO: validate if can send only picture
    if (this.messageForm.valid && this.messageForm.value.msg) {
      this.buildNewMessageRequest(this.messageForm.value.msg, this.file).then(
        (newMessageRequest) => {
          this.newMessage.emit(newMessageRequest);

          this.messageForm.reset();
        }
      );
    }
  }

  private async buildNewMessageRequest(
    msg: string,
    file: File | null
  ): Promise<NewMessageRequest> {
    const newMessageRequest: NewMessageRequest = {
      text: msg,
      username: 'username',
      imageData: null,
    };

    if (file != null) {
      const imageData: ChatImageData = await this.fileReader.readFile(file);
      newMessageRequest.imageData = imageData;
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
