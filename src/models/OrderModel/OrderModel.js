const mongoose = require("mongoose");

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
    enum: ["Cash", "Card", "Online"], // Or replace with ["Home Delivery", "Online"] if it refers to delivery method
    default: "Online",
  },
  createdAt: { type: Date, default: Date.now },
  razorpay_payment_id: { type: String, required: true },
  exta_message: { type: String },
  exta_add_item: { type: String },
  applycoupon: { type: String },
  shipment_id: { type: String },
  bookingTime: { type: String },

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
      task_id: { type: String },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      date: { type: Date }, // System date
      assign_date: { type: Date }, // Scheduled task date
      time_complete: { type: Date },
      is_done: { type: Boolean, default: false },
    },
  ],
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
