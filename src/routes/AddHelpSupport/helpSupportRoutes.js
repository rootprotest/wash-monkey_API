const express = require('express');
const router = express.Router();
const helpSupportController = require('../../controllers/AddhelpSupportController/helpSupportController');

// Create a new ticket
router.post('/create', helpSupportController.createSupportTicket);

// Get all tickets (admin)
router.get('/', helpSupportController.getAllSupportTickets);

// Get tickets by user
router.get('/:userId', helpSupportController.getSupportTicketsByUserId);


router.get('/ticket/:id', helpSupportController.getSupportTicketsByUserIds);



router.post('/reply/:ticketId', helpSupportController.replyToSupportTicket);



module.exports = router;
