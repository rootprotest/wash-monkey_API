const HelpSupport = require('../../models/AddHelpSupportModel/HelpSupport');

exports.createSupportTicket = async (req, res) => {
  try {
    const { userId, issue, subIssue, description } = req.body;

    if (!userId || !issue || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newTicket = await HelpSupport.create({
      userId,
      issue,
      subIssue,
      description
    });

    res.status(200).json({ success: true, ticket: newTicket });
  } catch (err) {
    console.error('Error creating support ticket:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await HelpSupport.find()
      .sort({ submittedAt: -1 })
      .populate({
        path: "userId",
        select: "firstname lastname email", // Only fetch these fields
      })
      .lean(); // Converts Mongoose documents into plain JavaScript objects

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



exports.getSupportTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await HelpSupport.find({ userId }).sort({ submittedAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (err) {
    console.error('Error fetching tickets by user:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getSupportTicketsByUserIds = async (req, res) => {
 try {
    const ticket = await HelpSupport.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.replyToSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender, content } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ success: false, message: 'Sender and content are required' });
    }

    const updatedTicket = await HelpSupport.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          messages: {
            sender,
            content
          }
        }
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error replying to support ticket:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
