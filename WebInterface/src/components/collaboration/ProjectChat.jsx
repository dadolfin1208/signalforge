import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ProjectChat({ projectId, currentUser }) {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['project-chat', projectId],
    queryFn: async () => {
      const msgs = await base44.entities.ProjectChat.filter(
        { project_id: projectId },
        '-created_date',
        50
      );
      return msgs.reverse();
    },
    refetchInterval: 2000,
    enabled: isOpen
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText) => {
      return await base44.entities.ProjectChat.create({
        project_id: projectId,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        message: messageText,
        message_type: 'text'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-chat', projectId] });
      setMessage('');
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync(message);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-40 w-96"
          >
            <Card className="bg-slate-900 border-slate-700 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-400" />
                  Team Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96 px-4" ref={scrollRef}>
                  <div className="space-y-3 py-2">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.user_email === currentUser.email;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-400">
                                  {isOwn ? 'You' : msg.user_name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatTime(msg.created_date)}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg px-3 py-2 ${
                                  isOwn
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-200'
                                }`}
                              >
                                <p className="text-sm">{msg.message}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSend} className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-slate-800 border-slate-700 text-white"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}