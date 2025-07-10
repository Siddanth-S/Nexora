import React, { useContext, useEffect, useState } from 'react'
import axios from "axios";
import { AuthContext } from '../contexts/AuthContexts.jsx'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';

import { IconButton } from '@mui/material';
export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                console.log("Fetched meeting history:", history);
                setMeetings(history);
            } catch(err) {
                console.error("Error fetching history:", err);
            }
        }

        fetchHistory();
    }, [])

    const addToHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const meetingCode = window.location.pathname.split("/").pop();
        const response = await axios.post("http://localhost:3000/api/v1/users/add_to_history", {
          token,
          meeting_Code: meetingCode,
        });
        console.log("History added:", response.data);
      } catch (err) {
        console.error("Failed to add history:", err);
      }
    };

    const handleEndCall = () => {
      stopTracks();
      addToHistory(); // ✅ Save meeting to history
      window.location.href = "/";
    };

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div style={{
         backgroundImage: 'url("/background.jpeg")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         minHeight: '100vh'
       }}>
           <h1>
            <IconButton onClick={() => {
                routeTo("/home")
            }}>
                <HomeIcon sx={{ color: "white" ,fontSize:35}} />
                &nbsp;&nbsp;
                <h2 style={{color:"white",marginTop: 3}}>Previous Meetings</h2>
            </IconButton >
            </h1>
            <br></br>
            {
                (meetings.length !== 0) ? meetings.map((e, i) => {
                    return (

                        <>


                            <Card key={i} variant="outlined" sx={{ width: 200, height: 70, mb: 2 }}>


                                <CardContent>
                                    <Typography sx={{ fontSize: 14,fontWeight:"bold" }} color="text.secondary" gutterBottom>
                                        Code: {e.meeting_id}
                                    </Typography>

                                    <Typography sx={{ mb: 1.5,fontSize:14 }} color="text.secondary">
                                        Date: {formatDate(e.date)}
                                    </Typography>

                                </CardContent>


                            </Card>


                        </>
                    )
                }) : <></>

            }

        </div>
    )
}