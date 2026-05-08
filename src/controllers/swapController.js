const SwapRequest = require('../models/SwapRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification'); // keyinroq yaratamiz

// =========================================================
// 1. ALMASHTIRISH TAKLIFI YUBORISH
// =========================================================
exports.createSwapRequest = async (req, res, next) => {
    try {
        const { offeredBookId, requestedBookId, message } = req.body;
        const requesterId = req.user.id;

        // 1. Validatsiya
        if (!offeredBookId || !requestedBookId) {
            return res.status(400).json({
                success: false,
                message: "Iltimos, qaysi kitobingizni berayotganingizni va qaysi kitobni so'rayotganingizni tanlang!"
            });
        }

        // 2. Kitoblarni topish
        const offeredBook = await Book.findById(offeredBookId);
        const requestedBook = await Book.findById(requestedBookId);

        if (!offeredBook || !requestedBook) {
            return res.status(404).json({
                success: false,
                message: "Kitob topilmadi!"
            });
        }

        // 3. O'z kitobingizni o'zingizdan so'ray olmaysiz
        if (offeredBook.seller.toString() === requestedBook.seller.toString()) {
            return res.status(400).json({
                success: false,
                message: "O'z kitobingizni o'zingiz bilan almashtira olmaysiz!"
            });
        }

        // 4. Taklif qilayotgan kitob rostdan ham taklif qiluvchiga tegishlimi?
        if (offeredBook.seller.toString() !== requesterId) {
            return res.status(403).json({
                success: false,
                message: "Siz taklif qilayotgan kitob sizga tegishli emas!"
            });
        }

        // 5. So'ralayotgan kitob egasi kim?
        const recipientId = requestedBook.seller;

        // 6. Oldindan kutilayotgan taklif bormi? (pending)
        const existingRequest = await SwapRequest.findOne({
            requester: requesterId,
            recipient: recipientId,
            offeredBook: offeredBookId,
            requestedBook: requestedBookId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Siz allaqachon bu taklifni yuborgansiz. Javob kuting!"
            });
        }

        // 7. Taklifni yaratish
        const swapRequest = await SwapRequest.create({
            requester: requesterId,
            recipient: recipientId,
            offeredBook: offeredBookId,
            requestedBook: requestedBookId,
            message: message || "",
            status: 'pending'
        });

        // 8. Notifikatsiya yuborish (agar Notification modeli bo'lsa)
        // await Notification.create({
        //     user: recipientId,
        //     type: 'swap_request',
        //     fromUser: requesterId,
        //     swapRequest: swapRequest._id,
        //     message: `${req.user.firstName} sizning kitobingizni almashtirishni taklif qildi`
        // });



        // Taklif yuborilganda notifikatsiya yaratish
        const Notification = require('../models/Notification');

        // createSwapRequest ichida, swapRequest yaratilgandan keyin:
        await Notification.create({
            user: recipientId,
            type: 'swap_request',
            fromUser: requesterId,
            swapRequest: swapRequest._id,
            message: `${req.user.firstName} ${req.user.lastName} kitobingizni almashtirishni taklif qildi`,
            read: false
        });



        // 9. Populate qilib qaytarish
        const populatedRequest = await SwapRequest.findById(swapRequest._id)
            .populate('requester', 'firstName lastName avatar')
            .populate('recipient', 'firstName lastName avatar')
            .populate('offeredBook', 'title author images price')
            .populate('requestedBook', 'title author images price');

        res.status(201).json({
            success: true,
            message: "Almashtirish taklifi yuborildi!",
            data: populatedRequest
        });

    } catch (error) {
        next(error);
    }
};

