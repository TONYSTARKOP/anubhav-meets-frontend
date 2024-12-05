import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import VideoTile from "./components/VideoTile";
import ChatBox from "./components/ChatBox";
import MiniGames from "./components/MiniGames";

const App = () => {
    const [roomId, setRoomId] = useState(null);
    const [name, setName] = useState("");
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const videoRef = useRef();
    const peers = useRef({});
    const socket = useRef();

    useEffect(() => {
        socket.current = io();

        socket.current.on("room-created", (id) => {
            setRoomId(id);
        });

        socket.current.on("user-joined", (user) => {
            console.log("User joined:", user);
        });

        socket.current.on("signal", (data) => {
            if (data.type === "offer") {
                // Handle WebRTC offer
            } else if (data.type === "answer") {
                // Handle WebRTC answer
            }
        });

        socket.current.on("chat-message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => socket.current.disconnect();
    }, []);

    const createRoom = () => {
        socket.current.emit("create-room");
        setConnected(true);
    };

    const joinRoom = () => {
        socket.current.emit("join-room", { roomId, name });
        setConnected(true);
    };

    const sendMessage = (text) => {
        const message = { text, sender: name };
        socket.current.emit("chat-message", message);
        setMessages((prev) => [...prev, message]);
    };

    return (
        <div style={{ background: "black", color: "white", height: "100vh" }}>
            {!connected ? (
                <div>
                    <h1>Anubhav Meets</h1>
                    {roomId ? (
                        <>
                            <input
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <button onClick={joinRoom}>Join Room</button>
                        </>
                    ) : (
                        <button onClick={createRoom}>Create Room</button>
                    )}
                </div>
            ) : (
                <div>
                    <h2>Room: {roomId}</h2>
                    <div>
                        <VideoTile videoRef={videoRef} />
                    </div>
                    <ChatBox messages={messages} onSend={sendMessage} />
                    <MiniGames />
                </div>
            )}
        </div>
    );
};

export default App;
