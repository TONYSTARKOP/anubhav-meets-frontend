import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const messageInputRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    if (joined) {
      // Initialize camera and microphone
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          // Send local video stream to server
          socket.emit("send-video-stream", stream);

          // Join the room
          socket.emit("join-room", roomId, username);
        })
        .catch((err) => console.error("Error accessing media devices:", err));
    }

    // Listen for participants update
    socket.on("participants-update", (users) => setParticipants(users));

    // Listen for incoming chat messages
    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for remote video streams
    socket.on("receive-video-stream", ({ userId, stream }) => {
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = document.createElement("video");
        remoteVideoRefs.current[userId].autoplay = true;
        remoteVideoRefs.current[userId].srcObject = stream;
        document.getElementById("remote-videos").appendChild(
          remoteVideoRefs.current[userId]
        );
      }
    });

    return () => {
      socket.off("participants-update");
      socket.off("receive-message");
      socket.off("receive-video-stream");
    };
  }, [joined]);

  const handleSendMessage = () => {
    const message = messageInputRef.current.value;
    if (message) {
      socket.emit("send-message", { roomId, username, message });
      setMessages((prev) => [...prev, `${username}: ${message}`]);
      messageInputRef.current.value = "";
    }
  };

  return (
    <div style={{ color: "white", backgroundColor: "black", minHeight: "100vh", padding: "10px" }}>
      {!joined ? (
        <div>
          <h1>Welcome to Anubhav Meets</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={() => setJoined(true)}>Join Room</button>
        </div>
      ) : (
        <div>
          <h1>Room: {roomId}</h1>
          <div>
            <h2>Local Video</h2>
            <video ref={localVideoRef} autoPlay muted style={{ width: "300px", border: "2px solid white" }} />
          </div>
          <div id="remote-videos">
            <h2>Remote Participants</h2>
            {/* Remote videos will be appended here dynamically */}
          </div>
          <div>
            <h2>Chat</h2>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid white", padding: "10px" }}>
              {messages.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
            </div>
            <input type="text" ref={messageInputRef} placeholder="Type a message" />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          <div>
            <h2>Participants</h2>
            <ul>
              {participants.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
