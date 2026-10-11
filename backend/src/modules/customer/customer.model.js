const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        trim: true,
        default: 'Customer'
    },
    defaultAddress: {
        type: String,
        trim: true,
        default: ''
    },
    addresses: [{
        type: String,
        trim: true
    }],
    totalOrdersCount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    outstandingBalance: {
        type: Number,
        default: 0 // Udhaar: +ve means grahak ko dukan ko dena hai
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Har dukan ke andar phone number unique hona chahiye
customerSchema.index({ shopId: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
