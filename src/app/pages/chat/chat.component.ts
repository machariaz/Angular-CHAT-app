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
import { map, switchMap } from 'rxjs/operators';
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
            user.name.toLowerCase().includes(searchText.toLowerCase())
          )
        )
      )
    );
  }

  async loadUsers() {
    try {
      this.users = await this.chat_service.getUsers();
    } catch (err:any) {
      alert(err.message);
    }
  }

  async logOut() {
    this.auth
      .signOut()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  onSubmit() {
    const formValue = this.chatForm.value.chat_message;
    console.log(formValue);

    this.chat_service.chatMessage(formValue)
      .then((res) => {
        console.log(res);
        this.chatForm.reset();
        this.onListChat();
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  onListChat() {
    this.chat_service
      .listChat()
      .then((res: Ichat[] | null) => {
        console.log(res);
        if (res !== null) {
          this.chats.set(res);
        } else {
          console.log('No messages Found');
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  openDropDown(msg: Ichat) {
    console.log(msg);
    this.chat_service.selectedChats(msg);
  }
}
