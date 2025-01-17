// speech-analysis.service.ts
import { Injectable } from '@angular/core';
import { pipeline } from '@xenova/transformers';

@Injectable({
  providedIn: 'root',
})
export class SpeechAnalysisService {
  private classifier: any = null;
  private readonly CANDIDATE_LABELS = [
    'business',
    'family',
    'education',
    'entertainment',
    'technology',
    'health',
    'politics',
    'sports',
    'food',
    'travel',
    'shopping',
    'music',
    'science',
    'art',
    'weather',
    'transportation',
  ];

  constructor() {
    this.initializeClassifier();
  }

  private async initializeClassifier() {
    try {
      // Initialize the multilingual classifier
      this.classifier = await pipeline(
        'zero-shot-classification',
        'Xenova/mbert-large-mnli'
      );
    } catch (error) {
      console.error('Failed to load classifier:', error);
    }
  }

  async analyzeContext(transcript: string): Promise<string[]> {
    if (!this.classifier) {
      await this.initializeClassifier();
    }

    try {
      const result = await this.classifier(transcript, this.CANDIDATE_LABELS);
      // Get top 3 labels with highest scores
      return result.labels.slice(0, 3);
    } catch (error) {
      console.error('Classification error:', error);
      return ['error', 'analyzing', 'text'];
    }
  }
}
