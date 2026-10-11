const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    shopName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        default: 'free'
    },
    whatsappPhoneNumberId: {
        type: String,
        trim: true,
        index: true // Meta se webhook aane par turant dukan dhoondhne ke liye
    },
    aiEnabled: {
        type: Boolean,
        default: true // Dukandar chahe toh AI ko pause kar sakta hai
    },
    aiPersonality: {
        type: String,
        default: 'Namaste! Main aapka sahayak hoon.'
    },
    address: {
        type: String,
        default: ''
    },
    openingTime: {
        type: String,
        default: '08:00 AM'
    },
    closingTime: {
        type: String,
        default: '10:00 PM'
    },
    upiId: {
        type: String,
        trim: true,
        default: ''
    },
    deliveryRadiusKm: {
        type: Number,
        default: 5,
        min: 0
    },
    minimumOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveryCharges: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
