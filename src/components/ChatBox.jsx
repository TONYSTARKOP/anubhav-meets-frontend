import React, { useState } from "react";

const ChatBox = ({ messages, onSend }) => {
    const [text, setText] = useState("");

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText("");
        }
    };

    return (
        <div>
            <h3>Chat</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default ChatBox;
