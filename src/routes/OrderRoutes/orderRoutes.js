const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/OrderController/AddOrderController');

// Create a new order with payment
router.post('/createOrder', OrderController.createOrder);

router.put('/orderUpdate/:id', OrderController.updateOrderById);

router.delete('/deleteOrder/:id', OrderController.deleteOrderById);

router.get('/orderGetById/:id', OrderController.getByOrderID);


router.get('/OrderlistById/:id', OrderController.getAllOrder);

router.get('/Orderlist', OrderController.getAllOrderList);


router.get('/Dashboardlist', OrderController.getAllDashboard);


router.post('/orders', OrderController.createOrderWithRazorpay);

router.post('/trackStatusById', OrderController.OrderStatusById);

router.post('/ChangeOrder', OrderController.ChangeOrderStatusById);

router.post('/ordersCancel', OrderController.CancelOrderById);

module.exports = router;
