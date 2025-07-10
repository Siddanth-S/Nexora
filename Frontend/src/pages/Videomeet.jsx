import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import server from "../environment.js";

const server_url = server;
var connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(true);
  const [showModal, setModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (askForUsername) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          window.localStream = stream;
          if (localVideoref.current) localVideoref.current.srcObject = stream;
        })
        .catch(() => {
          setVideoAvailable(false);
          setAudioAvailable(false);
        });
    }
  }, [askForUsername]);

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  useEffect(() => {
    if (window.localStream) {
      window.localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = video));
    }
  }, [video]);

  useEffect(() => {
    if (window.localStream) {
      window.localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = audio));
    }
  }, [audio]);

  const getDisplayMedia = () => {
    if (screen) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  const getDisplayMediaSuccess = (stream) => {
    stopTracks();
    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(stream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: description })
          );
        });
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          stopTracks();
          getUserMedia();
        })
    );
  };

  const stopTracks = () => {
    try {
      const tracks = localVideoref.current?.srcObject?.getTracks() || [];
      tracks.forEach((track) => track.stop());
    } catch (e) {}
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });
      stopTracks();
      window.localStream = stream;
      localVideoref.current.srcObject = stream;

      for (let id in connections) {
        if (id === socketIdRef.current) continue;
        connections[id].addStream(stream);
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description).then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: description })
            );
          });
        });
      }

      stream.getTracks().forEach((track) => {
        track.onended = () => {
          setVideo(false);
          setAudio(false);
          stopTracks();
          window.localStream = new MediaStream([black(), silence()]);
          localVideoref.current.srcObject = window.localStream;
          getUserMedia();
        };
      });
    } catch (err) {
      console.error("Media error:", err);
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url);

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage)

      socketRef.current.on("user-left", (id) => {
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
        setVideos((videos) => videos.filter((v) => v.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((clientId) => {
          if (connections[clientId]) return;
          connections[clientId] = new RTCPeerConnection(peerConfigConnections);

          connections[clientId].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                clientId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[clientId].onaddstream = (event) => {
            setVideos((prev) => {
              const exists = prev.some((v) => v.socketId === clientId);
              const updated = exists
                ? prev.map((v) =>
                    v.socketId === clientId ? { ...v, stream: event.stream } : v
                  )
                : [...prev, { socketId: clientId, stream: event.stream }];
              videoRef.current = updated;
              return updated;
            });
          };

          if (window.localStream) {
            connections[clientId].addStream(window.localStream);
          } else {
            const fakeStream = new MediaStream([black(), silence()]);
            window.localStream = fakeStream;
            connections[clientId].addStream(fakeStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let clientId in connections) {
            if (clientId === socketIdRef.current) continue;
            connections[clientId].addStream(window.localStream);
            connections[clientId].createOffer().then((description) => {
              connections[clientId]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    clientId,
                    JSON.stringify({ sdp: description })
                  );
                });
            });
          }
        }
      });
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    let signal;
    try {
      signal = JSON.parse(message);
    } catch (err) {
      console.error("Invalid signal:", err);
      return;
    }

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer().then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({ sdp: description })
                    );
                  });
              });
            }
          });
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => setVideo((v) => !v);
  const handleAudio = () => setAudio((a) => !a);
  let handleScreen = () => {
    setScreen(!screen);
  };
  const handleEndCall = () => {
    stopTracks();
    window.location.href = "/";
    
  };

  const openChat = () => {
    setModal(true);
    setNewMessages(0);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const connect = async () => {
    setAskForUsername(false);
    await getUserMedia();
    connectToSocketServer();
  };

  return (
    <div
      style={{
        background: 'url("/background.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100%',
        color: 'white',
      }}
    >
      {askForUsername ? (
        <div >
            <br></br>
          <h2>Enter into Lobby</h2>
          <br></br>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={{
              style: { color: 'white' },
            }}
            InputProps={{
              style: {
                color: 'white',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
            }}
          />
          <Button variant="contained" type="button" onClick={connect} style={{marginLeft:"10px",marginTop:'7px'}}>
            Connect
          </Button>
          <video
            ref={localVideoref}
            autoPlay
            muted
            style={{ width: "100%", height: "50vh", marginTop: "20px" }}
          ></video>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={`${styles.chatRoom} ${showModal ? styles.chatRoomOpen : ''}`}>
            <h1 style={{textAlign:"center"}}>CHAT</h1>
            <hr></hr>
            <div className={styles.chattingDisplay}>
              {messages.length >0 ? (
                messages.map((item, i) => (
                  <div key={i} style={{ marginBottom: "5px" }}>
                    <p> <b>{item.sender}:-</b> {item.data}</p>
                  </div>
                ))
              ) : (
                <p>No Messages Yet</p>
              )}
            </div>
            <div
              className={styles.chattingArea}
              style={{ display: 'flex', alignItems: 'center',zIndex: 1000 }}
            >
              <TextField
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                label="Enter your chat"
                fullWidth
                InputLabelProps={{
                  style: { color: 'black' },
                }}
                InputProps={{
                  style: {
                    color: 'black',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'black',
                    },
                    '&:hover fieldset': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'black',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                style={{ marginLeft: '10px', height: '100%' }}
              >
                Send
              </Button>
            </div>
          </div>

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            )}
            <Badge badgeContent={newMessages} color="primary">
              <IconButton
                onClick={() => {
                  setModal(!showModal);
                  setNewMessages(0);
                }}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
            style={{
              width: "300px",
              height: "200px",
              display: video ? "block" : "none",
              position: "absolute",
              bottom: "70px",
              left: "20px",
              zIndex: 10,
              borderRadius: "8px",
              objectFit: "cover"
            }}
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                      ref.autoplay = true;
                      ref.playsInline = true;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
