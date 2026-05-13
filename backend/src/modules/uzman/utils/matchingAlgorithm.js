/**
 * Matching Algorithm
 * Calculates match score between hasta and uzman
 */

/**
 * Calculate match score between hasta and uzman
 * @param {Object} hasta - Hasta profile data
 * @param {Object} uzman - Uzman profile data
 * @returns {number} Match score (0-100)
 */
export const calculateMatchScore = (hasta, uzman) => {
    let score = 0;

    // 1. Location match (25 points)
    if (uzman.sehir === hasta.sehir) {
        score += 15;
        // Bonus for same ilce
        if (uzman.ilce === hasta.ilce) {
            score += 10;
        }
    }

    // 2. Pain area match (25 points)
    if (hasta.agri_bolgesi && uzman.uzmanlikAlanlari?.vucutBolgesi) {
        const hastaAgri = hasta.agri_bolgesi.toLowerCase();
        const uzmanBolgeler = uzman.uzmanlikAlanlari.vucutBolgesi.map(b => b.toLowerCase());

        if (uzmanBolgeler.includes(hastaAgri)) {
            score += 25;
        }
    }

    // 3. Treatment preference match (15 points)
    if (hasta.tedavi_tercihi) {
        if (hasta.tedavi_tercihi === 'online' && uzman.online_hizmet) {
            score += 15;
        } else if (hasta.tedavi_tercihi === 'evde' && uzman.evde_hizmet) {
            score += 15;
        } else if (hasta.tedavi_tercihi === 'klinik' && uzman.klinik_hizmet) {
            score += 15;
        }
    }

    // 4. Gender preference match (10 points)
    if (hasta.cinsiyet_tercihi && hasta.cinsiyet_tercihi !== 'farketmez') {
        if (uzman.cinsiyet === hasta.cinsiyet_tercihi) {
            score += 10;
        }
    } else {
        // Neutral bonus if no preference
        score += 5;
    }

    // 5. Rating bonus (15 points)
    if (uzman.ortalama_rating) {
        score += (uzman.ortalama_rating / 5) * 15;
    }

    // 6. Experience bonus (10 points)
    if (uzman.toplam_randevu_sayisi) {
        score += Math.min(uzman.toplam_randevu_sayisi / 10, 10);
    }

    // Return rounded score (max 100)
    return Math.min(Math.round(score), 100);
};

/**
 * Sort uzmanlar by match score
 * @param {Array} uzmanlar - Array of uzman profiles
 * @param {Object} hasta - Hasta profile
 * @returns {Array} Sorted uzmanlar with match scores
 */
export const sortByMatchScore = (uzmanlar, hasta) => {
    return uzmanlar
        .map(uzman => ({
            ...uzman,
            match_score: calculateMatchScore(hasta, uzman)
        }))
        .sort((a, b) => b.match_score - a.match_score);
};
