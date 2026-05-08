const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    // =========================================================
    // ASOSIY MA'LUMOTLAR
    // =========================================================
    title: {
        type: String,
        required: [true, 'Kitob nomi kiritilishi shart'],
        trim: true,
        index: true 
    },
    author: {
        type: String,
        required: [true, 'Kitob muallifi kiritilishi shart'],
        trim: true,
        index: true
    },
    genre: {
        type: String,
        required: [true, 'Kitob janri kiritilishi shart'],
        index: true
    },
    price: { 
        type: Number, 
        required: function() {
            // Agar mualliflik kitobi bo'lsa, price shart emas (bepul)
            return this.bookType !== 'author_original';
        },
        default: 0
    },
    pages: {
        type: Number,
        required: [true, 'Sahifalar soni kiritilishi shart']
    },
    paperType: {
        type: String,
        required: [true, 'Qog\'oz turi kiritilishi shart'],
        enum: [
            'Ofset qog\'oz (Oq qog\'oz)',
            'Gazeta qog\'ozi (Sarg\'ish)',
            'Melyovanniy qog\'oz (Yaltiroq/Silliq)',
            'Kraft qog\'oz',
            'Kitob-dizayner qog\'ozi (Sariq/Fil suyagi rangi)'
        ]
    },
    dimensions: {
        width: {
            type: Number,
            required: [true, 'Kitobning eni kiritilishi shart (sm da)']
        },
        height: {
            type: Number,
            required: [true, 'Kitobning bo\'yi kiritilishi shart (sm da)']
        }
    },
    images: [{
        type: String,
        required: function() {
            // Mualliflik kitobi uchun rasm majburiy emas (faqat PDF bo'lishi mumkin)
            return this.bookType !== 'author_original';
        }
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // =========================================================
    // STATISTIKA MAYDONLARI
    // =========================================================
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    downloadsCount: {
        type: Number,
        default: 0
    },
    
    // =========================================================
    // ALMASHTIRISH TIZIMI UCHUN (YANGI)
    // =========================================================
    availableForSwap: {
        type: Boolean,
        default: true,
        description: "Bu kitobni almashtirish mumkinmi?"
    },
    swapCount: {
        type: Number,
        default: 0,
        description: "Nechi marta almashtirilgan"
    },
    swapCounter: {
        type: Number,
        default: 0,
        description: "Qabul qilingan swap takliflari soni"
    },
    
    // =========================================================
    // MUALLIFLIK KITOBLARI UCHUN (YANGI)
    // =========================================================
    bookType: {
        type: String,
        enum: ['for_sale', 'for_swap', 'author_original'],
        default: 'for_sale',
        description: "for_sale = Sotish uchun, for_swap = Almashtirish uchun, author_original = Muallifning o'z kitobi"
    },
    authorOriginal: {
        type: Boolean,
        default: false,
        description: "Bu kitob muallifning o'zi yozganmi?"
    },
    
    // Ilmiy ish sozlamalari
    isScientificWork: {
        type: Boolean,
        default: false,
        description: "Ilmiy ish (dissertatsiya, maqola va boshqalar)"
    },
    scientificField: {
        type: String,
        enum: ['matematika', 'fizika', 'adabiyot', 'tarix', 'iqtisod', 'pedagogika', 'filologiya', 'huquq', 'tibbiyot', 'informatika', 'boshqa'],
        required: function() { 
            return this.isScientificWork === true; 
        },
        description: "Ilmiy yo'nalish"
    },
    
    // Yuklab olish va litsenziya
    downloadEnabled: {
        type: Boolean,
        default: false,
        description: "PDF faylni yuklab olishga ruxsat berilganmi?"
    },
    pdfFile: {
        type: String,
        default: null,
        description: "PDF fayl nomi (uploads/pdf/ ichida)"
    },
    license: {
        type: String,
        enum: ['copyright', 'creative_commons', 'public_domain', 'all_rights_reserved'],
        default: 'copyright',
        description: "Mualliflik huquqi turi"
    },
    
    // Nashr haqida ma'lumot
    publicationYear: {
        type: Number,
        description: "Nashr yili (faqat mualliflik kitoblari uchun)"
    },
    institution: {
        type: String,
        trim: true,
        description: "Universitet yoki ilmiy muassasa nomi"
    },
    publisher: {
        type: String,
        trim: true,
        description: "Nashriyot nomi (agar mavjud bo'lsa)"
    },
    
    // =========================================================
    // HOLAT VA TASNIF
    // =========================================================
    status: {
        type: String,
        enum: ['active', 'sold', 'reserved', 'inactive'],
        default: 'active',
        description: "Kitob holati (sotilgan, zahira va hokazo)"
    },
    condition: {
        type: String,
        enum: ['yangi', 'yaxshi', 'qoniqarli', 'eski'],
        default: 'yaxshi',
        description: "Kitobning jismoniy holati"
    },
    
    // =========================================================
    // QO'SHIMCHA METADATA
    // =========================================================
    language: {
        type: String,
        enum: ['o\'zbek', 'rus', 'ingliz', 'qoraqalpoq', 'boshqa'],
        default: 'o\'zbek',
        description: "Kitob tili"
    },
    isbn: {
        type: String,
        trim: true,
        match: [/^(97(8|9))?\d{9}(\d|X)$/, 'ISBN noto\'g\'ri formatda'],
        description: "ISBN kod (agar mavjud bo'lsa)"
    },
    tags: [{
        type: String,
        trim: true,
        description: "Qo'shimcha teglar (masalan: 'darslik', 'roman', 'she\'r')"
    }],
    
    // =========================================================
    // REYTING VA BAHOLASH
    // =========================================================
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingsCount: {
        type: Number,
        default: 0
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// =========================================================
// VIRTUAL MAYDONLAR
// =========================================================

// Kitobning to'liq nomi (muallif + title)
bookSchema.virtual('fullTitle').get(function() {
    return `${this.author} - "${this.title}"`;
});

// Kitobning formatlangan o'lchami
bookSchema.virtual('formattedDimensions').get(function() {
    return `${this.dimensions.width} × ${this.dimensions.height} sm`;
});

// Kitob turi (o'zbekcha nom)
bookSchema.virtual('bookTypeName').get(function() {
    const types = {
        'for_sale': 'Sotiladi',
        'for_swap': 'Almashtiriladi',
        'author_original': 'Muallif asari'
    };
    return types[this.bookType] || 'Noma\'lum';
});

// Kitobning "wow" indeksi (layk + comment + views asosida)
bookSchema.virtual('engagementScore').get(function() {
    return (this.likesCount * 2) + (this.commentsCount * 3) + Math.floor(this.viewsCount / 10);
});

// =========================================================
// INDEKSLAR (TEZ QIDIRUV UCHUN)
// =========================================================

// Matnli qidiruv indeksi
bookSchema.index({ title: 'text', author: 'text', tags: 'text' });

// Murakkab qidiruv indekslari
bookSchema.index({ genre: 1, price: 1 });
bookSchema.index({ seller: 1, createdAt: -1 });
bookSchema.index({ bookType: 1, status: 1 });
bookSchema.index({ availableForSwap: 1, swapCount: -1 });
bookSchema.index({ authorOriginal: 1, isScientificWork: 1 });

// Geo/mintaqa bo'yicha qidiruv (agar kelajakda kerak bo'lsa)
// bookSchema.index({ location: '2dsphere' });

// =========================================================
// STATIC METHODLAR
// =========================================================

// Eng ko'p ko'rilgan kitoblar
bookSchema.statics.getMostViewed = async function(limit = 10) {
    return this.find({ status: 'active' })
        .sort({ viewsCount: -1 })
        .limit(limit)
        .populate('seller', 'firstName lastName avatar');
};

// Eng ko'p almashtirilgan kitoblar
bookSchema.statics.getMostSwapped = async function(limit = 10) {
    return this.find({ availableForSwap: true, status: 'active' })
        .sort({ swapCount: -1 })
        .limit(limit);
};

// Mualliflik kitoblari
bookSchema.statics.getAuthorOriginalBooks = async function(limit = 20) {
    return this.find({ authorOriginal: true, status: 'active' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('seller', 'firstName lastName avatar institution');
};

// Ilmiy ishlar
bookSchema.statics.getScientificWorks = async function(field = null, limit = 20) {
    let query = { isScientificWork: true, status: 'active' };
    if (field && field !== 'barchasi') {
        query.scientificField = field;
    }
    return this.find(query)
        .sort({ downloadsCount: -1 })
        .limit(limit)
        .populate('seller', 'firstName lastName institution');
};

// =========================================================
// INSTANCE METHODLAR
// =========================================================

// Ko'rishlar sonini oshirish
bookSchema.methods.incrementViews = async function() {
    this.viewsCount += 1;
    return this.save();
};

// Almashtirishlar sonini oshirish
bookSchema.methods.incrementSwapCount = async function() {
    this.swapCount += 1;
    this.swapCounter += 1;
    return this.save();
};

// Kitobni sotilgan deb belgilash
bookSchema.methods.markAsSold = async function() {
    this.status = 'sold';
    this.availableForSwap = false;
    return this.save();
};

// Kitobni faollashtirish
bookSchema.methods.activate = async function() {
    this.status = 'active';
    return this.save();
};

// Reytingni yangilash (yangi baho qo'shilganda)
bookSchema.methods.updateRating = async function(newRating) {
    const totalRating = this.averageRating * this.ratingsCount;
    this.ratingsCount += 1;
    this.averageRating = (totalRating + newRating) / this.ratingsCount;
    return this.save();
};

// =========================================================
// MIDDLEWARE (PRE-SAVE)
// =========================================================

// Saqlashdan oldin tekshirish
bookSchema.pre('save', function(next) {
    // Mualliflik kitobi bo'lsa, price ni 0 ga tenglashtirish
    if (this.bookType === 'author_original') {
        this.price = 0;
        this.availableForSwap = false; // Mualliflik kitoblarini almashtirib bo'lmaydi
    }
    
    // Almashtirish uchun kitob bo'lsa, price ni 0 qilish mumkin (ixtiyoriy)
    if (this.bookType === 'for_swap' && !this.price) {
        this.price = 0;
    }
    
    // Barcha kitoblar default holat active
    if (!this.status) {
        this.status = 'active';
    }
    
    next();
});

// =========================================================
// TO'LIQ MATNLI QIDIRUV FUNKSIYASI (STATIC)
// =========================================================
bookSchema.statics.fullTextSearch = async function(searchTerm, filters = {}) {
    let query = { $text: { $search: searchTerm } };
    
    // Filtrlarni qo'llash
    if (filters.genre) query.genre = filters.genre;
    if (filters.minPrice) query.price = { ...query.price, $gte: filters.minPrice };
    if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
    if (filters.bookType) query.bookType = filters.bookType;
    if (filters.authorOriginal !== undefined) query.authorOriginal = filters.authorOriginal;
    if (filters.isScientificWork !== undefined) query.isScientificWork = filters.isScientificWork;
    if (filters.status) query.status = filters.status;
    if (filters.language) query.language = filters.language;
    
    return this.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('seller', 'firstName lastName avatar');
};

module.exports = mongoose.model('Book', bookSchema);