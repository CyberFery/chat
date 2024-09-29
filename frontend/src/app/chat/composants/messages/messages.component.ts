import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import { Message } from '../../model/message.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages = input.required<Message[]>();

  constructor() {
    effect(() => {
      this.messages();
      this.scrollToBottom();
    });
  }

  /** Afficher la date seulement si la date du message précédent est différente du message courant. */
  showDateHeader(messages: Message[] | null, i: number) {
    if (messages != null) {
      if (i === 0) {
        return true;
      } else {
        const prev = new Date(messages[i - 1].timestamp).setHours(0, 0, 0, 0);
        const curr = new Date(messages[i].timestamp).setHours(0, 0, 0, 0);

        return prev != curr;
      }
    }

    return false;
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
