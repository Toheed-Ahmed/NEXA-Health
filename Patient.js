import mongoose from "mongoose";
const patientSchema = new mongoose.Schema({
  name:String,
  age:Number,
  gender:String,
  contact:String,
  address:String,
  medicalHistory:[String],
  assignedDoctor:{type: mongoose.Schema.Types.ObjectId, ref:"User"}
},{timestamps:true});
export default mongoose.model("Patient", patientSchema);
