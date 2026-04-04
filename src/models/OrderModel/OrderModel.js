const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  task_id: {
    type: String
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  task_assign_person: {
    type: String
  },

  assign_id: {
    type: String
  },

  status: {
    type: String,
    default: ""
  },

  date: {
    type: Date,
    default: Date.now
  },

  assign_date: {
    type: Date
  },

  time_complete: {
    type: Date,
    default: null
  },

  is_done: {
    type: Boolean,
    default: false
  },

  interior: {
    type: Boolean,
    default: false
  },

  exterior: {
    type: Boolean,
    default: true
  },

  formwash: {
    type: Boolean,
    default: false
  }

});

const OrderSchema = new mongoose.Schema({

  orderNumber: {
    type: String,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },

  productIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true
    }
  ],

  quantity: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  walletamount: {
    type: Number,
    default: 0
  },

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
      "Awaiting Review",
      "Customer Not Available"
    ],
    default: "Pending",
  },

  orderStatus: {
    type: String,
    enum: [
      "Order Placed",
      "Confirmed",
      "Technician Assigned",
      "En Route",
      "Arrived",
      "In Progress",
      "Completed",
      "Cancelled",
      "Rescheduled",
      "No Show",
      "Customer Not Available",
      "Awaiting Review"
    ],
    default: "Order Placed"
  },

  delivery: {
    type: String,
    enum: ["Cash", "Card", "Online", "UPI", "Wallet", "NetBanking"],
    default: "Online"
  },

  bookingTime: {
    type: String
  },

  vehicleId: {
    type: String
  },

  razorpay_payment_id: {
    type: String,
    unique: true,
    sparse: true
  },
   orderDisplayId: {
    type: String,
  },

  shipment_id: {
    type: String
  },

  applycoupon: {
    type: String
  },

  note: {
    type: String,
    default: ""
  },

  extraMessage: {
    type: String
  },

  extraAddItem: {
    type: String
  },

  interior: {
    type: Number,
    default: 0
  },
  formwashcount: {
    type: Number,
    default: 0
  },
  tasks: [TaskSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }

});



/* -----------------------------------------------------
INDEXES (for performance)
----------------------------------------------------- */

OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "tasks.assign_date": 1 });



/* -----------------------------------------------------
AUTO GENERATE ORDER NUMBER
----------------------------------------------------- */

OrderSchema.pre("save", function (next) {

  if (!this.orderNumber) {
    this.orderNumber = "ORD-" + Date.now();
  }

  next();
});



/* -----------------------------------------------------
FORMWASH LOGIC
----------------------------------------------------- */

OrderSchema.pre("save", async function (next) {

  try {

    if (this.isNew) {

      const Order = this.constructor;

      const userOrderCount = await Order.countDocuments({
        userId: this.userId
      });

      if (this.tasks.length > 0) {

        if (userOrderCount === 0) {

          // First order -> last task formwash true
          this.tasks = this.tasks.map((task, index) => ({
            ...task.toObject ? task.toObject() : task,
            formwash: index === this.tasks.length - 1
          }));

        }

        else if (userOrderCount === 1) {

          // Second order -> first task formwash true
          this.tasks = this.tasks.map((task, index) => ({
            ...task.toObject ? task.toObject() : task,
            formwash: index === 0
          }));

        }

        else {

          // Other orders -> formwash false
          this.tasks = this.tasks.map((task) => ({
            ...task.toObject ? task.toObject() : task,
            formwash: false
          }));

        }

      }

    }

    next();

  } catch (error) {

    next(error);

  }

});



/* -----------------------------------------------------
UPDATE OVERDUE TASKS
----------------------------------------------------- */

OrderSchema.statics.updateOverdueTasks = async function () {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    /* ======================================================
       1️⃣ TODAY TASKS → SET CONFIRMED (IF NOT DONE)
    ====================================================== */
    await this.updateMany(
      {
        "tasks.assign_date": { $gte: today, $lt: tomorrow },
        paymentStatus: { $ne: "Completed" }
      },
      {
        $set: {
          "tasks.$[elem].status": "Our service person will be assigned to you today",
          "tasks.$[elem].task_assign_person": "Our service person will be assigned to you today",
          paymentStatus: "Confirmed"
        }
      },
      {
        arrayFilters: [
          {
            "elem.assign_date": { $gte: today, $lt: tomorrow },
            "elem.is_done": false,
            "elem.time_complete": null
          }
        ]
      }
    );

    /* ======================================================
       2️⃣ OVERDUE TASKS → MARK AS NOT DONE
    ====================================================== */
    await this.updateMany(
      {
        "tasks.assign_date": { $lt: today },
        paymentStatus: { $ne: "Completed" }
      },
      {
        $set: {
          "tasks.$[elem].status": "Service not done",
          "tasks.$[elem].task_assign_person": "Service not done"
        }
      },
      {
        arrayFilters: [
          {
            "elem.assign_date": { $lt: today },
            "elem.is_done": false,
            "elem.time_complete": null
          }
        ]
      }
    );

    /* ======================================================
       3️⃣ 🔥 FIX: RESET WRONG COMPLETED (FUTURE TASK EXISTS)
    ====================================================== */
    await this.updateMany(
      {
        paymentStatus: "Completed",
        tasks: {
          $elemMatch: {
            is_done: false,
            time_complete: null,
            assign_date: { $gte: today } // today + future
          }
        }
      },
      {
        $set: {
          paymentStatus: "Confirmed"
        }
      }
    );

    /* ======================================================
       4️⃣ ✅ MARK COMPLETED ONLY IF ALL TASKS DONE
    ====================================================== */
    await this.updateMany(
      {
        tasks: {
          $not: {
            $elemMatch: {
              is_done: false
            }
          }
        }
      },
      {
        $set: {
          paymentStatus: "Completed"
        }
      }
    );

    console.log("✅ Task status & order status updated successfully");

  } catch (error) {
    console.error("❌ Error updating tasks:", error);
  }
};


/* -----------------------------------------------------
MODEL EXPORT
----------------------------------------------------- */

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;