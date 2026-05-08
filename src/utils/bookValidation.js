// Kitob yaratish/update uchun validatsiya yordamchi funksiyalari

exports.validateBookData = (data, isUpdate = false) => {
    const errors = [];
    
    // Asosiy maydonlar
    if (!isUpdate || data.title !== undefined) {
        if (!data.title || data.title.length < 2) {
            errors.push("Kitob nomi kamida 2 harf bo'lishi kerak");
        }
    }
    
    if (!isUpdate || data.author !== undefined) {
        if (!data.author || data.author.length < 2) {
            errors.push("Muallif nomi kamida 2 harf bo'lishi kerak");
        }
    }
    
    // Narx validatsiyasi (mualliflik kitobi emas)
    if (data.bookType !== 'author_original') {
        if (!isUpdate || data.price !== undefined) {
            if (data.price && (data.price < 0 || data.price > 100000000)) {
                errors.push("Narx 0 dan 100,000,000 so'm oralig'ida bo'lishi kerak");
            }
        }
    }
    
    // Sahifalar soni
    if (!isUpdate || data.pages !== undefined) {
        if (data.pages && (data.pages < 1 || data.pages > 10000)) {
            errors.push("Sahifalar soni 1-10000 oralig'ida bo'lishi kerak");
        }
    }
    
    // Ilmiy ish validatsiyasi
    if (data.isScientificWork && !data.scientificField) {
        errors.push("Ilmiy ish uchun yo'nalish tanlash majburiy");
    }
    
    // Yuklab olish validatsiyasi
    if (data.downloadEnabled && !data.pdfFile && !isUpdate) {
        errors.push("Yuklab olish ruxsat berilgan bo'lsa, PDF fayl majburiy");
    }
    
    // Nashr yili validatsiyasi
    if (data.publicationYear) {
        const currentYear = new Date().getFullYear();
        if (data.publicationYear < 1000 || data.publicationYear > currentYear) {
            errors.push(`Nashr yili 1000-${currentYear} oralig'ida bo'lishi kerak`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Kitobni filtr qilish uchun ruxsat etilgan maydonlar
exports.allowedFilterFields = [
    'genre', 'bookType', 'authorOriginal', 'isScientificWork',
    'scientificField', 'language', 'status', 'minPrice', 'maxPrice',
    'minPages', 'maxPages', 'seller', 'availableForSwap'
];

// Kitob turlari ro'yxati (frontend uchun)
exports.bookTypesList = [
    { value: 'for_sale', label: '💰 Sotiladi', icon: '💰' },
    { value: 'for_swap', label: '🔄 Almashtiriladi', icon: '🔄' },
    { value: 'author_original', label: '✍️ Muallif asari', icon: '✍️' }
];

// Ilmiy yo'nalishlar ro'yxati
exports.scientificFieldsList = [
    'matematika', 'fizika', 'adabiyot', 'tarix', 'iqtisod', 
    'pedagogika', 'filologiya', 'huquq', 'tibbiyot', 'informatika', 'boshqa'
];