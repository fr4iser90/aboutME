import { config } from './config';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class AiClient {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.aiApiKey || '',
    };
  }

  public async generateContent(prompt: string, context: any = {}): Promise<ApiResponse<string>> {
    const url = `${config.aiBaseUrl}${config.endpoints.llm.generateContent(config.aiModel)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: this.buildPrompt(prompt, context)
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });
    if (!response.ok) {
      throw new Error('AI request failed');
    }
    const data = await response.json();
    return {
      data: data.candidates[0].content.parts[0].text,
      status: response.status,
    };
  }

  private buildPrompt(message: string, context: any): string {
    let prompt = message;
    if (context.selectedProject) {
      prompt = `Project Context:\nTitle: ${context.selectedProject.title}\nDescription: ${context.selectedProject.description}\nTechnologies: ${context.selectedProject.technologies.join(', ')}\n\nUser Message: ${message}`;
    }
    if (context.currentTab) {
      prompt = `Current Section: ${context.currentTab}\n${prompt}`;
    }
    return prompt;
  }
}

export const aiClient = new AiClient(); 