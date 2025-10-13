import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from './ui';
import api from '../api';
import { toast } from 'react-toastify';

export default function ChatModal({ item, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [item._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/item/${item._id}`);
      setMessages(res.data.messages);
      if (loading) setLoading(false);
    } catch (err) {
      if (loading) {
        toast.error('Failed to load messages');
        setLoading(false);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/chat/item/${item._id}/message`, {
        content: newMessage
      });
      setMessages(res.data.messages);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Chat about {item.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="flex flex-col">
                  <div className="text-xs text-gray-500 mb-1">{message.sender.name}</div>
                  <div className="bg-gray-100 rounded-lg p-3 inline-block max-w-[80%]">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="mt-4 flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" loading={sending}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
