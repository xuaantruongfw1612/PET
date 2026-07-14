import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useAppContext } from '../store';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'user' | 'bot', text: string}[]>([
    { sender: 'bot', text: 'Xin chào! PetCare có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const { currentUser } = useAppContext();

  if (currentUser && currentUser.role !== 'customer') return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Cảm ơn bạn đã liên hệ! Nhân viên tư vấn của chúng tôi sẽ phản hồi trong giây lát.' }]);
    }, 1000);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-xl border border-orange-100 z-50 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
            <div className="font-bold text-sm uppercase tracking-wider">Hỗ trợ trực tuyến</div>
            <button onClick={() => setIsOpen(false)} className="hover:text-orange-200"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-sm \${msg.sender === 'user' ? 'bg-orange-500 text-white self-end rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 self-start rounded-tl-sm'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            {!currentUser ? (
              <div className="text-center py-2 text-xs text-orange-500 font-bold uppercase tracking-wider">
                Vui lòng <a href="/login" className="underline">Đăng nhập</a> để chat
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-orange-400"
                />
                <button type="submit" className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
