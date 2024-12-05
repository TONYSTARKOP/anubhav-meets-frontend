import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Update the URL if your backend is hosted elsewhere

function App() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);
  const chatRef = useRef(null);
  
  // Handle user media (camera and microphone)
  useEffect(() => {
    if (!stream) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => console.error("Error accessing media devices:", err));
    }

    socket.on("user-joined", (newUser) => {
      setUsers((prevUsers) => [...prevUsers, newUser]);
    });

    socket.on("user-left", (leftUser) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user !== leftUser));
    });

    socket.on("chat-message", (message) => {
      const messageElem = document.createElement("p");
      messageElem.innerText = message;
      chatRef.current.appendChild(messageElem);
    });

    socket.on("screen-shared", (screenStream) => {
      const screenVideo = document.createElement("video");
      screenVideo.srcObject = screenStream;
      screenVideo.autoplay = true;
      screenVideo.muted = true;
      screenVideo.style.width = "100%";
      screenVideo.style.height = "auto";
      document.body.appendChild(screenVideo);
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("chat-message");
      socket.off("screen-shared");
    };
  }, [stream]);

  const createRoom = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setRoomId(id);
    setJoined(true);
    socket.emit("create-room", id);
  };

  const joinRoom = () => {
    socket.emit("join-room", roomId, username);
    setJoined(true);
  };

  const sendMessage = (message) => {
    if (message.trim()) {
      socket.emit("chat-message", `${username}: ${message}`);
    }
  };

  const handleScreenShare = () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((screenStream) => {
        const screenTrack = screenStream.getTracks()[0];
        setScreenStream(screenStream);

        // Stop camera feed when sharing screen
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }

        // Broadcast the screen share to others
        socket.emit("share-screen", screenStream);

        screenTrack.onended = () => {
          setStream(null);  // Clear the screen stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream;  // Re-enable the camera feed
          }
        };
      })
      .catch((err) => console.error("Error sharing screen:", err));
  };

  return (
    <div style={{ backgroundColor: "black", color: "white", minHeight: "100vh" }}>
      {!joined ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h1>Welcome to Anubhav Meets</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <div>
            <button onClick={createRoom} style={{ marginRight: "10px" }}>Create Room</button>
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px" }}>
          <h1>Room: {roomId}</h1>
          
          {/* Video display */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "auto", border: "1px solid white", marginBottom: "10px" }}
          />
          
          {/* Participants */}
          <div style={{ marginTop: "10px", borderTop: "1px solid white", paddingTop: "10px" }}>
            <h2>Participants</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
            <button onClick={handleScreenShare}>Share Screen</button>
          </div>
          
          {/* Chat */}
          <div style={{ marginTop: "20px" }}>
            <h2>Chat</h2>
            <div ref={chatRef} style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "10px" }}></div>
            <input
              type="text"
              placeholder="Type a message"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage(e.target.value);
                  e.target.value = "";
                }
              }}
              style={{ width: "100%", padding: "10px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
