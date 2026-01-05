const Order = require("../../models/OrderModel/OrderModel");
const Product = require("../../models/ProductModel/NewModelProduct");
const User = require("../../models/UserModel/User");
const Address = require("../../models/Address/AddressModel");
const moment = require("moment");
const axios = require("axios");
const Rating = require("../../models/AddRating/RatingModel");
const Vehicle = require('../../models/AddVehicle/VehicleModel');

const ActivityLog = require('../../models/Activity/activity')
const PAYMENTSTATUS = {
  1: "Completed",
  2: "Pending",
};
const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Canceled",
  "Refunded",
  "On Hold",
  "Completed",
  "Failed",
  "Returned",
];

const CONFIRM_STATUSES = [
  "Confirmed",
  "Order Placed",
  "Scheduled",
  "Rescheduled",
  "Pending",
];

const ACCEPT_STATUSES = [
  "Accepted",
  "Technician Assigned"
];

const ENROUTE_STATUSES = [
  "En Route",
  "Out for Delivery",
  "Arrived"
];

const INPROGRESS_STATUSES = [
  "In Progress",
  "Processing"
];

const COMPLETED_STATUSES = [
  "Completed",
  "Delivered",
  "Awaiting Review"
];

const PAYMENT_FAILED_STATUSES = [
  "Failed",
  "Payment Failed",
  "Payment Pending"
];

const CANCELLED_STATUSES = [
  "Cancelled",
  "Cancelled by User",
  "Cancelled by Technician",
  "No Show"
];

const REFUND_STATUSES = [
  "Refunded",
  "Returned"
];


const SMS_API_KEY = "6FlAGamNys0B4OxZ";
const SMS_SENDER_ID = "WASHMO";
const SMS_API_URL = "http://app.mydreamstechnology.in/vb/apikey.php";

const getAddressById = async (id) => {
  try {
    return await Address.findById(id);
  } catch (error) {
    console.error(`Error fetching address by ID: ${error}`);
    throw new Error('Error fetching address');
  }
};

const checkServiceability = async (pickupPostcode, deliveryPostcode, codType) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=1&cod=${codType}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ2OTk5MDUsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzIxMzc1Mzg5LCJqdGkiOiJ0eXVZeDJ0ODhqNU9iWFBZIiwiaWF0IjoxNzIwNTExMzg5LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTcyMDUxMTM4OSwiY2lkIjozMjAwNzYzLCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.qXnGNAwsquTSFPtfKmr083gwCg9XRNAPcXUaqzxI6v0'
    }
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error checking serviceability: ${error}`);
    throw new Error('Error checking serviceability');
  }
};
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const createOrderPayload = async (address, newOrderList, productPromises) => {
  const currentDate = new Date();

  return JSON.stringify({
    "order_id": newOrderList._id,
    "order_date": formatDate(currentDate),
    "pickup_location": "Godwn",
    "channel_id": "",
    "comment": "Reseller: M/s Winterbear",
    "billing_customer_name": address.fullName,
    "billing_last_name": address.companyName,
    "billing_address": address.typeAddress,
    "billing_address_2": "",
    "billing_city": address.city,
    "billing_pincode": address.pinCode,
    "billing_state": address.state,
    "billing_country": "India",
    "billing_email": address.email,
    "billing_phone": address.phone,
    "shipping_is_billing": true,
    "shipping_customer_name": "",
    "shipping_last_name": "",
    "shipping_address": "",
    "shipping_address_2": "",
    "shipping_city": "",
    "shipping_pincode": "",
    "shipping_country": "",
    "shipping_state": "",
    "shipping_email": "",
    "shipping_phone": "",
    "order_items": await Promise.all(productPromises),
    "payment_method": "Prepaid",
    "shipping_charges": 0,
    "giftwrap_charges": 0,
    "transaction_charges": 0,
    "total_discount": 0,
    "sub_total": newOrderList.totalAmount,
    "length": 10,
    "breadth": 15,
    "height": 20,
    "weight": 2.5
  });
};

const placeOrder = async (payload) => {
  console.log(payload, "payload");
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ2OTk5MDUsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzIxMzc1Mzg5LCJqdGkiOiJ0eXVZeDJ0ODhqNU9iWFBZIiwiaWF0IjoxNzIwNTExMzg5LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTcyMDUxMTM4OSwiY2lkIjozMjAwNzYzLCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.qXnGNAwsquTSFPtfKmr083gwCg9XRNAPcXUaqzxI6v0'
    },
    data: payload
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error placing order: ${error}`);
    throw new Error('Error placing order');
  }
};

