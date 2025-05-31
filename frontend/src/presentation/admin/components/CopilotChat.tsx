'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/presentation/shared/ui/card';
import { Input } from '@/presentation/shared/ui/input';
import { Button } from '@/presentation/shared/ui/button';
import { ScrollArea } from '@/presentation/shared/ui/scroll-area';
import { Send, Bot, User, Sparkles, Wand2 } from 'lucide-react';
import { llmService, type LLMContext } from '@/lib/llm-service';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  error?: string;
}

interface CopilotChatProps {
  context?: LLMContext;
}

export default function CopilotChat({ context }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await llmService.sendMessage(input, context);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        error: response.error,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        error: 'Failed to get response',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: 'improve' | 'suggest' | 'generate') => {
    if (!context?.selectedProject) return;

    setIsLoading(true);
    try {
      let response;
      switch (action) {
        case 'improve':
          response = await llmService.improveContent(
            context.selectedProject.description,
            'project'
          );
          break;
        case 'suggest':
          response = await llmService.suggestTechnologies(context.selectedProject);
          break;
        case 'generate':
          response = await llmService.generateProjectDescription(context.selectedProject);
          break;
      }

      if (response) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: response.content,
          role: 'assistant',
          timestamp: new Date(),
          error: response.error,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        error: 'Failed to perform action',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      {context?.selectedProject && (
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('improve')}
              disabled={isLoading}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Improve Content
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('suggest')}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Suggest Tech
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('generate')}
              disabled={isLoading}
            >
              <Bot className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.error
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-5 h-5 mt-1" />
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <User className="w-5 h-5 mt-1" />
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 