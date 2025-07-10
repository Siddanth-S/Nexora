import { useState, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import httpStatus from "http-status";
import server from "../environment";
export const AuthContext=createContext({});// Adjust path as needed

const client = axios.create({
  baseURL: `${server}api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });
      if (request.status === httpStatus.CREATED) {
        console.log("User registered successfully");
        return request.data.message;
      }
    } catch (error) {
      return error.response?.data?.message || "Registration failed";
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });
      if(request.status === httpStatus.OK){
        localStorage.setItem("token", request.data.token);
        console.log("Login successful");
        console.log(request.data);
        router("/home");
      }
    } catch (error) {
      return error.response?.data?.message || "Login failed";
    }
  };
  const getHistoryOfUser = async () => {
    try {
      let request = await client.post("/get_all_activity", {
        token: localStorage.getItem("token")  // ✅ Correctly passed in body
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_Code: meetingCode,
      });
      if (request.status === httpStatus.OK) {
        console.log("Meeting added to history");
        return request.data.message;
      }
    } catch (error) {
      return error.response?.data?.message || "Failed to add meeting to history";
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
  };
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
