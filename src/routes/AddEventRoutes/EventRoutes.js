// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { uploadHandler } = require("../../Image/multerSetup")
const EventController = require('../../controllers/AddEventContoller/EventContoller');

// Create a new Event
router.post('/addevent', uploadHandler, EventController.createEvent);

// Get all events
router.get('/allevents', EventController.getAllEvents);

// Get a specific Event by ID
router.get('/event/:id', EventController.getEventById);

// Updated a specific Event by ID
router.put('/event/:id', uploadHandler, EventController.updateEventById);

// Delete a specific Event by ID
router.delete('/event/:id', EventController.deleteEventById);

module.exports = router;
