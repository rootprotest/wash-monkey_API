const HelpSupport = require('../../models/AddHelpSupportModel/HelpSupport');
const nodemailer = require("nodemailer");

const keywordMap = {

  order: [
    "order", "my order", "order status", "track order", "tracking",
    "delivery", "shipment", "dispatch", "courier", "late delivery",
    "delayed", "where is my order", "service status", "booking status",
    "service update", "technician assigned", "arrival time",
    "when will it arrive", "expected time", "progress"
  ],

  refund: [
    "refund", "money back", "return money", "refund status",
    "not refunded", "refund not received", "cashback",
    "reverse payment", "amount back", "refund delay",
    "refund issue", "refund process", "credit not received",
    "bank refund", "payment return"
  ],

  cancel: [
    "cancel", "cancel booking", "cancellation",
    "stop service", "abort booking", "remove booking",
    "terminate service", "withdraw booking",
    "cancel my order", "cancel request"
  ],

  payment: [
    "payment", "paid", "upi", "card payment",
    "debit card", "credit card", "transaction",
    "amount deducted", "money deducted",
    "payment failed", "payment issue",
    "double payment", "charged twice",
    "billing issue", "invoice issue",
    "receipt", "payment confirmation"
  ],

  reschedule: [
    "reschedule", "change date", "change time",
    "modify booking", "postpone service",
    "shift booking", "update time",
    "new schedule", "reschedule request"
  ],

  pricing: [
    "price", "cost", "charges", "how much",
    "service cost", "cleaning cost",
    "price list", "pricing details",
    "quotation", "estimate",
    "offer price", "discount price"
  ],

  offers: [
    "offer", "discount", "coupon",
    "promo code", "voucher",
    "cashback offer", "special offer",
    "deal", "promotion"
  ],

  technician: [
    "technician", "staff", "worker",
    "service person", "cleaner",
    "assigned person", "technician late",
    "technician behavior",
    "staff issue"
  ],

  complaint: [
    "complaint", "bad service",
    "not satisfied", "poor service",
    "service issue", "quality issue",
    "damage", "broken item",
    "rude staff", "unprofessional",
    "worst service"
  ],

  app_issue: [
    "app not working", "app crash",
    "error", "bug", "login issue",
    "otp not received", "technical problem",
    "server error", "something went wrong"
  ],

  account: [
    "account", "profile", "update profile",
    "change number", "change email",
    "delete account", "account issue",
    "password reset", "forgot password"
  ],

  location: [
    "service area", "available in my area",
    "location support", "city support",
    "area coverage", "pin code service"
  ],

  greeting: [
    "hello", "hi", "hey",
    "good morning", "good evening",
    "good afternoon"
  ]
};

const responseMap = {

  order: "📦 Please share your Order or Booking ID so we can check your service status immediately.",

  refund: "💰 Refunds are processed within 5–7 working days. Please share your Transaction ID for verification.",

  cancel: "❌ Please provide your Booking ID so we can assist with the cancellation request as per policy.",

  payment: "💳 If payment was deducted but service not confirmed, please share your transaction details.",

  reschedule: "📅 Please share your Booking ID and preferred new date/time for rescheduling.",

  pricing: "💵 Please let us know the service name so we can provide accurate pricing details.",

  offers: "🎁 We regularly provide offers and discounts. Please check the app or share the coupon code for assistance.",

  technician: "👷 Please share your Booking ID so we can check technician details and assist accordingly.",

  complaint: "⚠️ We sincerely apologize for the inconvenience. Please share complete details so we can investigate and resolve this issue.",

  app_issue: "⚙️ Please describe the technical issue in detail and share screenshots if possible.",

  account: "🔐 Please share your registered mobile number or email so we can assist with your account request.",

  location: "📍 Please share your city or PIN code so we can confirm service availability in your area.",

  greeting: "👋 Hello! Welcome to WashMonkey Support. How can we assist you today?"
};


////////////////////////////////////////////////////////////
// 🤖 MINI CHATBOT LOGIC
////////////////////////////////////////////////////////////

const generateBotReply = (message, previousMessages = []) => {
  if (!message) {
    return "🙏 Please describe your issue so we can assist you.";
  }

  const text = message.toLowerCase();

  // ✅ 1. Urgent / Human Request Detection
  if (
    text.includes("urgent") ||
    text.includes("agent") ||
    text.includes("human") ||
    text.includes("call me") ||
    text.includes("talk to someone")
  ) {
    return "🚨 Your request has been marked as *high priority*. Our support team will contact you shortly.";
  }

  // ✅ 2. Avoid repeating same reply
  const lastBotMessages = previousMessages
    .filter(m => m.sender === "bot")
    .map(m => m.content);

  for (const category in keywordMap) {
    for (const keyword of keywordMap[category]) {
      if (text.includes(keyword)) {

        const reply = responseMap[category];

        // ❌ If already sent → skip repeating
        if (lastBotMessages.includes(reply)) {
          continue;
        }

        return reply;
      }
    }
  }

  // ✅ 3. Fallback (only once)
  if (!lastBotMessages.includes("default")) {
    return "🙏 Thank you for contacting WashMonkey Support. Our team will review your concern and respond shortly.";
  }

  return null; // don't spam
};


