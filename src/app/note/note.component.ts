import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgbModal],
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NotesComponent implements OnInit {
  notes: {
    key: string; id: number; title: string; description: string; 
  }[] = [];
  nextId = 1;
  currentNote: { title: string; description: string; key?: string } = { title: '', description: '' };

  constructor(private http: HttpClient, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.http.get<{ [key: string]: { title: string; description: string; } }>('https://notes-386f7-default-rtdb.firebaseio.com/notes.json')
      .subscribe(data => {
        this.notes = Object.keys(data).map(key => ({ id: this.nextId++, key, ...data[key] }));
      });
  }

  openAddNoteModal(content: any): void {
    this.currentNote = { title: '', description: '' };
    this.modalService.open(content);
  }

  openEditNoteModal(content: any, note: any): void {
    this.currentNote = { ...note };
    this.modalService.open(content);
  }

  addNote(): void {
    const newNote = { title: this.currentNote.title, description: this.currentNote.description };
    this.http.post<{ name: string }>('https://notes-386f7-default-rtdb.firebaseio.com/notes.json', newNote)
      .subscribe(res => {
        this.currentNote.key = res.name;
        this.notes.push({ ...newNote, id: this.nextId++, key: res.name });
        this.modalService.dismissAll();
      });
  }

  updateNote(): void {
    const { key, ...note } = this.currentNote;
    if (key) {
      this.http.put(`https://notes-386f7-default-rtdb.firebaseio.com/notes/${key}.json`, note)
        .subscribe(() => {
          const index = this.notes.findIndex(n => n.key === key);
          if (index !== -1) {
            this.notes[index] = { ...note, id: this.notes[index].id, key };
          }
          this.modalService.dismissAll();
        });
    } else {
      console.error('Note key is missing');
    }
  }
  

  deleteNote(key: string): void {
    this.http.delete(`https://notes-386f7-default-rtdb.firebaseio.com/notes/${key}.json`)
      .subscribe(() => {
        this.notes = this.notes.filter(note => note.key !== key);
      });
  }
}
