
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChat } from '../services/geminiService';
import type { Message } from '../types';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import type { Chat } from '@google/genai';

export const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! How can I help with your gardening today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = createChat();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }
            const stream = await chatRef.current.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);
    
    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><Icon name="sparkles" className="w-5 h-5 text-green-900"/></div>}
                        <div className={`px-4 py-3 rounded-2xl max-w-sm md:max-w-md ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                           <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length-1].role === 'user' && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><Icon name="sparkles" className="w-5 h-5 text-green-900"/></div>
                        <div className="px-4 py-3 rounded-2xl bg-gray-700 rounded-bl-none flex items-center">
                            <LoadingSpinner className="w-5 h-5" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a gardening question..."
                    disabled={isLoading}
                    className="flex-1 p-3 bg-gray-700 rounded-full border border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-green-600 rounded-full hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                    <Icon name="send" className="w-6 h-6 text-white" />
                </button>
            </form>
        </div>
    );
};
