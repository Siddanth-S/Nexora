import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContexts.jsx';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    // Function to handle joining a video call
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <div
          style={{
            backgroundImage: 'url("/background.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100vh',
            width: '100%',
            color:"white"
          }}
        >

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                <h1 style={{color:"orange"}}>Nexora</h1>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                    <IconButton
                      onClick={() => {
                        navigate("/history")
                      }}
                      style={{ color: 'white' }}
                    >
                      <RestoreIcon />
                    </IconButton>
                    <p
                      onClick={() => navigate("/history")}
                      style={{ marginTop: '15px', cursor: 'pointer' }}
                    >
                      History
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      localStorage.removeItem("token")
                      navigate("/")
                    }}
                    style={{ marginLeft: '20px',borderRadius: '15px', backgroundColor: 'red', color: 'white' }}
                  >
                    Logout
                  </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Experience Seamless Connections, Every Time.</h2>
                        <br></br>
                        <div style={{ display: 'flex', gap: "10px" }}>

                            <div style={{ color: 'white' }}>
                              <TextField
                                onChange={e => setMeetingCode(e.target.value)}
                                id="outlined-basic"
                                label="Meeting Code"
                                variant="outlined"
                                InputLabelProps={{
                                  style: { color: 'white' },
                                }}
                                InputProps={{
                                  style: { color: 'white' },
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
                            </div>
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </div>
    )
}


export default withAuth(HomeComponent)