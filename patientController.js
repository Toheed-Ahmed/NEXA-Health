import Patient from "../models/Patient.js";

// @desc Create a new patient
// @route POST /api/patients
export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      assignedDoctor: req.user._id,
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all patients
// @route GET /api/patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("assignedDoctor", "name email");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single patient
// @route GET /api/patients/:id
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("assignedDoctor", "name email");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update patient
// @route PUT /api/patients/:id
export const updatePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete patient
// @route DELETE /api/patients/:id
export const deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
