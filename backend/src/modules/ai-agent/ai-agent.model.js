const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system', 'tool'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    messages: [messageSchema],
    lastActive: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

// Ek shop aur ek customer ka session unique hona chahiye
chatSessionSchema.index({ shopId: 1, customerPhone: 1 }, { unique: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
