const Order = require("../../models/OrderModel/OrderModel");
const Product = require("../../models/ProductModel/NewModelProduct");
const User = require("../../models/UserModel/User");
const Address = require("../../models/Address/AddressModel");
const moment = require("moment");
const axios = require("axios");
const Rating = require("../../models/AddRating/RatingModel");

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

exports.createOrder = async (req, res) => {
  try {
    const { userId, addressId, productIds, totalAmount, delivery, razorpay_payment_id, paymentStatus, applycoupon, quantity } = req.body;

    const newOrder = await Order.create({
      userId,
      addressId,
      productIds,
      totalAmount,
      paymentStatus,
      delivery,
      razorpay_payment_id,
      applycoupon,
      quantity
    });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.loyalty_point += 10;
    await user.save();

    const deliveryType = delivery === "Card" ? 1 : 0;
    let orderResponses = await onCreateOrder(addressId, deliveryType, newOrder);
    newOrder.shipment_id = orderResponses.shipment_id
    await newOrder.save();

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

    // Create a dynamic filter based on status
    const filter = status
      ? { userId, paymentStatus: PAYMENTSTATUS[status] }
      : { userId };

    // Fetch all orders for the user
    const orderList = await Order.find(filter);

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
exports.getByOrderID = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find order by order ID
    const order = await Order.findById(orderId);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Fetch address details
    const address = await Address.findById(order.addressId);

    // Fetch user details
    const user = await User.findById(order.userId);

    // Fetch product details for each order item
    const productPromises = order.productIds.map(async (productId) => {
      let product = await Product.findById(productId);
      // Fetch ratings for the product
      const ratings = await Rating.find({ productId, userId: order.userId });

      // Check if ratings exist and contain valid values
      if (ratings.length > 0) {
        // Merge product and ratings
        product = { ...product.toObject(), ratings };
      } else {
        // Set ratings to null if not found
        product.ratings = null;
      }

      return product;
    });

    // Wait for all promises to resolve
    const productsWithDetails = await Promise.all(productPromises);

    // Construct the response object with order details and related entities
    const orderWithDetails = {
      _id: order._id,
      address,
      user,
      products: productsWithDetails
    };

    // Return the response
    res.status(200).json({ success: true, order: orderWithDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};




exports.getAllOrderList = async (req, res) => {
  try {
    // Fetch all orders for the user
    const orderList = await Order.find();



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

// Update a specific order by ID
exports.updateOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, delivery } = req.body;

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update the Order fields
    existingOrder.paymentStatus = status; // Assuming 'status' is the field you want to update
    existingOrder.delivery = delivery; // Assuming 'status' is the field you want to update

    // Save the updated Order
    const updatedOrder = await existingOrder.save();

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
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
      },
      sales,
      chartYears,
      // chartWeek,
      last7DaysAmount,
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


