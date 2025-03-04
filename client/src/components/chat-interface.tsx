import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
  text: string;
  sender: 'user' | 'system';
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome! I can help you discover landmarks. Try asking about landmarks in the current view.", sender: 'system' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputText, sender: 'user' }]);

    // TODO: Process the message and interact with landmarks
    // For now, just send a mock response
    setMessages(prev => [...prev, { 
      text: "I understand you're interested in landmarks. The functionality to process your request is coming soon!", 
      sender: 'system' 
    }]);

    setInputText('');
  };

  return (
    <div className="h-full flex flex-col p-4">
      <ScrollArea className="flex-grow mb-4">
        <div className="space-y-4 pr-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-muted text-muted-foreground mr-8'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button 
          size="icon"
          onClick={handleSendMessage}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};