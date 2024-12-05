import React from "react";

const VideoTile = ({ videoRef }) => {
    return <video ref={videoRef} autoPlay playsInline />;
};

export default VideoTile;
