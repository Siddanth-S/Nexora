import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
    user_id:{type:"String"},
    meeting_id: { type: String, required: true, unique: true },
    date: { type: Date, default:Date.now(), required: true },
});

const Meeting = mongoose.model("Meeting", MeetingSchema);
export { Meeting };