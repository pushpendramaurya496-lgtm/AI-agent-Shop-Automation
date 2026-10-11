const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true // Isse database search bahut fast ho jayega
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stockQuantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    category: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
