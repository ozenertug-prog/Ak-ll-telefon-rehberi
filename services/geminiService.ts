
import { GoogleGenAI, Type } from "@google/genai";
import type { UserPreferences, PhoneRecommendation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        model: { type: Type.STRING, description: "Akıllı telefonun tam modeli." },
        brand: { type: Type.STRING, description: "Telefonun markası (örn: Samsung, Apple, Xiaomi)." },
        os: { type: Type.STRING, description: "Telefonun işletim sistemi (örn: Android, iOS)." },
        estimatedPrice: { type: Type.STRING, description: "Telefonun Türkiye'deki yaklaşık fiyat aralığı (örn: 20.000 - 25.000 TL)." },
        summary: { type: Type.STRING, description: "Bu telefonun neden kullanıcı için uygun olduğuna dair 2-3 cümlelik özet." },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Telefonun 3 adet olumlu yönü." },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Telefonun 2 adet olumsuz yönü." },
        specs: {
            type: Type.OBJECT,
            description: "Telefonun temel teknik özellikleri.",
            properties: {
                display: { type: Type.STRING, description: "Ekran boyutu ve teknolojisi (örn: 6.7 inç, AMOLED, 120Hz)." },
                battery: { type: Type.STRING, description: "Batarya kapasitesi (örn: 5000 mAh)." },
                camera: { type: Type.STRING, description: "Ana kamera özellikleri (örn: 108 MP, OIS)." },
                processor: { type: Type.STRING, description: "İşlemci modeli (örn: Snapdragon 8 Gen 2)." },
                ram: { type: Type.STRING, description: "RAM seçenekleri (örn: 8 GB / 12 GB)." },
                storage: { type: Type.STRING, description: "Dahili depolama seçenekleri (örn: 128 GB / 256 GB)." },
            },
            required: ["display", "battery", "camera", "processor", "ram", "storage"]
        },
        matchScore: { type: Type.INTEGER, description: "Bu telefonun kullanıcının tercihlerine ne kadar uygun olduğunu gösteren 1-100 arası bir puan." },
        mismatchReason: { type: Type.STRING, description: "Eğer telefon bir kritere tam uymuyorsa (örn: bütçeyi biraz aşıyorsa) ama yine de iyi bir seçenekse, nedenini açıklayan kısa bir not. Tam uyan modeller için bu alanı boş bırak." }
    },
    required: ["model", "brand", "os", "estimatedPrice", "summary", "pros", "cons", "specs", "matchScore"],
};

const buildPrompt = (preferences: UserPreferences): string => {
    return `
        Sen, en son çıkan akıllı telefon modelleri, teknolojileri ve Türkiye pazarındaki fiyatları hakkında derin bilgiye sahip, tarafsız bir teknoloji uzmanısın.
        Görevin, aşağıda belirtilen kullanıcı tercihlerine göre en uygun 5 adet akıllı telefonu tavsiye etmektir.
        Cevabını yalnızca JSON formatında, belirtilen şemaya uygun olarak ver. Hiçbir açıklama veya giriş metni ekleme. Sadece JSON array'i döndür.
        
        Her bir tavsiye için:
        1.  Tüm istenen teknik özellikleri (ekran, batarya, kamera, işlemci, RAM, depolama) ve bilgileri (model, marka, işletim sistemi, fiyat, özet, artılar/eksiler) doldur.
        2.  Kullanıcının tercihlerine ne kadar uyduğunu belirten 1 ile 100 arasında bir 'matchScore' (uygunluk puanı) ata. 100 en mükemmel eşleşmedir.
        3.  Eğer bir model, bir veya daha fazla kritere tam uymasa da (örneğin bütçeyi %10-15 aşması gibi) yine de çok iyi bir alternatif ise, onu listeye dahil et. Bu durumda, 'mismatchReason' alanına nedenini açıklayan kısa bir not ekle. Örneğin: "Bütçenizin biraz üzerinde ancak kamera performansı beklentilerinizi fazlasıyla karşılıyor." Tam uyan modeller için bu alanı boş bırak.
        4.  Sonuçları 'matchScore'a göre en yüksekten en düşüğe doğru sıralanmış olarak döndür.

        Kullanıcı Tercihleri:
        - Bütçe: Maksimum ${preferences.budget} TL
        - Kamera Önceliği: ${preferences.camera}
        - Batarya Ömrü Önceliği: ${preferences.battery}
        - Performans Beklentisi: ${preferences.performance} (Oyun odaklı mı, günlük kullanım mı, temel işlevler mi?)
        - Ekran Boyutu Terhi: ${preferences.screenSize}
        - İşletim Sistemi Terhi: ${preferences.os}

        Lütfen bu kriterlere en uygun, güncel ve Türkiye'de bulunabilir 5 farklı telefon öner.
    `;
};


