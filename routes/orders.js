const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if (!orderList) {
        res.status(500).json({success: false});
    }
    res.send(orderList);
});

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    }, {new: true});

    if(!order) {
        return res.status(404).send('The order cannot be updated!');
    }
    
    res.send(order);
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id).then(order => {
        if (order) {
            return res.status(200).json({success: true, message: 'The order is deleted!'});
        } else {
            return res.status(404).json({success: false, message: 'order not found!'});
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err});
    });
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id).then(order => {
        if (order) {
            return res.status(200).json({success: true, message: 'The order is deleted!'});
        } else {
            return res.status(404).json({success: false, message: 'order not found!'});
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err});
    });
});

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    });

    if (!order) {
        res.status(500).json({success: false});
    }
    res.send(order);
});

router.post(`/`, async (req, res) => {
    try {
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        }));

        let order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: req.body.totalPrice,
            user: req.body.user
        });
        order = await order.save();

        if (!order) {
            return res.status(400).send('The order cannot be created!');
        }

        res.send(order);
    } catch (error) {
        res.status(500).send('An error occurred while creating the order.');
    }
});


module.exports = router;