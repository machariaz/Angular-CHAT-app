import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../supabase/chat.service';
import { Ichat } from '../../interface/chat-response';
import { DatePipe, CommonModule } from '@angular/common';
import { DeleteModalComponent } from '../../layout/delete-modal/delete-modal.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DeleteModalComponent, CommonModule, PickerModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  private auth = inject(AuthService);
  private chat_service = inject(ChatService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  chats = signal<Ichat[]>([]);

  chats$!: Observable<Ichat[]>;
  chatForm!: FormGroup;
  currentUser: any;
  users: any[] = [];
  filteredUsers$!: Observable<any[]>;
  private searchSubject = new BehaviorSubject<string>('');
  selectedMember: any;
  emojiPickerVisible = false;
  errorMessage: string | null = null; // Initialize errorMessage here

  constructor() {
    this.chatForm = this.fb.group({
      chat_message: ['', Validators.required],
    });

    this.currentUser = this.auth.getCurrentUser();
    this.chats$ = toObservable(this.chats);

    effect(() => {
      this.onListChat();
    });

    this.loadUsers();

    this.filteredUsers$ = this.searchSubject.pipe(
      switchMap((searchText) =>
        this.chat_service.getUsers().then((users) =>
          users.filter((user) =>
            user.full_name.toLowerCase().includes(searchText.toLowerCase())
          )
        )
      )
    );
  }

  async loadUsers() {
    try {
      // Fetch the list of users from the service
      this.users = await this.chat_service.getUsers();
      
      console.log(this.users);
  
      // Ensure currentUser is defined before filtering
      if (this.currentUser && this.currentUser.id) {
        // Filter out the current user from the list
        this.users = this.users.filter(user => user.id !== this.currentUser.id);
      } else {
        console.error('Current user is not defined.');
      }
    } catch (err: any) {
      console.error('Error loading users:', err.message);
      this.errorMessage = 'Failed to load users.';
    }
  }
  formatTime(time: string): string {
    // Split time and only return hours and minutes
    return time ? time.slice(0, 5) : '';
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  onSelectMember(member: any): void {
    this.selectedMember = member;
    this.onListChat(); // Fetch chats for the selected member
  }

  onSubmit() {
    const formValue = this.chatForm.value.chat_message;
    if (this.selectedMember) {
      this.chat_service.chatMessage(formValue, this.selectedMember.id)
        .then(() => {
          this.chatForm.reset();
          this.onListChat();
        })
        .catch((err) => {
          this.errorMessage = 'Failed to send message.';
        });
    }
  }

  onListChat() {
    if (this.selectedMember) {
      this.chat_service
        .listChat(this.selectedMember.id)
        .then((res: Ichat[] | null) => {
          if (res !== null) {
            this.chats.set(res);
          } else {
            console.log('No messages Found');
          }
        })
        .catch((err) => {
          this.errorMessage = 'Failed to load chat messages.';
        });
    }
  }

  openDropDown(msg: Ichat) {
    this.chat_service.selectedChats(msg);
  }

  toggleEmojiPicker() {
    this.emojiPickerVisible = !this.emojiPickerVisible;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const currentMessage = this.chatForm.value.chat_message;
    this.chatForm.patchValue({ chat_message: currentMessage + emoji });
    this.toggleEmojiPicker(); // Hide picker after selecting emoji
  }
}
