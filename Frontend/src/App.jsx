import { useState } from "react";
import "./App.css";
import LandingPage from "./pages/landingpage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Authentication from "./pages/authentication";
import { AuthProvider } from "./contexts/AuthContexts.jsx";
import VideoMeetComponent from "./pages/Videomeet.jsx";
import HomeComponent from "./pages/home.jsx";
import History from "./pages/history.jsx";


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route path="/auth" element={<Authentication />}></Route>
            <Route path="/home" element={<HomeComponent/>}></Route>
            <Route path='/:url' element={<VideoMeetComponent />} />
            <Route path='/history' element={<History />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
