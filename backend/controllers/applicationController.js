import Application from '../models/Application.js';
import Hostel from '../models/Hostel.js';

export const createApplication = async (req, res) => {
  try {
    const { hostelId } = req.body;
    
    const existingApplication = await Application.findOne({
      studentId: req.user.id,
      hostelId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Application already exists' });
    }

    const application = await Application.create({
      studentId: req.user.id,
      hostelId
    });

    const populatedApp = await Application.findById(application._id)
      .populate('studentId', 'name email phone')
      .populate('hostelId', 'name address price');

    res.status(201).json(populatedApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('hostelId', 'name address price')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminApplications = async (req, res) => {
  try {
    const hostels = await Hostel.find({ adminId: req.user.id });
    const hostelIds = hostels.map(h => h._id);
    
    const applications = await Application.find({ hostelId: { $in: hostelIds } })
      .populate('studentId', 'name email phone')
      .populate('hostelId', 'name address')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('hostelId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.hostelId.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    const updatedApp = await Application.findById(application._id)
      .populate('studentId', 'name email phone')
      .populate('hostelId', 'name address');

    res.json(updatedApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