const generateTicketNumber = () => {
  const now = new Date();

  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const random = Math.floor(10 + Math.random() * 90); // ✅ 2-digit (10–99)

  return `WM${YYYY}${MM}${DD}${HH}${mm}${ss}${random}`;
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

    const user = ticket.userId || {};
    const customerEmail = user.email;

    const ticketId = ticket.ticketNumber;
    const issueCategory = ticket.issue || "General Inquiry";

    const now = new Date();
    const formattedDate = now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    /* -------------------------
       1️⃣ Email to Support Team
    -------------------------- */
    await transporter.sendMail({
      from: `"WashMonkey Support" <${process.env.SUPPORT_EMAIL}>`,
      to: "support@washmonkey.in",
      subject: `New Support Ticket Created - ${ticketId}`,
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>Ticket:</strong> ${ticketId}</p>
        <p><strong>Name:</strong> ${user.firstname || ""} ${user.lastname || ""}</p>
        <p><strong>Email:</strong> ${customerEmail || "-"}</p>
        <p><strong>Issue:</strong> ${issueCategory}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
      `,
    });

    /* -------------------------
       2️⃣ Custom Email to Customer ✅
    -------------------------- */
    if (customerEmail) {
      await transporter.sendMail({
        from: `"Wash Monkey Support" <${process.env.SUPPORT_EMAIL}>`,
        to: customerEmail,

        // ✅ SUBJECT FORMAT
       subject: `Ticket #${ticketId} – ${issueCategory} | Wash Monkey Support`,


        // ✅ YOUR CUSTOM TEMPLATE
        html: `
          <p>Hi ${user.firstname || "Customer"},</p>

          <p>Thank you for contacting <strong>Wash Monkey</strong>! 🐒🚗</p>

          <p>Your request has been successfully received, and a support ticket has been created. Our team is currently reviewing your concern.</p>

          <h3>Ticket Details:</h3>

          <ul>
            <li><strong>Ticket Number:</strong> ${ticketId}</li>
            <li><strong>Issue Category:</strong> ${issueCategory}</li>
            <li><strong>Submitted On:</strong> ${formattedDate}</li>
          </ul>

          <p>Our support team will reach out to you within <strong>24 hours</strong>.</p>

          <p>For immediate assistance, you can call us at <strong>+91-81 4827 4827</strong>, and our team will be happy to help you.</p>

          <p><strong>Note:</strong> Wash Monkey observes a weekly holiday on Tuesdays. Requests raised during this period will be attended to on the next working day. We truly appreciate your patience.</p>

          <p>If you have any additional details to share, simply reply to this email quoting your ticket number.</p>

          <br/>

          <p>Warm regards,<br/>
          Wash Monkey Support Team<br/>
          🌐 <a href="https://www.washmonkey.in">www.washmonkey.in</a></p>
        `,
      });
    }

  } catch (error) {
    console.error("Email Error:", error);
  }
};
////////////////////////////////////////////////////////////
// ✅ CREATE SUPPORT TICKET  (SAME EXPORT NAME)
////////////////////////////////////////////////////////////

exports.createSupportTicket = async (req, res) => {
  try {
    const { userId, issue, subIssue, description, details } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const ticketNumber = generateTicketNumber();

    // ✅ FILE HANDLING (FROM GCP)
    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    if (req.fileUrls && req.fileUrls.file && req.fileUrls.file.length > 0) {
      fileUrl = req.fileUrls.file[0];

      const uploadedFile = req.files.file[0];

      fileName = uploadedFile.originalname;

      if (uploadedFile.mimetype.startsWith("image")) {
        fileType = "image";
      } else if (uploadedFile.mimetype === "application/pdf") {
        fileType = "pdf";
      } else {
        fileType = "other";
      }
    }

    // ✅ PREVENT EMPTY MESSAGE ERROR
    const userMessageContent =
      description?.trim() ||
      (fileUrl ? "📎 Attachment uploaded" : "No message provided");

    const newTicket = await HelpSupport.create({
      ticketNumber,
      userId,
      issue,
      subIssue,
      description,
      details: details ? JSON.parse(details) : {},

      // ✅ SAVE FILE IN ROOT
      fileUrl,
      fileType,
      fileName,

      messages: [
        {
          sender: "user",
          content: userMessageContent,
        },
        {
          sender: "bot",
          content:
            "👋 Hello! Your support ticket has been created. Please describe your issue clearly.",
        },
      ],
    });

    const populatedTicket = await HelpSupport.findById(newTicket._id)
      .populate("userId", "firstname lastname email mobilenumber");

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

////////////////////////////////////////////////////////////
// ✅ GET ALL SUPPORT TICKETS (SAME EXPORT NAME)
////////////////////////////////////////////////////////////

exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await HelpSupport.find()
      .sort({ submittedAt: -1 })
      .populate("userId", "firstname lastname email");

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

////////////////////////////////////////////////////////////
// ✅ GET SUPPORT TICKETS BY USER ID (SAME NAME)
////////////////////////////////////////////////////////////

exports.getSupportTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = await HelpSupport.find({ userId })
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (err) {
    console.error('Error fetching tickets by user:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

////////////////////////////////////////////////////////////
// ✅ GET SINGLE TICKET BY ID (SAME NAME)
////////////////////////////////////////////////////////////

exports.getSupportTicketsByUserIds = async (req, res) => {
  try {
    const ticket = await HelpSupport.findById(req.params.id);

    if (!ticket)
      return res.status(404).json({ message: 'Ticket not found' });

    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

////////////////////////////////////////////////////////////
// ✅ REPLY TO SUPPORT TICKET (SAME EXPORT NAME)
////////////////////////////////////////////////////////////

exports.replyToSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { sender, content } = req.body;

    if (!sender || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender and content are required'
      });
    }

    const ticket = await HelpSupport.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // ✅ Push user/admin message
    ticket.messages.push({
      sender,
      content
    });

  if (sender === "user") {
  const botReply = generateBotReply(content, ticket.messages);

  if (botReply) {
    ticket.messages.push({
      sender: "bot",
      content: botReply
    });
  }
}

    await ticket.save();

    res.status(200).json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error replying to support ticket:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
