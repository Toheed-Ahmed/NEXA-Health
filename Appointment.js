import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema({
  patient:{type: mongoose.Schema.Types.ObjectId, ref:"Patient", required:true},
  doctor:{type: mongoose.Schema.Types.ObjectId, ref:"User", required:true},
  date:{type:Date, required:true},
  reason:String,
  status:{type:String, enum:["Scheduled","Completed","Cancelled"], default:"Scheduled"}
},{timestamps:true});
export default mongoose.model("Appointment", appointmentSchema);
