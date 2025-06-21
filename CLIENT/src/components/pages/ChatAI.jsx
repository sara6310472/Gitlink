import { useState, useRef, useEffect } from 'react';
import '../../style/ChatAI.css';

const ChatAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello! How can I help you today?', sender: 'gpt', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);

        try {
            // קריאה לשרת שלך במקום ישירות ל-OpenAI
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentInput
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const gptMessage = {
                id: Date.now() + 1,
                text: data.message,
                sender: 'gpt',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, gptMessage]);
        } catch (error) {
            console.error('Error calling chat API:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'gpt',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // שאר הקוד נשאר אותו דבר...
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="gpt-chat-widget">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="chat-toggle-btn"
                    aria-label="Open chat"
                >
                    💬
                    <span className="chat-notification">1</span>
                </button>
            )}

            {isOpen && (
                <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
                    <div className="chat-header">
                        <div className="chat-title">
                            <div className="status-indicator"></div>
                            <h3>GPT Assistant</h3>
                        </div>
                        <div className="chat-controls">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="control-btn"
                                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                {isMinimized ? '🔲' : '➖'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="control-btn close-btn"
                                aria-label="Close chat"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            <div className="messages-container">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.sender === 'user' ? 'user-message' : 'gpt-message'}`}
                                    >
                                        <div className="message-bubble">
                                            <p>{message.text}</p>
                                            <span className="message-time">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="message gpt-message">
                                        <div className="message-bubble loading">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="input-container">
                                <div className="input-wrapper">
                                    <textarea
                                        ref={inputRef}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="message-input"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputText.trim() || isLoading}
                                        className="send-btn"
                                        aria-label="Send message"
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatAI;