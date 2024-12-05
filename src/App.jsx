import React, { useState } from "react";
import Room from "./room";

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setJoined(true);
  };

  const handleJoinRoom = () => {
    if (roomId.trim() === "" || username.trim() === "") {
      alert("Room ID and username are required!");
      return;
    }
    setJoined(true);
  };

  return (
    <div>
      {!joined ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Welcome to Anubhav Meets</h1>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleCreateRoom}>Create Room</button>
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      ) : (
        <Room roomId={roomId} username={username} />
      )}
    </div>
  );
};

export default App;