// =========================================================
// 2. MENING TAKLIFLARIM (men kimlarga taklif qilganman)
// =========================================================
exports.getMySwapRequests = async (req, res, next) => {
    try {
        const { status } = req.query; // pending, accepted, rejected
        
        let query = { requester: req.user.id };
        if (status) query.status = status;

        const requests = await SwapRequest.find(query)
            .populate('recipient', 'firstName lastName avatar phoneNumber')
            .populate('offeredBook', 'title author images price')
            .populate('requestedBook', 'title author images price')
            .sort({ createdAt: -1 });

        // Ko'rilgan deb belgilash
        await SwapRequest.updateMany(
            { requester: req.user.id, readByRequester: false },
            { readByRequester: true }
        );

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 3. MENGGA QILINGAN TAKLIFLAR
// =========================================================
exports.getSwapRequestsForMe = async (req, res, next) => {
    try {
        const { status } = req.query;
        
        let query = { recipient: req.user.id };
        if (status) query.status = status;

        const requests = await SwapRequest.find(query)
            .populate('requester', 'firstName lastName avatar phoneNumber')
            .populate('offeredBook', 'title author images price')
            .populate('requestedBook', 'title author images price')
            .sort({ createdAt: -1 });

        // Ko'rilgan deb belgilash
        await SwapRequest.updateMany(
            { recipient: req.user.id, readByRecipient: false },
            { readByRecipient: true }
        );

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 4. TAKLIFNI QABUL QILISH YOKI RAD ETISH
// =========================================================
exports.updateSwapRequestStatus = async (req, res, next) => {
    try {
        const { id, status } = req.params;
        const userId = req.user.id;

        // Faqat 'accept' yoki 'reject'
        if (status !== 'accept' && status !== 'reject') {
            return res.status(400).json({
                success: false,
                message: "Faqat 'accept' yoki 'reject' bo'lishi mumkin"
            });
        }

        // Taklifni topish
        const swapRequest = await SwapRequest.findById(id);
        
        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: "Taklif topilmadi"
            });
        }

        // Faqat taklif qabul qiluvchi (recipient) qabul yoki rad eta oladi
        if (swapRequest.recipient.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Bu taklifni faqat qabul qiluvchi o'zgartira oladi"
            });
        }

        // Agar allaqachon qabul qilingan yoki rad etilgan bo'lsa
        if (swapRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Bu taklif allaqachon ${swapRequest.status === 'accepted' ? 'qabul qilingan' : 'rad etilgan'}`
            });
        }

        // Taklif qabul qilinganda notifikatsiya
        await Notification.create({
            user: swapRequest.requester,
            type: 'swap_accepted',
            fromUser: userId,
            swapRequest: swapRequest._id,
            message: `${req.user.firstName} taklifyingizni QABUL QILDI! Kitoblar egalari almashtirildi.`,
            read: false
        });

        if (status === 'accept') {
            // =================================================
            // ALMASHTIRISHNI AMALGA OSHIRISH (MUHIM QISM!)
            // =================================================
            
            const offeredBook = await Book.findById(swapRequest.offeredBook);
            const requestedBook = await Book.findById(swapRequest.requestedBook);

            if (!offeredBook || !requestedBook) {
                return res.status(404).json({
                    success: false,
                    message: "Kitoblardan biri topilmadi yoki o'chirilgan"
                });
            }

            // Kitob egalarini almashtirish
            const tempSeller = offeredBook.seller;
            offeredBook.seller = requestedBook.seller;
            requestedBook.seller = tempSeller;

            await offeredBook.save();
            await requestedBook.save();

            // Taklif statusini yangilash
            swapRequest.status = 'accepted';
            swapRequest.completedAt = new Date();
            await swapRequest.save();

            // Ikkala foydalanuvchining statistikasini yangilash (totalBooks o'zgardi, chunki kitob egasi o'zgardi)
            // Bu yerda totalBooks o'zgarishini hisobga olish kerak
            // Aslida kitob egasi o'zgarganda totalBooks o'zgarmaydi, faqat seller o'zgaradi

            res.status(200).json({
                success: true,
                message: "Taklif qabul qilindi! Kitoblar egalari almashtirildi."
            });

        } else { // reject
            swapRequest.status = 'rejected';
            await swapRequest.save();

            res.status(200).json({
                success: true,
                message: "Taklif rad etildi"
            });
        }

    } catch (error) {
        next(error);
    }

    
};

// =========================================================
// 5. TAKLIFNI BEKOR QILISH (faqat taklif qilgan)
// =========================================================
exports.cancelSwapRequest = async (req, res, next) => {
    try {
        const swapRequest = await SwapRequest.findById(req.params.id);

        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: "Taklif topilmadi"
            });
        }

        // Faqat taklif qilgan bekor qila oladi
        if (swapRequest.requester.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Faqat taklif egasi bekor qila oladi"
            });
        }

        // Faqat pending holatidagilarni bekor qilish mumkin
        if (swapRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Bu taklifni endi bekor qilib bo'lmaydi"
            });
        }

        swapRequest.status = 'cancelled';
        await swapRequest.save();

        res.status(200).json({
            success: true,
            message: "Taklif bekor qilindi"
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// 6. TAKLIF DETALLARI
// =========================================================
exports.getSwapDetails = async (req, res, next) => {
    try {
        const swapRequest = await SwapRequest.findById(req.params.id)
            .populate('requester', 'firstName lastName avatar phoneNumber region district')
            .populate('recipient', 'firstName lastName avatar phoneNumber region district')
            .populate('offeredBook', 'title author images price pages genre')
            .populate('requestedBook', 'title author images price pages genre');

        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: "Taklif topilmadi"
            });
        }

        // Faqat ishtirokchilar ko'ra oladi
        if (swapRequest.requester._id.toString() !== req.user.id && 
            swapRequest.recipient._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Bu taklifni ko'rishga ruxsat yo'q"
            });
        }

        res.status(200).json({
            success: true,
            data: swapRequest
        });
    } catch (error) {
        next(error);
    }
};