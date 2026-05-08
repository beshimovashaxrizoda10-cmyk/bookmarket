const Notification = require('../models/Notification');

// Mening barcha bildirishnomalarim
exports.getMyNotifications = async (req, res, next) => {
    try {
        const { limit = 20, unreadOnly = false } = req.query;
        
        let query = { user: req.user.id };
        if (unreadOnly === 'true') query.read = false;
        
        const notifications = await Notification.find(query)
            .populate('fromUser', 'firstName lastName avatar')
            .populate('book', 'title')
            .populate('swapRequest')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        const unreadCount = await Notification.countDocuments({ 
            user: req.user.id, 
            read: false 
        });
        
        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        next(error);
    }
};

// Bitta bildirishnomani o'qilgan deb belgilash
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Bildirishnoma topilmadi"
            });
        }
        
        notification.read = true;
        await notification.save();
        
        res.status(200).json({
            success: true,
            message: "Bildirishnoma o'qilgan deb belgilandi"
        });
    } catch (error) {
        next(error);
    }
};

// Barchasini o'qilgan deb belgilash
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, read: false },
            { read: true }
        );
        
        res.status(200).json({
            success: true,
            message: "Barcha bildirishnomalar o'qilgan deb belgilandi"
        });
    } catch (error) {
        next(error);
    }
};

// Bildirishnomani o'chirish
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Bildirishnoma topilmadi"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Bildirishnoma o'chirildi"
        });
    } catch (error) {
        next(error);
    }
};