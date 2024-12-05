import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");  // Replace with your backend URL

function App() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [stream, setStream] = useState(null);
  const [users, setUsers] = useState([]);
  const videoRef = useRef(null);
  const videoGridRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    // Listen for users joining the room
    socket.on("user-joined", (username) => {
      setUsers((prevUsers) => [...prevUsers, username]);
    });
  }, []);

  const createRoom = () => {
    const id = Math.random().toString(36).substr(2, 9);  // Random room ID
    setRoomId(id);
    setJoined(true);
    socket.emit("create-room", id);
  };

  const joinRoom = () => {
    socket.emit("join-room", roomId, username);
    setJoined(true);
  };

  const handleSendMessage = (message) => {
    if (message.trim()) {
      const messageElem = document.createElement("p");
      messageElem.innerText = `${username}: ${message}`;
      chatRef.current.appendChild(messageElem);
    }
  };

  const handleScreenShare = () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((screenStream) => {
        const screenTrack = screenStream.getTracks()[0];
        stream.getTracks().forEach((track) => track.stop()); // Stop camera
        setStream(screenStream);
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        screenTrack.onended = () => {
          setStream(null);  // Re-enable the camera when screen sharing ends
        };
      })
      .catch((err) => console.error("Error sharing screen:", err));
  };

  return (
    <div style={{ background: "black", color: "white", height: "100vh" }}>
      {!joined ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Anubhav Meets</h1>
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
          <button onClick={createRoom}>Create Room</button>
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <h1>Room: {roomId}</h1>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", border: "1px solid white" }}
          />
          <div ref={videoGridRef} style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <div>
              <h2>Participants:</h2>
              <ul>
                {users.map((user, idx) => (
                  <li key={idx}>{user}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <button onClick={handleScreenShare}>Share Screen</button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <div style={{ borderTop: "1px solid white", padding: "10px" }}>
              <h2>Chat</h2>
              <div ref={chatRef} style={{ maxHeight: "300px", overflowY: "scroll" }}></div>
              <input
                type="text"
                placeholder="Type a message"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
