const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: false // Kabhi-kabhi manual item bhi ho sakta hai
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true // Multi-tenant isolation ke liye index
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    customerName: {
        type: String,
        trim: true,
        default: 'Customer'
    },
    deliveryAddress: {
        type: String,
        trim: true,
        default: 'Dukan se pickup'
    },
    items: {
        type: [orderItemSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'Order me kam se kam ek item hona chahiye.']
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PAID'],
        default: 'UNPAID'
    },
    paymentMode: {
        type: String,
        enum: ['CASH', 'UPI', 'CARD', 'UDHAAR', 'ONLINE'],
        default: 'CASH'
    },
    invoiceNumber: {
        type: String,
        trim: true,
        index: true
    },
    source: {
        type: String,
        enum: ['WHATSAPP', 'MANUAL', 'COUNTER'],
        default: 'WHATSAPP'
    },
    orderNotes: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
