/**
 * Specialist Matching Algorithm
 * Matches patients with specialists based on assessment data
 */

// Specialist keyword mappings
const SPECIALIST_KEYWORDS = {
    'Fizyoterapist': {
        painRegions: ['bel', 'boyun', 'omuz', 'diz', 'kalça', 'sırt'],
        painTypes: ['künt', 'zonklayıcı'],
        triggers: ['hareket', 'oturma', 'ayakta durma', 'yürüme'],
        relievers: ['egzersiz', 'hareket', 'masaj'],
        goals: ['hareket kabiliyetini artırmak', 'günlük aktivitelere dönmek', 'spora dönmek'],
        weight: {
            painRegion: 30,
            painType: 15,
            triggers: 20,
            relievers: 15,
            goals: 20
        }
    },
    'Ortopedist': {
        painRegions: ['diz', 'kalça', 'omuz', 'ayak bileği', 'dirsek', 'bilek'],
        painTypes: ['keskin', 'zonklayıcı'],
        painSeverity: [4, 5], // Şiddetli ağrılar
        triggers: ['yürüme', 'merdiven çıkma', 'kaldırma', 'eğilme'],
        goals: ['ameliyattan kaçınmak', 'spora dönmek', 'hareket kabiliyetini artırmak'],
        weight: {
            painRegion: 25,
            painSeverity: 20,
            painType: 15,
            triggers: 15,
            goals: 25
        }
    },
    'Nöroloji Uzmanı': {
        painRegions: ['boyun', 'bel', 'kol', 'bacak'],
        painTypes: ['karıncalanma', 'yanıcı', 'uyuşma'],
        triggers: ['eğilme', 'kaldırma', 'uzun süre oturma'],
        relievers: ['istirahat', 'pozisyon değişikliği'],
        goals: ['ağrıyı azaltmak', 'günlük aktivitelere dönmek'],
        weight: {
            painRegion: 25,
            painType: 35,
            triggers: 20,
            relievers: 10,
            goals: 10
        }
    },
    'Ağrı Uzmanı': {
        painSeverity: [4, 5], // Şiddetli ağrılar
        painDuration: ['6 ay - 1 yıl', '1 yıldan fazla'], // Kronik ağrı
        functionalImpact: [4, 5], // Yüksek fonksiyonel etki
        goals: ['ağrıyı azaltmak', 'ameliyattan kaçınmak'],
        weight: {
            painSeverity: 30,
            painDuration: 25,
            functionalImpact: 25,
            goals: 20
        }
    },
    'Romatolog': {
        painRegions: ['el', 'bilek', 'diz', 'kalça', 'omuz'],
        painTypes: ['zonklayıcı', 'ağrı'],
        triggers: ['hava durumu', 'sabah tutukluğu', 'dinlenme'],
        relievers: ['hareket', 'sıcak uygulama'],
        goals: ['ağrıyı azaltmak', 'hareket kabiliyetini artırmak'],
        weight: {
            painRegion: 20,
            painType: 15,
            triggers: 30,
            relievers: 15,
            goals: 20
        }
    },
    'Spor Hekimi': {
        painRegions: ['diz', 'ayak bileği', 'omuz', 'dirsek', 'bel'],
        painTypes: ['keskin', 'zonklayıcı'],
        triggers: ['spor', 'egzersiz', 'koşma'],
        goals: ['spora dönmek', 'hareket kabiliyetini artırmak'],
        weight: {
            painRegion: 25,
            painType: 15,
            triggers: 30,
            goals: 30
        }
    }
};

/**
 * Calculate match score for a specialist
 */
