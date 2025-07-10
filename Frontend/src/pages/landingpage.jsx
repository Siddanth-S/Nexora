import React, { use } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";


function LandingPage() {
  const router= useNavigate();
  return (
    <div className="landing-page-container">
      <nav>
        <div className="nav-Header">
          <h1 style={{color:"orange"}}>Nexora</h1>
        </div>

        <div className="nav-list">
          <p onClick={()=>{
            router("/video");
          }}>Join as Guest</p>
          <p onClick={()=>{
            router("/auth");
          }}>Sign Up</p>
          <div onClick={()=>{
            router("/auth");
          }} role="button">
            <p>Login</p>
          </div>
        </div>
      </nav>
      <div className="landingpage-Main-Container">
        <div>
          <h1 style={{fontSize:"3rem",color:"white"}}><span style={{color:"#8ecae6"}}>Connect</span > with your Loved Ones</h1>
          <p style={{color:"white"}}>Cover a distance with Stream Sync.</p>
          <div role="button">
          <Link to="/auth">Get Started</Link>
          </div>
          
        </div>
        <div>
            <img style={{height:"80vh"}} src="/videocall-removebg-preview.png"></img>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
