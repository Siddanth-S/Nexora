import { Server, Socket } from "socket.io";

let connection = {};
let timeOnline = {};
let messages = {};

const pluginSocket = (server) => {
  const io = new Server(server,{
    cors: {
        origin: "*", // Allow all origins for CORS
        methods: ["GET", "POST"], // Allowed HTTP methods   
        allowedHeaders: ["Content-Type"], // Allowed headers
        credentials: true // Allow credentials
  }});

  io.on("connection", (socket) => {
    console.log("New client connected:");;
    socket.on("join-call", (path) => {
      if (!connection[path]) {
        connection[path] = [];
      }
      connection[path].push(socket.id);
      timeOnline[socket.id] = Date.now();

      for (let i = 0; i < connection[path].length; i++) {
        io.to(connection[path][i]).emit(
          "user-joined",
          socket.id,
          connection[path]
        );
      }

      if (messages[path] !== undefined) {
        for (let i = 0; i < messages[path].length; i++) {
          io.to(socket.id).emit("chat-message", messages[path][i]['data'],
            messages[path][i]['sender'], messages[path][i]['socket-id-sender']);
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connection).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },['',false]);
      if(found===true){
        if(messages[matchingRoom] === undefined){
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          'sender': sender,
          'data': data,
          'socket-id-sender': socket.id,

        });
        console.log("messages", matchingRoom, ":", sender, data);

        connection[matchingRoom].forEach((id) => {
          io.to(id).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
        var diffTime= Math.abs(timeOnline[socket.id] - new Date());
        let key = null;

        for (const [k, v] of Object.entries(connection)) {
           for(let i=0;i<v.length;i++){
            if(v[i]===socket.id){
                key=k;
                for(let i=0;i<connection[key].length;i++){
                    io.to(connection[key][i]).emit("user-disconnected", socket.id);
                }
                var index= connection[key].indexOf(socket.id);
                connection[key].splice(index, 1);

                if( connection[key].length===0){
                    delete connection[key];
                }
            }
        }
    }});
  });
};
export default pluginSocket;
