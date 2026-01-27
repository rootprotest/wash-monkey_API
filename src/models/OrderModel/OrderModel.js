const mongoose = require("mongoose");
const { assign } = require("nodemailer/lib/shared");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  productIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  ],

  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
      "On Hold",
      "Completed",
      "Failed",
      "Returned",
      "Order Placed",
      "Confirmed",
      "Out for Delivery",
      "Scheduled",
      "Scheduled",
      "Accepted",
      "Technician Assigned",
      "En Route",
      "Arrived",
      "In Progress",
      "Completed",
      "Payment Pending",
      "Payment Received",
      "Cancelled by User",
      "Cancelled by Technician",
      "Rescheduled",
      "No Show",
      "Awaiting Review"
    ],
    default: "Pending",
  },
 delivery: {
  type: String,
  enum: ["Cash", "Card", "Online", "UPI", "Wallet", "NetBanking"],
  default: "Online",
},

  interior: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  razorpay_payment_id: { type: String,  unique: true, },
  exta_message: { type: String },
  exta_add_item: { type: String },
  applycoupon: { type: String },
  shipment_id: { type: String },
  bookingTime: { type: String },
  vehicleId: { type: String },
  walletamount: { type: Number, default: 0 },
  note: {
  type: String,
  default: "",
},

  quantity: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],

  tasks: [
    {
      task_id: { type: String }, // Assuming task_id is always needed
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",

      },
      task_assign_person: { type: String, }, // Add required if necessary
      assign_id: { type: String }, // Same here
      status: { type: String }, // Same here
      date: { type: Date, default: Date.now }, // System date (default to now)
      assign_date: { type: Date, }, // Scheduled task date
      time_complete: { type: Date, default: null },
      is_done: { type: Boolean, default: false },
      interior: { type: Boolean, default: false },
      exterior: { type: Boolean, default: true },

    }
  ],

});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
