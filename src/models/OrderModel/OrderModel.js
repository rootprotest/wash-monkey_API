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
      formwash: { type: Boolean, default: false },

    }
  ],

});

OrderSchema.statics.updateOverdueTasks = async function () {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1️⃣ Update tasks scheduled for today
    await this.updateMany(
      {},
      {
        $set: {
          "tasks.$[elem].status":
            "Our service person will be assigned to you today",
            "task_assign_person": "Our service person will be assigned to you today",
        },
      },
      {
        arrayFilters: [
          {
            $and: [
              { "elem.assign_date": { $gte: today, $lt: tomorrow } },
              { "elem.is_done": false },
              { "elem.time_complete": null },
              { $or: [{ "elem.status": null }, { "elem.status": "" }] },
            ],
          },
        ],
      }
    );

    // 2️⃣ Update overdue tasks not done
    await this.updateMany(
      {},
      {
        $set: {
          "tasks.$[elem].status": "Service not done",
          "tasks.$[elem].task_assign_person": "Service not done",
        },
      },
      {
        arrayFilters: [
          {
            $and: [
              { "elem.assign_date": { $lt: today } },
              { "elem.is_done": false },
              { "elem.time_complete": null },
              { $or: [{ "elem.status": null }, { "elem.status": "" }] },
            ],
          },
        ],
      }
    );

    // 3️⃣ Update order status based on tasks
    const orders = await this.find();

    for (const order of orders) {
      const allTasksCompletedOrOverdue =
        order.tasks.length > 0 &&
        order.tasks.every(
          (task) =>
            task.is_done ||
            (task.assign_date && new Date(task.assign_date) < tomorrow)
        );

      order.paymentStatus = allTasksCompletedOrOverdue ? "Completed" : "Confirmed";

      await order.save();
    }

    console.log("Overdue tasks and order status updated successfully");
  } catch (error) {
    console.error("Error updating tasks and orders:", error);
  }
};
OrderSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const Order = this.constructor;

      // Count previous orders of the user
      const userOrderCount = await Order.countDocuments({ userId: this.userId });

      if (userOrderCount === 0) {
        // First order: set only the last task's formwash = true
        if (this.tasks.length > 0) {
          this.tasks = this.tasks.map((task, index) => ({
            ...task.toObject ? task.toObject() : task,
            formwash: index === this.tasks.length - 1 ? true : false,
          }));
        }
      } else if (userOrderCount === 1) {
        // Second order: set only the first task's formwash = true
        if (this.tasks.length > 0) {
          this.tasks = this.tasks.map((task, index) => ({
            ...task.toObject ? task.toObject() : task,
            formwash: index === 0 ? true : false,
          }));
        }
      } else {
        // All subsequent orders: formwash = false
        this.tasks = this.tasks.map((task) => ({
          ...task.toObject ? task.toObject() : task,
          formwash: false,
        }));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
