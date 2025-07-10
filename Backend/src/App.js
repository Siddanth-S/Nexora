import express from "express";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import pluginSocket from "./Controllers/SocketManager.js"; // Importing the socket manager
import userRoutes from "./Routes/userRoutes.js"; // Importing user routes


const app = express(); // Creating an Express application
const server = createServer(app); // Creating an HTTP server using Express
const io = pluginSocket(server); //pluging socket.io into the server



app.set("port", process.env.PORT || 3000); // Setting the port for the server
app.use(cors()); // Using CORS middleware to allow cross-origin requests
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies


app.use("/api/v1/users", userRoutes); // Using user routes for API versioning

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const start = async () => {

    const connection=await mongoose.connect("mongodb+srv://nexora:nexora123@nexora.55vacnc.mongodb.net/");
    console.log(`Connected to MongoDB ${connection.connection.host}`);

  server.listen(app.get("port"), () => {
    console.log("Server is running on port 3000");
  });
};

start();
