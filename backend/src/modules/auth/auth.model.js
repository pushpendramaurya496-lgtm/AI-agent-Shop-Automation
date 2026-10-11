const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['shop_owner', 'admin', 'super_admin', 'customer'],
        default: 'shop_owner'
    },
    resetPasswordOTP: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Auth', authSchema);
