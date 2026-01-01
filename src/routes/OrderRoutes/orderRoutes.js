const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/OrderController/AddOrderController');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Juspay, APIError } = require('expresscheckout-nodejs');

// Create a new order with payment
router.post('/createOrder', OrderController.createOrder);

router.put('/orderUpdate/:id', OrderController.updateOrderById);

router.put('/taskupdateOrderById/:id', OrderController.taskupdateOrderById);

router.delete('/deleteOrder/:id', OrderController.deleteOrderById);

router.get('/orderGetById/:id', OrderController.getByOrderID);


router.get('/OrderlistById/:id', OrderController.getAllOrder);

router.get('/Orderlist', OrderController.getAllOrderList);

router.get('/TaskList/:id', OrderController.getAllTaskListForToday);


router.get('/Dashboardlist', OrderController.getAllDashboard);


router.post('/orders', OrderController.createOrderWithRazorpay);

router.post('/tasks-today', OrderController.getAllTaskListForTodays);

router.get('/tasks-today-list/tasks', OrderController.getTodayTasksOnlyForSuperAdmin);

router.post('/trackStatusById', OrderController.OrderStatusById);

router.post('/ChangeOrder', OrderController.ChangeOrderStatusById);

router.post('/ordersCancel', OrderController.CancelOrderById);

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
  const returnUrl = `${req.protocol}://${req.get('host')}/api/orders/payment-success`;

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

// ===== Utility functions =====
function makeError(message) {
  return { message: message || 'Something went wrong' };
}

function makeJuspayResponse(successRspFromJuspay) {
  if (!successRspFromJuspay) return successRspFromJuspay;
  if (successRspFromJuspay.http) delete successRspFromJuspay.http;
  return successRspFromJuspay;
}



// router.post('/hdfc/create-order', async (req, res) => {
//   try {
//     const { totalAmount, userId, cart } = req.body;

//     // Create unique order ID
//     const orderId = 'ORD' + Date.now();

//     const payload = {
//       merchantId: 'SG3531', // or process.env.HDFC_MERCHANT_ID
//       orderId,
//       amount: totalAmount * 100, // in paise
//       currency: 'INR',
//       redirectUrl: 'https://yourdomain.com/hdfc/callback',
//       customerEmail: 'sadamhussain4752@gmail.com',
//       customerMobile: '9629283625',
//     };

//     // Base64 auth header
//     const auth = Buffer.from(`${process.env.HDFC_CLIENT_ID}:${process.env.HDFC_CLIENT_SECRET}`).toString('base64');

//     // Axios request
//     const response = await axios.post(
//       'https://pg-uat.smartgateway.hdfcbank.com/api/orders', // Sandbox URL
//       payload,
//       {
//         headers: {
//           'Authorization': `Basic ${auth}`,
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000, // 10 seconds timeout
//       }
//     );

//     const data = response.data;

//     if (!data.paymentUrl) {
//       return res.status(400).json({ error: 'Failed to create HDFC order', data });
//     }

//     // Optionally save order in DB here (orderId, userId, cart, status=pending)

//     res.json({ paymentUrl: data.paymentUrl, orderId });
//   } catch (err) {
//     console.error('HDFC create-order error:', err.message || err);
//     if (err.response) {
//       // Axios error with response
//       return res.status(err.response.status).json({ error: err.response.data });
//     }
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = router;
