const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema({
    // Taklif qilayotgan foydalanuvchi (Kim taklif qilyapti)
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Taklif qilinayotgan foydalanuvchi (Kimga taklif qilyapti)
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Taklif qilayotgan kitob (men buni beraman)
    offeredBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    
    // So'ralayotgan kitob (sizning shu kitobingizni olaman)
    requestedBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    
    // Taklif holati
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    
    // Qo'shimcha xabar
    message: {
        type: String,
        maxlength: 500
    },
    
    // Taklif qabul qilingan sana (eski kitob egalari o'zgaradi)
    completedAt: {
        type: Date
    },
    
    // Ikkala tomondan kim ko'rgan (frontend uchun)
    readByRequester: {
        type: Boolean,
        default: false
    },
    readByRecipient: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes (tez qidiruv uchun)
SwapRequestSchema.index({ requester: 1, status: 1 });
SwapRequestSchema.index({ recipient: 1, status: 1 });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);