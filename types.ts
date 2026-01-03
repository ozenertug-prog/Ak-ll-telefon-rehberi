
export interface UserPreferences {
    budget: number;
    camera: 'oncelikli' | 'standart' | 'onemsiz';
    battery: 'oncelikli' | 'standart' | 'onemsiz';
    performance: 'oyun' | 'gunluk' | 'temel';
    screenSize: 'buyuk' | 'kompakt' | 'farketmez';
    os: 'android' | 'ios' | 'farketmez';
}

export interface PhoneRecommendation {
    model: string;
    brand: string;
    os: string;
    estimatedPrice: string;
    summary: string;
    pros: string[];
    cons: string[];
    specs: {
        display: string;
        battery: string;
        camera: string;
        processor: string;
        ram: string;
        storage: string;
    };
    matchScore: number;
    mismatchReason?: string;
}
