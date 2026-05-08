const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'like', 'comment', 'follow'],
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    swapRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SwapRequest'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    message: {
        type: String,
        maxlength: 200
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);