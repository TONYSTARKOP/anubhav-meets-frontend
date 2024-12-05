import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Room = ({ roomId, username }) => {
  const [participants, setParticipants] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const localVideoRef = useRef(null);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    // Join the room
    socket.emit("join-room", { roomId, username });

    socket.on("participants-update", (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    socket.on("receive-message", ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
    });

    socket.on("screen-shared", ({ streamId }) => {
      setScreenStream(streamId);
    });

    // Start camera
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
      });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  const sendMessage = () => {
    socket.emit("send-message", { roomId, message, username });
    setMessage("");
  };

  const shareScreen = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    socket.emit("share-screen", { roomId, streamId: stream.id });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Room: {roomId}</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }}></video>
      <div>
        <button onClick={shareScreen}>Share Screen</button>
      </div>
      <h3>Participants:</h3>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
      <h3>Chat</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.username}: </strong>
            {msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Room;
