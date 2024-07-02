const { Category } = require('../models/category');
const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    let filter = {};

    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    };

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({ success: false });
    } else {
        res.send(productList);
    }
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false });
    } else {
        res.send(product);
    }
});

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    await product.save();

    if (!product) {
        return res.status(500).send('The product cannot be created!');
    }

    res.send(product);
});

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, { new: true });

    if (!product) {
        return res.status(500).send('The product cannot be updated!');
    }

    res.send(product);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({success: true, message: 'The product is deleted!'});
        } else {
            return res.status(404).json({success: false, message: 'Product not found!'});
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err});
    });
});

router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({
            productCount: productCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get(`/get/featured:count`, async (req, res) => {
    try {
        const count = req.params.count ? req.params.count : 0;

        const product = await Product.find({isFeatured: true}).limit(+count);
        res.send(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;