const onTrackOrder = async (trackId) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${trackId}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ2OTk5MDUsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzIxMzc1Mzg5LCJqdGkiOiJ0eXVZeDJ0ODhqNU9iWFBZIiwiaWF0IjoxNzIwNTExMzg5LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTcyMDUxMTM4OSwiY2lkIjozMjAwNzYzLCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.qXnGNAwsquTSFPtfKmr083gwCg9XRNAPcXUaqzxI6v0'
    }
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error tracking order: ${error}`);
    return error;
    throw new Error('Error tracking order');
  }
};


const CancelTrackOrder = async (trackId) => {
  const data = JSON.stringify({ track_id: trackId });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://apiv2.shiprocket.in/v1/external/orders/cancel',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ2OTk5MDUsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzE5MjA2ODYzLCJqdGkiOiJSM3NqUkhSc1ViY2ZFZ3EyIiwiaWF0IjoxNzE4MzQyODYzLCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTcxODM0Mjg2MywiY2lkIjozMjAwNzYzLCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3NfY29kZSI6IiJ9.vyjLdX9fmND3UhrrpA-p-5ZNHZZHCMBEwDH7aBRfSdA'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data; // Return the response data
  } catch (error) {
    return error; // Return the response data
    console.log(error);
    throw error; // Throw the error to be handled by the calling function
  }
};

const onChangeTrackOrder = async (trackId) => {
  const data = JSON.stringify({ track_id: trackId });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ2OTk5MDUsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzE5MjA2ODYzLCJqdGkiOiJSM3NqUkhSc1ViY2ZFZ3EyIiwiaWF0IjoxNzE4MzQyODYzLCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTcxODM0Mjg2MywiY2lkIjozMjAwNzYzLCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3NfY29kZSI6IiJ9.vyjLdX9fmND3UhrrpA-p-5ZNHZZHCMBEwDH7aBRfSdA'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data; // Return the response data
  } catch (error) {
    return error; // Return the response data
    console.log(error);
    throw error; // Throw the error to be handled by the calling function
  }
};
const onCreateOrder = async (addressId, codType, newOrderList) => {
  try {
    const address = await getAddressById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    const serviceabilityData = await checkServiceability('560102', address.pinCode, codType);

    if (Object.keys(serviceabilityData).length === 0) {
      throw new Error('Service not available');
    }

    const productPromises = newOrderList.quantity.map(async (productIds) => {
      const product = await Product.findById(productIds.productId);
      return {
        "name": product.name,
        "sku": product.sku,
        "units": productIds.quantity,
        "selling_price": product.amount,
        "discount": product.offeramount,
        "tax": "",
        "hsn": 441122
      };
    });

    const payload = await createOrderPayload(address, newOrderList, productPromises);
    const orderResponse = await placeOrder(payload);
    return orderResponse
    console.log(orderResponse);
  } catch (error) {
    console.error(`Error creating order: ${error}`);
  }
};

const sendPaymentFailedSMS = async (
  mobileNumber,
  customerName,
  amount,
  orderId
) => {
  const message =
    `Dear ${customerName}, payment of Rs.${amount} for Car Wash Service ` +
    `request ${orderId} failed. Please retry or use another method. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;

  const url =
    `${SMS_API_URL}` +
    `?apikey=${SMS_API_KEY}` +
    `&senderid=${SMS_SENDER_ID}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("Payment Failed SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Payment Failed SMS Error:", error.message);
  }
};

const sendOrderCompletedSMS = async (
  mobileNumber,
  customerName,
  orderId,
  status
) => {
  const message =
    `Hi ${customerName}, your Wash Monkey Service request ${status} ` +
    `has been successfully completed. Thank you for choosing us. ` +
    `- WASHIMONKI`;

  const url =
    `${SMS_API_URL}` +
    `?apikey=${SMS_API_KEY}` +
    `&senderid=${SMS_SENDER_ID}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("Order Completed SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Order Completed SMS Error:", error.message);
  }
};


