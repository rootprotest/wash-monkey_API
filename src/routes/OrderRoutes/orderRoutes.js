const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/OrderController/AddOrderController');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Juspay, APIError } = require('expresscheckout-nodejs');
const Order = require("../../models/OrderModel/OrderModel");

// Create a new order with payment
router.post('/createOrder', OrderController.createOrder);


router.post('/createOrderweb', OrderController.createOrderweb);


router.put('/orderUpdate/:id', OrderController.updateOrderById);

router.put('/taskupdateOrderById/:id', OrderController.taskupdateOrderById);


router.put('/rescheduleTaskOrderById/:id', OrderController.rescheduleTaskOrderById);

router.patch(
  '/rescheduleFormwashTask/:userId/:orderId/:taskId',
  OrderController.rescheduleFormwashTask
);
router.delete('/deleteOrder/:id', OrderController.deleteOrderById);

router.get('/orderGetById/:id', OrderController.getByOrderID);


router.get('/OrderlistById/:id', OrderController.getAllOrder);

router.get('/Orderlist', OrderController.getAllOrderList);

router.get('/TaskList/:id', OrderController.getAllTaskListForToday);


router.get('/Dashboardlist', OrderController.getAllDashboard);


router.post('/orders', OrderController.createOrderWithRazorpay);

router.post('/tasks-today', OrderController.getAllTaskListForTodays);

router.put('/customer-not-available', OrderController.customerNotAvailable);

router.get('/tasks-today-list/tasks', OrderController.getTodayTasksOnlyForSuperAdmin);

router.post('/trackStatusById', OrderController.OrderStatusById);

router.post('/ChangeOrder', OrderController.ChangeOrderStatusById);

router.post('/ordersCancel', OrderController.CancelOrderById);

router.put("/ordernote/:id/note", OrderController.updateOrderNote);

router.post("/task/create", OrderController.createOrderTask);

// router.post('/verify-payment-web', OrderController.verifyPaymentWeb);
router.delete(
  "/task/delete/:order_id/:task_id",
  OrderController.deleteTask
);


// ===== HDFC Direct API (Old method) =====
// router.post('/hdfc/create-order', async (req, res) => {
//   try {
//     const { totalAmount, userId, cart } = req.body;

//     const orderId = 'ORD' + Date.now();

//     const payload = {
//       merchantId: 'SG3531',
//       orderId,
//       amount: totalAmount * 100,
//       currency: 'INR',
//       redirectUrl: 'https://yourdomain.com/hdfc/callback',
//       customerEmail: 'sadamhussain4752@gmail.com',
//       customerMobile: '9629283625',
//     };

//     const auth = Buffer.from(`${process.env.HDFC_CLIENT_ID}:${process.env.HDFC_CLIENT_SECRET}`).toString('base64');

//     const response = await axios.post(
//       'https://pg-uat.smartgateway.hdfcbank.com/api/orders',
//       payload,
//       {
//         headers: {
//           Authorization: `Basic ${auth}`,
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000,
//       }
//     );

//     const data = response.data;

//     if (!data.paymentUrl) {
//       return res.status(400).json({ error: 'Failed to create HDFC order', data });
//     }

//     res.json({ paymentUrl: data.paymentUrl, orderId });
//   } catch (err) {
//     console.error('HDFC create-order error:', err.message || err);
//     if (err.response) {
//       return res.status(err.response.status).json({ error: err.response.data });
//     }
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// ===== JUSPAY HDFC (Recommended method using SDK) =====

// Environment setup
const SANDBOX_BASE_URL = "https://smartgatewayuat.hdfcbank.com";
const PRODUCTION_BASE_URL = "https://smartgateway.hdfcbank.com";

// Load config
const config = require('../../../config.json'); // Make sure path is correct

const publicKey = fs.readFileSync(config.PUBLIC_KEY_PATH);
const privateKey = fs.readFileSync(config.PRIVATE_KEY_PATH);
const paymentPageClientId = config.PAYMENT_PAGE_CLIENT_ID;

// Initialize Juspay SDK
const juspay = new Juspay({
  merchantId: config.MERCHANT_ID,
  baseUrl: PRODUCTION_BASE_URL,
  jweAuth: {
    keyId: config.KEY_UUID,
    publicKey,
    privateKey,
  },
});

// ===== ROUTE: Initiate Juspay Payment =====
router.post('/hdfc/create-order', async (req, res) => {
  const orderId = req.body.order_id || `order_${Date.now()}`;
  const amount = req.body.amount || 100; // Use amount from body or fallback
  const returnUrl = `${req.protocol}://${req.get('host')}/api/payment-success`;

  try {
    const sessionResponse = await juspay.orderSession.create({
      order_id: orderId,
      amount,
      payment_page_client_id: paymentPageClientId,
      customer_id: req.body.userId || 'guest_user',
      action: 'paymentPage',
      return_url: returnUrl,
      currency: 'INR',
    });
    console.log(sessionResponse,"sessionResponse");
    
      return res.json({ paymentUrl:makeJuspayResponse(sessionResponse), orderId });
    // return res.json(makeJuspayResponse(sessionResponse));
  } catch (error) {
    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }
    return res.json(makeError());
  }
});


