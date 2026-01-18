const HelpSupport = require('../../models/AddHelpSupportModel/HelpSupport');


const nodemailer = require("nodemailer");
const formatDetails = (details) => {
  if (!details) return "-";

  if (typeof details === "string") {
    return details;
  }

  if (typeof details === "object") {
    return Object.entries(details)
      .map(
        ([key, value]) =>
          `<li><strong>${key}:</strong> ${value}</li>`
      )
      .join("");
  }

  return "-";
};

const sendSupportEmail = async (ticket) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "monkeywashclean@gmail.com",
        pass: "oqvciwgddvzeecxm",
      },
    });

    await transporter.verify();

    const user = ticket.userId || {};

    const detailsHtml =
      typeof ticket.details === "object"
        ? `<ul>${formatDetails(ticket.details)}</ul>`
        : ticket.details || "-";

    await transporter.sendMail({
      from: `"WashMonkey Support" <monkeywashclean@gmail.com>`,
      to: "support@washmonkey.in",
      subject: "🚨 New Support Ticket Created",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2 style="color:#ff6600;">New Support Ticket</h2>
          <hr/>

          <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>

          <h3>User Details</h3>
          <p><strong>Name:</strong> ${user.firstname || ""} ${user.lastname || ""}</p>
          <p><strong>Email:</strong> ${user.email || "-"}</p>
          <p><strong>Phone:</strong> ${user.mobilenumber || "-"}</p>

          <hr/>

          <p><strong>Issue:</strong> ${ticket.issue}</p>
          <p><strong>Sub Issue:</strong> ${ticket.subIssue || "-"}</p>
          <p><strong>Description:</strong> ${ticket.description || "-"}</p>

          <p><strong>Details:</strong></p>
          ${detailsHtml}

          <br/>
          <p><strong>Created At:</strong> ${new Date(ticket.submittedAt).toLocaleString()}</p>

          <hr/>
          <p style="font-size:12px;color:#777;">
            This ticket was generated automatically from WashMonkey App.
          </p>
        </div>
      `,
    });

    console.log("✅ Support email sent successfully");
  } catch (error) {
    console.error("❌ Error sending support email:", error);
  }
};


const generateTicketNumber = () => {
  const now = new Date();

  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return `WM${YYYY}${MM}${DD}${HH}${mm}`;
};


exports.createSupportTicket = async (req, res) => {
  try {
    const { userId, issue, subIssue, description, details } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const ticketNumber = generateTicketNumber();

    const newTicket = await HelpSupport.create({
      ticketNumber,
      userId,
      issue,
      subIssue,
      description,
      details,
    });

    // ✅ Populate user details
    const populatedTicket = await HelpSupport.findById(newTicket._id)
      .populate("userId", "firstname lastname email mobilenumber");

    // ✅ Send populated ticket to email
    sendSupportEmail(populatedTicket);

    res.status(200).json({
      success: true,
      ticket: populatedTicket,
    });

  } catch (err) {
    console.error("Error creating support ticket:", err);
    res.status(500).json({ success: false, error: "Server error" });
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
