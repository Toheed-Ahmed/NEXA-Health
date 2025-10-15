import Reminder from "../models/Reminder.js";
import Appointment from "../models/Appointment.js";
import { sendSMS } from "../utils/twillio.js";
import cron from "node-cron";

// ===============================
// 📅 CREATE REMINDER
// ===============================
export const createReminder = async (req, res) => {
  try {
    const { appointment, message, remindAt, to } = req.body;

    const foundAppt = await Appointment.findById(appointment).populate(
      "patient",
      "name contact"
    );
    if (!foundAppt)
      return res.status(404).json({ message: "Appointment not found" });

    const reminder = await Reminder.create({
      appointment,
      message,
      remindAt,
      to: to || foundAppt.patient?.contact,
    });

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (err) {
    console.error("❌ Error creating reminder:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// 📋 GET ALL REMINDERS
// ===============================
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().populate({
      path: "appointment",
      populate: { path: "patient doctor", select: "name email contact" },
    });
    res.status(200).json({ success: true, data: reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ✏️ UPDATE REMINDER
// ===============================
export const updateReminder = async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ success: true, message: "Reminder updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// 🗑️ DELETE REMINDER
// ===============================
export const deleteReminder = async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Reminder deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// 🔄 CRON JOB — AUTO SEND REMINDERS
// ===============================
// Runs every minute to check pending reminders
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log("⏰ Checking pending reminders at", now.toLocaleString());

  try {
    const pendingReminders = await Reminder.find({
      remindAt: { $lte: now },
      isSent: false,
    }).populate("appointment");

    for (const reminder of pendingReminders) {
      try {
        console.log(`📤 Sending SMS to ${reminder.to}`);

        await sendSMS(reminder.to, reminder.message);

        reminder.isSent = true;
        await reminder.save();

        console.log(`✅ Reminder sent successfully: ${reminder._id}`);
      } catch (err) {
        console.error("❌ SMS sending failed:", err.message);
      }
    }
  } catch (error) {
    console.error("⚠️ Cron job failed:", error.message);
  }
});