function calculateSpecialistScore(specialistType, assessmentData) {
    const specialist = SPECIALIST_KEYWORDS[specialistType];
    if (!specialist) return 0;

    let totalScore = 0;
    let totalWeight = 0;
    const matchReasons = [];

    // Pain Region Match
    if (specialist.painRegions && specialist.weight.painRegion) {
        const painRegionLower = assessmentData.painRegion.toLowerCase();
        const regionMatch = specialist.painRegions.some(region =>
            painRegionLower.includes(region.toLowerCase())
        );
        if (regionMatch) {
            totalScore += specialist.weight.painRegion;
            matchReasons.push(`${assessmentData.painRegion} bölgesi uzmanlığı`);
        }
        totalWeight += specialist.weight.painRegion;
    }

    // Pain Severity Match
    if (specialist.painSeverity && specialist.weight.painSeverity) {
        if (specialist.painSeverity.includes(assessmentData.painSeverity)) {
            totalScore += specialist.weight.painSeverity;
            matchReasons.push('Ağrı şiddeti uyumu');
        }
        totalWeight += specialist.weight.painSeverity;
    }

    // Pain Type Match
    if (specialist.painTypes && specialist.weight.painType) {
        const typeMatches = assessmentData.painTypes.filter(type =>
            specialist.painTypes.some(specType =>
                type.toLowerCase().includes(specType.toLowerCase())
            )
        );
        if (typeMatches.length > 0) {
            const matchRatio = typeMatches.length / assessmentData.painTypes.length;
            totalScore += specialist.weight.painType * matchRatio;
            matchReasons.push('Ağrı tipi uyumu');
        }
        totalWeight += specialist.weight.painType;
    }

    // Triggers Match
    if (specialist.triggers && specialist.weight.triggers) {
        const triggerMatches = assessmentData.painTriggers.filter(trigger =>
            specialist.triggers.some(specTrigger =>
                trigger.toLowerCase().includes(specTrigger.toLowerCase())
            )
        );
        if (triggerMatches.length > 0) {
            const matchRatio = triggerMatches.length / Math.max(assessmentData.painTriggers.length, 1);
            totalScore += specialist.weight.triggers * matchRatio;
            matchReasons.push('Tetikleyici faktör uyumu');
        }
        totalWeight += specialist.weight.triggers;
    }

    // Relievers Match
    if (specialist.relievers && specialist.weight.relievers) {
        const relieverMatches = assessmentData.painRelievers.filter(reliever =>
            specialist.relievers.some(specReliever =>
                reliever.toLowerCase().includes(specReliever.toLowerCase())
            )
        );
        if (relieverMatches.length > 0) {
            const matchRatio = relieverMatches.length / Math.max(assessmentData.painRelievers.length, 1);
            totalScore += specialist.weight.relievers * matchRatio;
            matchReasons.push('Rahatlama faktörü uyumu');
        }
        totalWeight += specialist.weight.relievers;
    }

    // Goals Match
    if (specialist.goals && specialist.weight.goals) {
        const goalMatches = assessmentData.treatmentGoals.filter(goal =>
            specialist.goals.some(specGoal =>
                goal.toLowerCase().includes(specGoal.toLowerCase())
            )
        );
        if (goalMatches.length > 0) {
            const matchRatio = goalMatches.length / assessmentData.treatmentGoals.length;
            totalScore += specialist.weight.goals * matchRatio;
            matchReasons.push('Tedavi hedefi uyumu');
        }
        totalWeight += specialist.weight.goals;
    }

    // Pain Duration Match (for chronic pain specialists)
    if (specialist.painDuration && specialist.weight.painDuration) {
        if (specialist.painDuration.includes(assessmentData.painDuration)) {
            totalScore += specialist.weight.painDuration;
            matchReasons.push('Kronik ağrı uzmanlığı');
        }
        totalWeight += specialist.weight.painDuration;
    }

    // Functional Impact Match
    if (specialist.functionalImpact && specialist.weight.functionalImpact) {
        const avgImpact = (
            assessmentData.dailyActivitiesImpact +
            assessmentData.sleepImpact +
            assessmentData.workImpact +
            assessmentData.socialImpact
        ) / 4;

        if (specialist.functionalImpact.some(level => Math.round(avgImpact) === level)) {
            totalScore += specialist.weight.functionalImpact;
            matchReasons.push('Yüksek fonksiyonel etki yönetimi');
        }
        totalWeight += specialist.weight.functionalImpact;
    }

    // Calculate final score (0-100)
    const finalScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;

    return {
        type: specialistType,
        score: finalScore,
        matchReasons: matchReasons.slice(0, 3) // Top 3 reasons
    };
}

/**
 * Get recommended specialists for assessment
 */
export function getRecommendedSpecialists(assessmentData) {
    const specialists = Object.keys(SPECIALIST_KEYWORDS);

    // Calculate scores for all specialists
    const scoredSpecialists = specialists
        .map(type => calculateSpecialistScore(type, assessmentData))
        .filter(result => result.score > 0) // Only include matches
        .sort((a, b) => b.score - a.score); // Sort by score descending

    // Return top 3
    return scoredSpecialists.slice(0, 3);
}