router.post('/hdfc/create-order-web', async (req, res) => {
  const { order_id, amount, userId } = req.body;

  // ❌ DO NOT auto-generate
  if (!order_id) {
    return res.status(400).json({ success: false, message: "order_id required" });
  }

  // ✅ FRONTEND SUCCESS PAGE
  const returnUrl = `https://www.washmonkey.in/payment-success?orderId=${order_id}`;

  try {
    const sessionResponse = await juspay.orderSession.create({
      order_id: order_id, // 🔥 DB ORDER ID
      amount,
      payment_page_client_id: paymentPageClientId,
      customer_id: userId || 'guest_user',
      action: 'paymentPage',
      return_url: returnUrl,
      currency: 'INR',
    });

    console.log("JUSPAY SESSION:", sessionResponse);

    return res.json({
      paymentUrl: makeJuspayResponse(sessionResponse),
      orderId: order_id
    });

  } catch (error) {
    console.error("JUSPAY ERROR:", error);

    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }

    return res.json(makeError());
  }
});
// ===== ROUTE: Handle Juspay Response =====
router.post('/payment-success', async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  if (!orderId) return res.json(makeError('order_id not present or cannot be empty'));

  try {
    const statusResponse = await juspay.order.status(orderId);
    return res.send(makeJuspayResponse(statusResponse));
  } catch (error) {
    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }
    return res.json(makeError());
  }
});


router.post('/payment-callback', async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;

  if (!orderId) {
    return res.redirect('myapp://payment-failed');
  }

  try {
    const statusResponse = await juspay.order.status(orderId);
    const status = statusResponse.status;

    console.log('JUSPAY STATUS:', statusResponse);

    // ✅ SUCCESS
    if (status === 'CHARGED') {
      return res.redirect(`myapp://payment-success?orderId=${orderId}`);
    }

    // ❌ FAILED
    if (status === 'FAILED') {
      return res.redirect(`myapp://payment-failed?orderId=${orderId}`);
    }

    // ⚠️ CANCELLED
    if (status === 'CANCELLED') {
      return res.redirect(`myapp://payment-cancelled?orderId=${orderId}`);
    }

    // ⏳ PENDING
    return res.redirect(`myapp://payment-pending?orderId=${orderId}`);
  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect('myapp://payment-error');
  }
});

const sendOrderConfirmSMS = async (mobileNumber, customerName, orderId, bookingTime) => {
  const apiKey = "6FlAGamNys0B4OxZ";
  const senderId = "WASHMO";

  const message =
    `Hello ${customerName}, your Wash Monkey Service request ${orderId} ` +
    `is confirmed for ${bookingTime}. Will be at your location as scheduled. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;

  const url = `http://app.mydreamstechnology.in/vb/apikey.php` +
    `?apikey=${apiKey}` +
    `&senderid=${senderId}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("Order Confirm SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Order SMS failed:", error.message);
  }
};


/* ===========================
   3️⃣ VERIFY PAYMENT (API FOR APP)
=========================== */

router.post('/verify-payment', async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json(makeError('orderId required'));
  }

  try {
    const statusResponse = await juspay.order.status(orderId);

    const status = statusResponse.status;

    if (status === 'CHARGED') {
      return res.json({
        success: true,
        status: 'SUCCESS',
        data: makeJuspayResponse(statusResponse),
      });
    }

    if (status === 'FAILED') {
      return res.json({
        success: false,
        status: 'FAILED',
        reason: statusResponse.error_message,
      });
    }

    if (status === 'CANCELLED') {
      return res.json({
        success: false,
        status: 'CANCELLED',
      });
    }

    return res.json({
      success: false,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json(makeError('Verification failed'));
  }
});
router.post('/verify-payment-web', async (req, res) => {
  const { orderId } = req.body;

  try {
    const statusResponse = await juspay.order.status(orderId);
    const status = statusResponse.status;

    console.log("JUSPAY STATUS:", statusResponse);

    const order = await Order.findById(orderId).populate("userId");

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // ================= SUCCESS =================
    if (status === "CHARGED") {

      // ✅ Prevent duplicate update
      if (order.paymentStatus !== "Confirmed") {

        order.paymentStatus = "Confirmed";
        order.status = "Confirmed";

        await order.save();

        const user = order.userId;

        if (user) {
          const newPoints =
            Number(user.loyalty_point || 0) - Number(order.walletamount || 0);

          user.loyalty_point = Math.max(newPoints, 0);
          await user.save();

          await sendOrderConfirmSMS(
            user.mobilenumber,
            user.firstname || "Customer",
            order._id,
            "Confirmed",
            order.bookingTime
          );
        }
      }

      return res.json({
        success: true,
        status: "SUCCESS",
        order
      });
    }

    // ================= FAILED =================
    if (status === "FAILED" || status === "CANCELLED") {

      console.log("❌ Payment Failed → Removing Order:", orderId);

      await Order.findByIdAndDelete(orderId);

      return res.json({
        success: false,
        status,
        message: "Order deleted due to failed payment"
      });
    }

    // ================= PENDING =================
    return res.json({
      success: false,
      status: "PENDING"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/* ===========================
   UTILITY FUNCTIONS
=========================== */

function makeError(message) {
  return { success: false, message: message || 'Something went wrong' };
}



function makeJuspayResponse(successRspFromJuspay) {
  if (!successRspFromJuspay) return successRspFromJuspay;
  if (successRspFromJuspay.http) delete successRspFromJuspay.http;
  return successRspFromJuspay;
}



module.exports = router;
