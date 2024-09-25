import React, { useEffect, useState, useRef } from 'react';
import './MessageContainer.css';

const MessageContainer = ({ messages, senderEmail }) => {
    const messageEndRef = useRef(null);

    useEffect(() => {
        // console.log("MessageContainer");
        // console.log(senderEmail);
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView(); //{ behavior: 'smooth' }
        }
    }, [messages]);

    return (
        <div className="message-container">
            {messages.map((message, index) => (
                <div 
                    key={index} 
                    className={`message ${message.nickname === senderEmail ? 'user' : 'other'}`}
                >
                    <strong>{message.nickname === senderEmail ? 'Вы' : message.nickname}</strong>
                    {/* {message.email === 'admin@mail.com' && <div className="admin">Admin</div>} */}
                    <div className='content'>{message.content}</div>
                    <time>{new Date(message.time).toLocaleTimeString([], {timeStyle: 'short'})}</time>
                </div>
            ))}
            <div ref={messageEndRef} />
        </div>
    );
};

export default MessageContainer;
