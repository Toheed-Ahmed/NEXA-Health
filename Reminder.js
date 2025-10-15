import mongoose from "mongoose";
const reminderSchema = new mongoose.Schema({
  appointment:{type: mongoose.Schema.Types.ObjectId, ref:"Appointment"},
  message:String,
  remindAt:Date,
     to: {
      type: String, // or Number if you want strictly numeric phone numbers
      required: true,
    },
  isSent:{type:Boolean, default:false}
},{timestamps:true});
export default mongoose.model("Reminder", reminderSchema);
