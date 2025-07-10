import mongoose from 'mongoose';
import {Meeting} from './meeting.js'; 

const UserSchema=new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    token:{
        type: String
    }
});

const User = mongoose.model('User', UserSchema);

const getUserHistory = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      console.log("User not found for token:", token);
      return res.status(404).json({ message: "User not found" });
    }

    const meetings = await Meeting.find({ user_id: user.username });
    console.log("Fetched meetings for", user.username, ":", meetings);

    res.json(meetings);
  } catch (err) {
    console.error("Error in getUserHistory:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_Code } = req.body;
  try {
    console.log("addToHistory called with:", { token, meeting_Code });

    const user = await User.findOne({ token: token });

    if (!user) {
      console.log("No user found for token:", token);
      return res.status(404).json({ message: "User not found" });
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meeting_id: meeting_Code,
    });

    await newMeeting.save();
    console.log("Meeting saved to history:", newMeeting);

    res.json({ message: "Meeting added to history" });
  } catch (err) {
    console.error("Error in addToHistory:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default User;
export { getUserHistory, addToHistory };