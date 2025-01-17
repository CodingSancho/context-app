import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechContextComponent } from './speech-context.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpeechContextComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'context-app';
}
