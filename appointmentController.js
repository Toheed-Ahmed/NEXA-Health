import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

// @desc Create appointment
// @route POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, reason } = req.body;

    const foundPatient = await Patient.findById(patient);
    if (!foundPatient)
      return res.status(404).json({ message: "Patient not found" });

    const appointment = await Appointment.create({
      patient,
      doctor,
      date,
      reason,
      status: "Scheduled",
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all appointments
// @route GET /api/appointments
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name contact")
      .populate("doctor", "name email");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get appointment by ID
// @route GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name contact")
      .populate("doctor", "name email");
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update appointment
// @route PUT /api/appointments/:id
export const updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete appointment
// @route DELETE /api/appointments/:id
export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
