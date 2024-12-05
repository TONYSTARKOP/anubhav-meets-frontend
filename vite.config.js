export default {
  server: {
      proxy: {
          "/socket.io": {
              target: "https://anubhav-meets-backend.onrender.com", // Use your backend URL
              ws: true,
          },
      },
  },
};
