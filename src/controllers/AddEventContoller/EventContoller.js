// controllers/Event.js
const Event = require("../../models/AddEvent/EventModal");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { name, description, isActive, createdBy, lang } = req.body;
    console.log(req.files, req.file,req.fileUrls);


    const newEvent = await Event.create({
      name,
      description,
      imageUrl: req.fileUrls[0],
      isActive,
      createdBy,
      lang,
    });

    res.status(200).json({ success: true, event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific Event by ID
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific Event by ID
exports.updateEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, createdBy, lang } = req.body;

    // const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;

    // Check if the Event exists
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Update the Event fields
    existingEvent.name = name;
    existingEvent.description = description;
    existingEvent.imageUrl = req.fileUrls[0];
    existingEvent.createdBy = createdBy;
    existingEvent.lang = lang;

    // Save the updated Event
    const updatedEvent = await existingEvent.save();

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific Event by ID
exports.deleteEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if the Event exists
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Remove the Event from the database
    await Event.deleteOne({ _id: eventId });

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
