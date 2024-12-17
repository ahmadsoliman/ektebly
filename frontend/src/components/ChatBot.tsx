import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  sessionId: string;
  initialMessages: Message[];
}

export default function ChatBot({ sessionId, initialMessages }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
    chatbotEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/chat/message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(data.messages);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='flex flex-col h-[500px] bg-white rounded-lg shadow-sm border border-gray-100'>
      <div className='p-4 border-b border-gray-100'>
        <h3 className='text-lg font-semibold'>Chat Assistant</h3>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className='whitespace-pre-wrap'>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className='p-4 border-t border-gray-100'>
        <div className='flex space-x-2'>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Type your message...'
            className='flex-1 min-h-[44px] max-h-32 p-2 border border-gray-200 rounded-md resize-y'
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className={`px-4 rounded-md ${
              isLoading || !input.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <Send className='h-5 w-5' />
          </button>
        </div>
      </div>
      <div ref={chatbotEndRef} />
    </div>
  );
}