const sendOrderAcceptedSMS = async (mobileNumber, customerName, orderId, bookingTime) => {
  const apiKey = "6FlAGamNys0B4OxZ";
  const senderId = "WASHMO";

 const message =
    `Hello ${customerName}, your Wash Monkey Service request ${orderId} ` +
    `is confirmed for ${bookingTime}. Will be at your location as scheduled. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;

  const url =
    `http://app.mydreamstechnology.in/vb/apikey.php` +
    `?apikey=${apiKey}` +
    `&senderid=${senderId}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    await axios.get(url);
    console.log("Order Accepted SMS sent");
  } catch (error) {
    console.error("Accepted SMS failed:", error.message);
  }
};


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
const sendOrderCancelledSMS = async (
  mobileNumber,
  customerName,
  orderId,
  reason
) => {


     const message =
    `Hello ${customerName}, your Wash Monkey Service request ${reason} ` +
    `is confirmed for ${reason ? ` (${reason})` : ""}. Will be at your location as scheduled. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;

  const url =
    `${SMS_API_URL}` +
    `?apikey=${SMS_API_KEY}` +
    `&senderid=${SMS_SENDER_ID}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("Order Cancelled SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Order Cancelled SMS Error:", error.message);
  }
};


const sendRefundSMS = async (
  mobileNumber,
  customerName,
  orderId,
  amount
) => {
  const message =
    `Dear ${customerName}, payment of Rs.${amount} for Car Wash Service ` +
    `request ${orderId} failed. Please retry or use another method. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;

  const url =
    `${SMS_API_URL}` +
    `?apikey=${SMS_API_KEY}` +
    `&senderid=${SMS_SENDER_ID}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("Refund SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Refund SMS Error:", error.message);
  }
};

const sendEnRouteSMS = async (
  mobileNumber,
  customerName,
  orderId,
  status
) => {
   const message =
    `Hello ${customerName}, your Wash Monkey Service request ${status} ` +
    `is confirmed for ${mobileNumber}. Will be at your location as scheduled. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;
  const url =
    `${SMS_API_URL}` +
    `?apikey=${SMS_API_KEY}` +
    `&senderid=${SMS_SENDER_ID}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("En Route SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("En Route SMS Error:", error.message);
  }
};

const sendInProgressSMS = async (
  mobileNumber,
  customerName,
  orderId,
  amount
) => {
   const message =
    `Dear ${customerName}, payment of Rs.${amount} for Car Wash Service ` +
    `request ${orderId} failed. Please retry or use another method. ` +
    `Visit https://washmonkey.in - WASHIMONKI`;

  const url =
    `${SMS_API_URL}` +
    `?apikey=${SMS_API_KEY}` +
    `&senderid=${SMS_SENDER_ID}` +
    `&number=${mobileNumber}` +
    `&message=${encodeURIComponent(message)}`;

  try {
    const response = await axios.get(url);
    console.log("In Progress SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("In Progress SMS Error:", error.message);
  }
};


exports.createOrder = async (req, res) => {
  try {
    const { userId, addressId, productIds, totalAmount, delivery, razorpay_payment_id, paymentStatus, applycoupon, quantity, tasks, bookingTime, walletamount,interior,vehicleId } = req.body;

    const newOrder = await Order.create({
      userId,
      addressId,
      productIds,
      totalAmount,
      paymentStatus,
      delivery,
      razorpay_payment_id,
      applycoupon,
      quantity,
      tasks,
      bookingTime,
      walletamount,
      interior,
      vehicleId
    });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const newPoints = Number(user.loyalty_point || 0) - Number(walletamount || 0);
    user.loyalty_point = Math.max(newPoints, 0);
    await user.save();



    // const deliveryType = delivery === "Card" ? 1 : 0;
    // let orderResponses = await onCreateOrder(addressId, deliveryType, newOrder);
    // newOrder.shipment_id = orderResponses.shipment_id
    await newOrder.save();
 await sendOrderConfirmSMS(
      user.mobilenumber,
      user?.firstname || "Customer",
      paymentStatus,
      bookingTime
    );
    res.status(200).json({ success: true, order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


exports.getAllOrder = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.query;

    const filter = status
      ? { userId, paymentStatus: PAYMENTSTATUS[status] }
      : { userId };

    // 1️⃣ Fetch all orders
    const orders = await Order.find(filter)
      .select("_id userId paymentStatus createdAt totalAmount productIds tasks")
      .sort({ createdAt: -1 })
      .lean();

    if (orders.length === 0) {
      return res.status(200).json({ success: true, orders: [] });
    }

    // 2️⃣ Get all unique product IDs from all orders
    const allProductIds = [...new Set(orders.flatMap(order => order.productIds || []))];

    // 3️⃣ Fetch all products in a single query
    const products = await Product.find({ _id: { $in: allProductIds } })
      .select("_id name category") // pick only the fields you need
      .lean();

    // 4️⃣ Map products by ID for quick lookup
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // 5️⃣ Attach product details to each order
    const ordersWithProducts = orders.map(order => ({
      ...order,
      products: (order.productIds || []).map(id => productMap[id.toString()]).filter(Boolean)
    }));

    res.status(200).json({ success: true, orders: ordersWithProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


exports.getByOrderID = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Fetch all related data in parallel
    const [address, user, products, ratings, vehicle] = await Promise.all([
      Address.findById(order.addressId).lean(),
      User.findById(order.userId).lean(),
      Product.find({ _id: { $in: order.productIds } }).lean(),
      Rating.find({
        productId: { $in: order.productIds },
        userId: order.userId
      }).sort({ createdAt: -1 }).lean(),
      Vehicle.findById(order.vehicleId).lean(),
    ]);

    // Group ratings by productId
    const ratingMap = {};
    ratings.forEach(r => {
      const key = r.productId.toString();
      if (!ratingMap[key]) ratingMap[key] = [];
      ratingMap[key].push(r);
    });

    // Attach ratings to products
    const productsWithRatings = products.map(p => ({
      ...p,
      ratings: ratingMap[p._id.toString()] || []
    }));

    // Respond with all order info
    res.status(200).json({
      success: true,
      order: {
        ...order,
        address,
        user,
        vehicle,           // Include vehicle info
        products: productsWithRatings
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: error.message || "Server error" });
  }
};




exports.getAllOrderList = async (req, res) => {
  try {
    // Fetch all orders for the user
    const orderList = await Order.find().sort({ createdAt: -1 });



    // Create an array to store promises for fetching product details
    const orderPromises = orderList.map(async (order) => {
      // Fetch address details
      const address = await Address.findById(order.addressId);

      // Fetch user details
      const user = await User.findById(order.userId);

      // Fetch product details for each order item
      const productPromises = order.productIds.map(async (productId) => {
        const product = await Product.findById(productId);
        return product;
      });

      // Wait for all promises to resolve
      const productsWithDetails = await Promise.all(productPromises);

      return { ...order._doc, address, user, products: productsWithDetails };
    });

    // Wait for all promises to resolve
    const ordersWithDetails = await Promise.all(orderPromises);

    res.status(200).json({ success: true, orders: ordersWithDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAllTaskListForToday = async (req, res) => {
  try {
    // Get today's date as string for comparison
    const todayStr = new Date().toDateString();

    // Fetch all orders
    const allOrders = await Order.find();

    // Process each order
    const taskOrderPromises = allOrders.map(async (order) => {
      // Skip orders without tasks or if no task is assigned today
      if (!Array.isArray(order.tasks)) return null;

      const hasTodayTask = order.tasks.some(task => {
        const assignDate = new Date(task.assign_date).toDateString();
        return assignDate === todayStr;
      });

      if (!hasTodayTask) return null;

      // Fetch address and user
      const address = await Address.findById(order.addressId);
      const user = await User.findById(order.userId);

      // Fetch product details
      const productPromises = order.productIds.map(async (productId) => {
        const product = await Product.findById(productId);
        return product;
      });

      const productsWithDetails = await Promise.all(productPromises);

      return {
        ...order._doc,
        address,
        user,
        products: productsWithDetails,
      };
    });

    const ordersWithTodayTasks = await Promise.all(taskOrderPromises);

    // Filter out nulls (i.e., orders without tasks assigned today)
    const filteredOrders = ordersWithTodayTasks.filter(order => order !== null);

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.getAllTaskListForTodays = async (req, res) => {
  try {
    const { latitude: userLat, longitude: userLng, assign_id } = req.body; // lat/lng from client

    console.log(assign_id, "assign_id");

    const todayStr = new Date().toDateString();
    const allOrders = await Order.find();

    const taskOrderPromises = allOrders.map(async (order) => {
      if (!Array.isArray(order.tasks)) return null;

      const hasTodayTask = order.tasks.some((task) => {
        const assignDate = new Date(task.assign_date).toDateString();
        const isToday = assignDate === todayStr;

        if (assign_id) {
          const isAssignedToUser = task.assign_id?.toString() === assign_id;
          return isToday && isAssignedToUser;
        } else {
          const isStatusOk = order.paymentStatus === "Confirmed";
          return isToday && isStatusOk;
        }
      });


      if (!hasTodayTask) return null;

      const address = await Address.findById(order.addressId);
      const user = await User.findById(order.userId);

      const productPromises = order.productIds.map(productId => Product.findById(productId));
      const productsWithDetails = await Promise.all(productPromises);

      let distanceInKm = null;
      let googleMapUrl = null;

      if (userLat && userLng && address.latitude && address.longitude) {
        distanceInKm = haversineDistance(userLat, userLng, address.latitude, address.longitude).toFixed(2);
googleMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${address.latitude},${address.longitude}&travelmode=driving`;
      }

      return {
        ...order._doc,
        address,
        user,
        products: productsWithDetails,
        distanceInKm,
        googleMapUrl
      };
    });

    const ordersWithTodayTasks = await Promise.all(taskOrderPromises);
    const filteredOrders = ordersWithTodayTasks.filter(order => order !== null);

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// controllers/taskController.js

// superAdmin.controller.js
exports.getTodayTasksOnlyForSuperAdmin = async (req, res) => {
  try {
    const { date } = req.query; // ✅ date from client

    const targetDate = date
      ? new Date(date).toDateString()
      : new Date().toDateString(); // fallback = today

    const allOrders = await Order.find();

    const result = [];

    for (const order of allOrders) {
      if (!Array.isArray(order.tasks)) continue;

      // ✅ Filter tasks for selected date
      const filteredTasks = order.tasks.filter((task) => {
        return (
          task.assign_date &&
          new Date(task.assign_date).toDateString() === targetDate
        );
      });

      if (filteredTasks.length === 0) continue;

      const [address, user, products] = await Promise.all([
        Address.findById(order.addressId),
        User.findById(order.userId),
        Promise.all(order.productIds.map((id) => Product.findById(id))),
      ]);

      result.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        user,
        address,
        products,
        tasks: filteredTasks, // ✅ ONLY selected date tasks
      });
    }

    res.status(200).json({
      success: true,
      date: targetDate,
      totalOrders: result.length,
      totalTasks: result.reduce((sum, o) => sum + o.tasks.length, 0),
      orders: result,
    });
  } catch (error) {
    console.error("Today Task Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};





// Update a specific order by ID
// exports.updateOrderById = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const { status, delivery } = req.body;

//     // Check if the Order exists
//     const existingOrder = await Order.findById(orderId);

//     if (!existingOrder) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found" });
//     }

//     // Update the Order fields
//     existingOrder.paymentStatus = status; // Assuming 'status' is the field you want to update
//     existingOrder.delivery = delivery; // Assuming 'status' is the field you want to update

//     // Save the updated Order
//     const updatedOrder = await existingOrder.save();

//     res.status(200).json({ success: true, order: updatedOrder });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };



exports.updateOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const {
      status,
      task_id,
      task_assign_person,
      userId,
      taskTitle,
      taskDescription
    } = req.body;

    // 1️⃣ Find order
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2️⃣ Save old status BEFORE update
    const oldStatus = existingOrder.paymentStatus;

    // 3️⃣ Update order status
    if (status) {
      existingOrder.paymentStatus = status;
    }

    let updatedTask = null;

    // 4️⃣ Update task if provided
    if (task_id && task_assign_person) {
      const taskIndex = existingOrder.tasks.findIndex(
        (task) => task.task_id === task_id
      );

      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Task not found with the given ID",
        });
      }

      existingOrder.tasks[taskIndex].is_done = true;
      existingOrder.tasks[taskIndex].time_complete = new Date();
      existingOrder.tasks[taskIndex].assign_id = userId;
      existingOrder.tasks[taskIndex].task_assign_person = task_assign_person;

      updatedTask = existingOrder.tasks[taskIndex];
    }

    // 5️⃣ Save order
    const updatedOrder = await existingOrder.save();

    /* ===========================
       📩 SEND STATUS-BASED SMS
       =========================== */
   /* ===========================
   📩 SEND STATUS-BASED SMS
   =========================== */try {
  if (status && status !== oldStatus) {
    const user = await User.findById(updatedOrder.userId);

    if (!user || !user.mobilenumber) return;

    const customerName = user.firstname || user.name || "Customer";

    // ✅ CONFIRMED / SCHEDULED
    if (CONFIRM_STATUSES.includes(status)) {
      await sendOrderConfirmSMS(
        user.mobilenumber,
        customerName,
        status,
        updatedOrder.bookingTime
      );
    }

    // ✅ ACCEPTED / TECHNICIAN ASSIGNED
    else if (ACCEPT_STATUSES.includes(status)) {
      await sendOrderAcceptedSMS(
        user.mobilenumber,
        customerName,
        status,
        updatedOrder.bookingTime
      );
    }

   // 🚗 EN ROUTE / ARRIVED
else if (ENROUTE_STATUSES.includes(status)) {
  await sendEnRouteSMS(
    user.mobilenumber,
    customerName,
    updatedOrder._id,
    status
  );
}

// 🔧 IN PROGRESS
else if (INPROGRESS_STATUSES.includes(status)) {
  await sendInProgressSMS(
    user.mobilenumber,
    customerName,
    status,
    updatedOrder.totalAmount,

  );
}


    // ✅ COMPLETED
    else if (COMPLETED_STATUSES.includes(status)) {
      await sendOrderCompletedSMS(
        user.mobilenumber,
        customerName,
        updatedOrder._id,
        status
      );
    }

    // ❌ PAYMENT FAILED
    else if (PAYMENT_FAILED_STATUSES.includes(status)) {
      await sendPaymentFailedSMS(
        user.mobilenumber,
        customerName,
        updatedOrder.totalAmount,
        status
      );
    }

  // ❌ CANCELLED
else if (CANCELLED_STATUSES.includes(status)) {
  await sendOrderCancelledSMS(
    user.mobilenumber,
    customerName,
    updatedOrder._id,
    status // Cancelled by User / Technician / No Show
  );
}

// 💸 REFUND
else if (REFUND_STATUSES.includes(status)) {
  await sendRefundSMS(
    user.mobilenumber,
    customerName,
    status,
    updatedOrder.totalAmount
  );
}

  }
} catch (smsError) {
  console.error("SMS sending failed:", smsError.message);
}

    /* ===========================
       🧾 ACTIVITY LOG
       =========================== */
    if (userId && updatedTask && (status === "Accepted" || status === "Completed")) {
      try {
        const date = require("moment")().format("YYYY-MM-DD");
        const log = await ActivityLog.findOne({ userId, date });

        if (log) {
          const existingTask = log.tasks.find(
            task => task.taskId === updatedTask.task_id
          );

          if (existingTask) {
            existingTask.title =
              taskTitle || `${status} Task ${updatedTask.task_id}`;
            existingTask.description =
              taskDescription || `Task ${status.toLowerCase()} in Order ${orderId}`;
            existingTask.status = status;
            existingTask.assignedAt = new Date();

            if (status === "Completed") {
              existingTask.completedAt = new Date();
            }
          } else {
            log.tasks.push({
              taskId: updatedTask.task_id,
              title: taskTitle || `${status} Task ${updatedTask.task_id}`,
              description:
                taskDescription || `Task ${status.toLowerCase()} in Order ${orderId}`,
              status,
              assignedAt: new Date(),
              ...(status === "Completed" && { completedAt: new Date() }),
            });
          }

          await log.save();
        }
      } catch (logError) {
        console.error("Activity log error:", logError.message);
      }
    }

    // 6️⃣ Final response
    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};



exports.taskupdateOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { task_id } = req.body; // now an array of task IDs

    if (!Array.isArray(task_id) || task_id.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Task IDs are required",
      });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Loop through task IDs and update each task
    task_id.forEach((id) => {
      const taskIndex = existingOrder.tasks.findIndex(task => task.task_id === id);
      if (taskIndex !== -1) {
        existingOrder.tasks[taskIndex].interior = true;
        existingOrder.tasks[taskIndex].exterior = false;
      }
    });

    // Decrement the order-level interior count by number of tasks updated
    const tasksUpdated = task_id.length;
    if (typeof existingOrder.interior === 'number') {
      existingOrder.interior = Math.max(existingOrder.interior - tasksUpdated, 0);
    }

    const updatedOrder = await existingOrder.save();

    res.status(200).json({
      success: true,
      message: "Tasks updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating tasks:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// Delete a specific order by ID
exports.deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Remove the Order from the database
    await Order.deleteOne({ _id: orderId });

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
exports.getAllDashboard = async (req, res) => {
  try {
    const { status } = req.query;

    // Get current date
    const currentDate = moment();
    const filter = {};

    // Calculate counts and total amount for different time periods
    const today_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("day").toDate(),
        $lt: currentDate.endOf("day").toDate(),
      },
    });
    const yesterday_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.subtract(1, "days").startOf("day").toDate(),
        $lt: currentDate.subtract(1, "days").endOf("day").toDate(),
      },
    });
    const months_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("month").toDate(),
        $lt: currentDate.endOf("month").toDate(),
      },
    });
    const yearly_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("year").toDate(),
        $lt: currentDate.endOf("year").toDate(),
      },
    });
    const total_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("year").toDate(),
        $lt: currentDate.endOf("year").toDate(),
      },
    });

    // Weekly sales amounts for the current year
    // const chartWeek = {};

    // Get all orders for the current year
    const yearlyOrders = await Order.find({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("year").toDate(),
        $lt: currentDate.endOf("year").toDate(),
      },
    });

    // // Calculate weekly sales amounts for the current year
    // for (let i = 0; i < 52; i++) {
    //     const weekOrders = yearlyOrders.filter(order => moment(order.createdAt).isoWeek() === i);
    //     const weeklyAmount = weekOrders.reduce((total, order) => total + order.totalAmount, 0);
    //     chartWeek[`week${i + 1}`] = weeklyAmount;
    // }

    // Monthly sales amounts for each year
    const chartYears = {};

    // Calculate monthly sales amounts for the current year
    for (let i = 0; i < 12; i++) {
      const monthOrders = yearlyOrders.filter(
        (order) => moment(order.createdAt).month() === i
      );
      const monthlyAmount = monthOrders.reduce(
        (total, order) => total + order.totalAmount,
        0
      );
      chartYears[moment.months(i).toLowerCase()] = monthlyAmount;
    }

    // Sales counts for different order statuses
    const sales = {};

    for (const status of orderStatuses) {
      sales[`${status.toLowerCase()}_order`] = await Order.countDocuments({
        ...filter,
        paymentStatus: status,
      });
    }

    // Last 7 days sales amounts
    const last7DaysAmount = {};
    for (let i = 6; i >= 0; i--) {
      const day = moment().subtract(i, "days").format("ddd").toLowerCase();
      const dayOrders = yearlyOrders.filter((order) =>
        moment(order.createdAt).isSame(moment().subtract(i, "days"), "day")
      );
      const dayAmount = dayOrders.reduce(
        (total, order) => total + order.totalAmount,
        0
      );
      last7DaysAmount[day] = dayAmount;
    }

    res.status(200).json({
      success: true,
      orders: {
        today_order,
        yesterday_order,
        months_order,
        yearly_order,
        total_order,
        available_agents: 0,
        pending_order: 0,
        completed_order: 10,
        "categories": {
          "exterior": 10,
          "interior": 7,
          "compensation": 5
        },
        "on_demand_orders": {
          "total": 20,
          "completed": 15,
          "pending": 5
        },
        "subscription_orders": {
          "total": 30,
          "completed": 25,
          "pending": 5
        }
      },
      sales,
      chartYears,
      // chartWeek,
      last7DaysAmount,
      agents: {
        "available_agents": 2
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Create a new order with payment
exports.createOrderWithRazorpay = async (req, res) => {
  try {
    const { amount } = req.body;

    // Prepare data for Razorpay API
    const razorpayData = {
      amount: amount * 100, // Convert totalAmount to paise
      currency: "INR",
      receipt: `Order_1112`, // You may adjust the receipt format
      notes: {
        order_id: "Tea, Earl Grey, Hot value",
        // Add other necessary notes as needed
      },
    };

    // Make a request to Razorpay API to create an order
    const razorpayResponse = await axios.post(
      "https://api.razorpay.com/v1/orders",
      razorpayData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            "rzp_test_6lyQTyrcSZUJgZ:ojuYmp3qD6Sq3fg3WB4d377Q"
          ).toString("base64")}`,
          // Replace 'your_api_key' and 'your_api_secret' with your actual Razorpay API key and secret
        },
      }
    );

    // Extract the Razorpay order ID from the response
    const razorpayOrderId = razorpayResponse.data;

    // Update your order in the database with the Razorpay order ID

    // Send the Razorpay order ID in the response
    res.status(200).json({ success: true, razorpayOrderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

async function calculateOrderStats(filters) {
  const orderList = await Order.find(filters);

  // Filter orders based on payment method
  const cardOrders = orderList.filter((order) => order.delivery === "Card");
  const cashOrders = orderList.filter((order) => order.delivery === "Cash");

  const orderStats = {
    order_count: orderList.length,
    total_amount: orderList.reduce(
      (total, order) => total + order.totalAmount,
      0
    ),
    total_order_card: cardOrders.length,
    total_order_cash: cashOrders.length,
    total_amount_card: cardOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    ),
    total_amount_cash: cashOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    ),
  };

  return orderStats;
}

// Get the status of a specific order by ID
exports.OrderStatusById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Track the order
    const trackOrderList = await onTrackOrder(existingOrder.shipment_id);

    res.status(200).json({
      success: true,
      message: "Order status retrieved successfully",
      response_message: trackOrderList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific order by ID
exports.ChangeOrderStatusById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { courier_id, status } = req.body;


    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    let awb_obj = {
      shipment_id: existingOrder.shipment_id,
      courier_id: courier_id,
      status: status

    }

    // Remove the Order from the database
    let track_order_list = await onChangeTrackOrder(awb_obj);

    res
      .status(200)
      .json({ success: true, message: "Updated Track Order successfully", responce_message: track_order_list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Delete a specific order by ID
exports.CancelOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_id } = req.body;


    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    let awb_obj = {
      "ids": [`${order_id}`]
    }

    // Remove the Order from the database
    let track_order_list = await CancelTrackOrder(awb_obj);

    res
      .status(200)
      .json({ success: true, message: "Cancel Order successfully", responce_message: track_order_list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};




