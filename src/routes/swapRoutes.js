const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createSwapRequest,
    getMySwapRequests,
    getSwapRequestsForMe,
    updateSwapRequestStatus,
    getSwapDetails,
    cancelSwapRequest
} = require('../controllers/swapController');

// Barcha route'lar login talab qiladi
router.use(protect);

// Taklif yaratish
router.post('/request', createSwapRequest);

// Mening takliflarim (men kimlarga taklif qilganman)
router.get('/my-requests', getMySwapRequests);

// Menga qilingan takliflar
router.get('/requests-for-me', getSwapRequestsForMe);

// Taklifni qabul qilish / rad etish
router.put('/request/:id/:status', updateSwapRequestStatus); // status = 'accept' yoki 'reject'

// Taklifni bekor qilish (faqat taklif qilgan)
router.delete('/request/:id', cancelSwapRequest);

// Taklif detallari
router.get('/request/:id', getSwapDetails);

module.exports = router;