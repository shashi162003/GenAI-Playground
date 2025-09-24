import { useState } from 'react';
import { sendChatMessage } from '../services/api';
import './Chat.css';

const Chat = ({ persona, onBack }) => {
    const [history, setHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage = {
            role: 'user',
            parts: [{ text: userInput }],
        };

        const updatedHistory = [...history, newUserMessage];
        setHistory(updatedHistory);
        setUserInput('');
        setIsLoading(true);

        const { response } = await sendChatMessage(persona.id, updatedHistory);

        const newAiMessage = {
            role: 'model',
            parts: [{ text: response }],
        };

        setHistory(prevHistory => [...prevHistory, newAiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button className="back-button" onClick={onBack}>&larr;</button>
                <img src={persona.avatar} alt={persona.name} className="chat-avatar" />
                <div className="chat-persona-info">
                    <h2>{persona.name}</h2>
                    <p>{persona.title}</p>
                </div>
            </header>

            <main className="message-list">
                {history.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.role}`}>
                        <p>{msg.parts[0].text}</p>
                    </div>
                ))}
                {isLoading && (
                    <div className="message-bubble model loading">
                        <div className="dot-flashing"></div>
                    </div>
                )}
            </main>

            <form className="message-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>Send</button>
            </form>
        </div>
    );
};

export default Chat;