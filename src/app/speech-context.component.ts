import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { SpeechAnalysisService } from './speech-analysis.service';

@Component({
  selector: 'app-speech-context',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card w-full max-w-md mx-auto p-6 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold text-center mb-6">
        Speech Context Analyzer
      </h2>

      <div class="flex justify-center mb-4">
        <button
          (click)="toggleListening()"
          [class]="
            'w-16 h-16 rounded-full flex items-center justify-center ' +
            (isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600')
          "
        >
          <i class="material-icons text-white text-2xl">
            {{ isListening ? 'mic_off' : 'mic' }}
          </i>
        </button>
      </div>

      <div *ngIf="error" class="text-red-500 text-center text-sm mb-4">
        {{ error }}
      </div>

      <div *ngIf="contextWords.length > 0" class="text-center space-y-2">
        <div class="font-semibold">Context Keywords:</div>
        <div class="flex gap-2 justify-center flex-wrap">
          <span
            *ngFor="let word of contextWords"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
          >
            {{ word }}
          </span>
        </div>
      </div>

      <div *ngIf="isProcessing" class="text-center mt-4">
        Processing speech...
      </div>
    </div>
  `,
})
export class SpeechContextComponent implements OnInit, OnDestroy {
  private recognition: any;
  isListening = false;
  isProcessing = false;
  error = '';
  contextWords: string[] = [];
  private destroyed$ = new BehaviorSubject<boolean>(false);

  constructor(private speechAnalysisService: SpeechAnalysisService) {}

  ngOnInit() {
    this.initializeSpeechRecognition();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private initializeSpeechRecognition() {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'zh-CN';

      this.recognition.onresult = async (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;

        this.isProcessing = true;
        try {
          this.contextWords = await this.speechAnalysisService.analyzeContext(
            transcript
          );
        } catch (err) {
          this.error = 'Error analyzing speech';
        } finally {
          this.isProcessing = false;
        }
      };

      this.recognition.onerror = (event: any) => {
        this.error = `Error: ${event.error}`;
        this.isListening = false;
      };
    } catch (err) {
      this.error = 'Speech recognition not supported in this browser';
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.error = '';
      } catch (err) {
        this.error = 'Error starting speech recognition';
        this.isListening = false;
      }
    }
  }

  private stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
