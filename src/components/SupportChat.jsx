import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser, FaTicketAlt, FaAngleRight } from 'react-icons/fa';
import api from '../api/api';

const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 0, text: "Hi there! I'm your Smart CX Virtual Assistant. How can I help you today?", sender: 'bot', timestamp: new Date().toISOString() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [tickets, setTickets] = useState([]);
    const [view, setView] = useState('chat'); // 'chat' or 'tickets'
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const { accountId } = useSelector((state) => state.account);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (tickets.length === 0 && view === 'tickets') {
                fetchTickets();
            }
        }
    }, [messages, isOpen, view]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/utility/support/tickets');
            setTickets(res.data.tickets || []);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            // mock fallback
            setTickets([
                { id: 'TKT-8902', subject: 'Billing Dispute', status: 'In Progress', date: new Date().toISOString() },
                { id: 'TKT-8211', subject: 'Change Mailing Address', status: 'Closed', date: new Date(Date.now() - 86400000 * 5).toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue.trim(),
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setLoading(true);

        try {
            // Mock delay to simulate typing
            setTimeout(async () => {
                try {
                    const res = await api.post('/utility/support/chat', {
                        accountId,
                        message: newUserMessage.text,
                        history: messages.map(m => ({ role: m.sender, content: m.text }))
                    });

                    setMessages((prev) => [...prev, {
                        id: Date.now() + 1,
                        text: res.data.reply || "I've received your message. A representative will get back to you.",
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    }]);
                } catch (error) {
                    setMessages((prev) => [...prev, {
                        id: Date.now() + 1,
                        text: "I'm having trouble connecting to the support server right now. If this is an emergency, please call 1-800-SMART-CX.",
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    }]);
                } finally {
                    setLoading(false);
                }
            }, 1000);

        } catch (error) {
            console.error('Error sending message:', error);
            setLoading(false);
        }
    };

    const handleSwitchView = (newView) => {
        setView(newView);
        if (newView === 'tickets' && tickets.length === 0) {
            fetchTickets();
        }
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="support-chat-container">
            {/* FAB Button */}
            {!isOpen && (
                <button className="chat-fab-btn" onClick={toggleChat} aria-label="Open support chat">
                    <FaCommentDots />
                </button>
            )}

            {/* Chat Window */}
            <div className={`chat-window ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <div className="header-info">
                        <FaRobot className="bot-icon" />
                        <div>
                            <h4>Support Assistant</h4>
                            <span className="status-indicator"></span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={toggleChat}>
                        <FaTimes />
                    </button>
                </div>

                <div className="chat-nav">
                    <button
                        className={`nav-btn ${view === 'chat' ? 'active' : ''}`}
                        onClick={() => handleSwitchView('chat')}
                    >
                        Live Chat
                    </button>
                    <button
                        className={`nav-btn ${view === 'tickets' ? 'active' : ''}`}
                        onClick={() => handleSwitchView('tickets')}
                    >
                        My Tickets
                    </button>
                </div>

                <div className="chat-body">
                    {view === 'chat' ? (
                        <div className="messages-container">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                                    {msg.sender === 'bot' && <div className="avatar bot"><FaRobot /></div>}
                                    <div className={`message-bubble ${msg.sender}`}>
                                        <p>{msg.text}</p>
                                        <span className="msg-time">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    {msg.sender === 'user' && <div className="avatar user"><FaUser /></div>}
                                </div>
                            ))}
                            {loading && (
                                <div className="message-bubble-wrapper bot typing-indicator">
                                    <div className="avatar bot"><FaRobot /></div>
                                    <div className="message-bubble bot">
                                        <div className="dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="tickets-container">
                            {loading && tickets.length === 0 ? (
                                <div className="tickets-loading">Loading recent tickets...</div>
                            ) : tickets.length > 0 ? (
                                <ul className="tickets-list">
                                    {tickets.map(ticket => (
                                        <li key={ticket.id} className="ticket-item">
                                            <div className="ticket-header">
                                                <FaTicketAlt className="ticket-icon" />
                                                <strong>{ticket.id}</strong>
                                                <span className={`ticket-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <div className="ticket-subject">{ticket.subject}</div>
                                            <div className="ticket-meta">
                                                <span>Opened: {new Date(ticket.date).toLocaleDateString()}</span>
                                                <FaAngleRight />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-tickets">
                                    <FaTicketAlt style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.5rem' }} />
                                    <p>You don't have any recent support tickets.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {view === 'chat' && (
                    <div className="chat-footer">
                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" className="send-btn" disabled={!inputValue.trim() || loading}>
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportChat;
