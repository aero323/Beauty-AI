import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, RotateCcw, Send, User } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

export type PlaygroundMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

interface ConversationPlaygroundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  seedKey: string;
  initialMessages: PlaygroundMessage[];
  generateReply: (input: string, history: PlaygroundMessage[]) => string;
  rightPane: React.ReactNode;
}

export function ConversationPlaygroundDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  seedKey,
  initialMessages,
  generateReply,
  rightPane,
}: ConversationPlaygroundDialogProps) {
  const [messages, setMessages] = useState<PlaygroundMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const replyTimerRef = useRef<number | null>(null);

  const clearReplyTimer = () => {
    if (replyTimerRef.current) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
  };

  const resetConversation = () => {
    clearReplyTimer();
    setMessages(initialMessages);
    setInput('');
    setTyping(false);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: PlaygroundMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
    };
    const reply = generateReply(text, [...messages, userMessage]);

    clearReplyTimer();
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTyping(true);

    replyTimerRef.current = window.setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: reply,
      }]);
      setTyping(false);
      replyTimerRef.current = null;
    }, 650);
  };

  useEffect(() => {
    if (open) {
      resetConversation();
    } else {
      clearReplyTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seedKey]);

  useEffect(() => () => clearReplyTimer(), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1120px] h-[85vh] p-0 overflow-hidden bg-[#FCFAF8]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#E5DED8] bg-white px-6 py-4">
            <div>
              <DialogTitle className="text-lg font-bold text-[#242124]">{title}</DialogTitle>
              {subtitle ? <p className="mt-1 text-xs text-[#766F73]">{subtitle}</p> : null}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DED8] bg-[#F8F5F3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9396]">
              <MessageSquare className="h-3.5 w-3.5" />
              预览
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
            <div className="flex min-h-0 flex-col border-r border-[#E5DED8] bg-[#FDFBFA]">
              <div className="flex items-center justify-between border-b border-[#E5DED8] bg-white px-6 py-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#9A9396]">聊天记录</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetConversation}
                  className="border-[#E5DED8] bg-white text-[#3F3A3D] hover:bg-[#F8F5F3]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>重置对话</span>
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] items-end gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'user' ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border border-[#E5DED8]'}`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === 'user' ? 'bg-rose-600 text-white rounded-br-md' : 'border border-[#E5DED8] bg-white text-[#242124] rounded-bl-md'}`}>
                          <p data-i18n-skip="true" className="whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-rose-600 border border-[#E5DED8]">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl rounded-bl-md border border-[#E5DED8] bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#C9C1C4] animate-bounce [animation-delay:-0.2s]" />
                            <span className="h-2 w-2 rounded-full bg-[#C9C1C4] animate-bounce [animation-delay:-0.1s]" />
                            <span className="h-2 w-2 rounded-full bg-[#C9C1C4] animate-bounce" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E5DED8] bg-white p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="输入消息..."
                    className="min-h-[56px] flex-1 resize-none rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-[#9A9396] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                  />
                  <Button
                    onClick={sendMessage}
                    className="h-10 bg-rose-600 px-4 text-white hover:bg-rose-700"
                  >
                    <Send className="h-4 w-4" />
                    <span>发送</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto bg-[#F8F5F3] px-5 py-5">
              {rightPane}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
