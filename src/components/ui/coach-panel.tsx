import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  type: 'coach' | 'user';
  content: string;
}

interface CoachPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachPanel({ open, onOpenChange }: CoachPanelProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'coach',
      content: 'Welcome to StartupDetective! I\'m here to guide you through validating your startup ideas. What brings you here today?'
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate coach response
    setTimeout(() => {
      const coachResponse: Message = {
        id: Date.now() + 1,
        type: 'coach',
        content: 'That\'s a great question! Let me help you think through that systematically...'
      };
      setMessages(prev => [...prev, coachResponse]);
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Panel */}
      <div className="w-[440px] bg-card border-l border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-section-head">AI Coach</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Lesson Content */}
        <div className="p-6 border-b border-border">
          <h3 className="font-medium mb-3">Current Lesson: Problem Validation</h3>
          <div className="text-subtle text-sm space-y-2">
            <p>Before building anything, validate that your problem is worth solving:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Talk to potential customers</li>
              <li>Understand their current solutions</li>
              <li>Identify pain points and frustrations</li>
            </ul>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[280px] rounded px-3 py-2 text-sm ${
                  msg.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-muted text-foreground mr-8'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-6 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Ask your coach..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm" className="px-3">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}