export const getPhoneRecommendations = async (preferences: UserPreferences): Promise<PhoneRecommendation[]> => {
    const prompt = buildPrompt(preferences);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: recommendationSchema,
                },
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const recommendations = JSON.parse(jsonText) as PhoneRecommendation[];
        // Ensure sorting just in case API doesn't follow instructions perfectly
        recommendations.sort((a, b) => b.matchScore - a.matchScore);
        return recommendations;

    } catch (error) {
        console.error("Error fetching recommendations from Gemini API:", error);
        throw new Error("Yapay zeka modelinden tavsiye alınamadı.");
    }
};

export const getSimilarPhones = async (phone: PhoneRecommendation): Promise<PhoneRecommendation[]> => {
    const prompt = `
        Sen, en son çıkan akıllı telefon modelleri, teknolojileri ve Türkiye pazarındaki fiyatları hakkında derin bilgiye sahip, tarafsız bir teknoloji uzmanısın.
        Görevin, aşağıda detayları verilen referans akıllı telefona benzer özelliklere sahip 3 adet alternatif model önermektir.
        Önerilerin, referans telefonla benzer fiyat aralığında, performans (işlemci), kamera kalitesi ve batarya ömrü gibi kilit özelliklerde rekabetçi olmalıdır. Mümkünse farklı markalardan öneriler sun.
        Her önerinin neden iyi bir alternatif olduğunu 'summary' alanında kısaca açıkla.
        Cevabını yalnızca JSON formatında, belirtilen şemaya uygun olarak ver. Hiçbir açıklama veya giriş metni ekleme. Sadece JSON array'i döndür.

        Referans Telefon:
        - Model: ${phone.model}
        - Fiyat Aralığı: ${phone.estimatedPrice}
        - İşlemci: ${phone.specs.processor}
        - Kamera: ${phone.specs.camera}
        - Batarya: ${phone.specs.battery}

        Lütfen bu telefona en uygun 3 alternatifi öner. Her bir alternatif için 'matchScore'u referans telefona ne kadar benzediğine göre 1-100 arasında ata.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: recommendationSchema,
                },
                temperature: 0.6,
            },
        });
        
        const jsonText = response.text.trim();
        const recommendations = JSON.parse(jsonText) as PhoneRecommendation[];
        recommendations.sort((a, b) => b.matchScore - a.matchScore);
        return recommendations;

    } catch (error) {
        console.error("Error fetching similar phones from Gemini API:", error);
        throw new Error("Yapay zeka modelinden benzer modeller alınamadı.");
    }
};

export const comparePhoneFeatures = async (featureName: string, featuresToCompare: { model: string; value: string }[]): Promise<string> => {
    const prompt = `
        Sen bir mobil teknoloji karşılaştırma uzmanısın.
        Aşağıdaki telefonların belirtilen özelliğini detaylıca karşılaştır.
        Karşılaştırmanı teknik detaylara dayandırarak yap, ancak sonuçları herkesin anlayabileceği net ve basit bir dille özetle.
        Performans, verimlilik, kalite ve kullanıcı deneyimi gibi konulardaki temel farkları, avantajları ve dezavantajları vurgula.
        Cevabını madde işaretleri (*) kullanarak, okunması kolay bir formatta sun.

        Karşılaştırılacak Özellik: "${featureName}"

        Telefonlar ve Özellik Değerleri:
        ${featuresToCompare.map(p => `- ${p.model}: ${p.value}`).join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error comparing features with Gemini API:", error);
        throw new Error("Yapay zeka modelinden karşılaştırma alınamadı.");
    }
};

export const generatePhoneImage = async (phoneModel: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: `A professional, high-quality product photograph of the ${phoneModel} smartphone. The phone should be displayed on a clean, minimalist, light-colored background. The image should be sleek and modern, highlighting the phone's design.`,
                    },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }

        throw new Error("No image data found in the response.");

    } catch (error) {
        console.error(`Error generating image for ${phoneModel}:`, error);
        throw error;
    }
};
