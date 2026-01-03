
import React, { useState, useEffect } from 'react';
import type { PhoneRecommendation } from '../types';
import { generatePhoneImage } from '../services/geminiService';

interface PhoneCardProps {
    recommendation: PhoneRecommendation;
    onAddToComparison: (phone: PhoneRecommendation) => void;
    isInComparison: boolean;
    isFavorite: boolean;
    onToggleFavorite: (phoneModel: string) => void;
    onShowSimilar: (phone: PhoneRecommendation) => void;
}

const ImagePlaceholder: React.FC = () => (
    <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
        <i className="fas fa-image text-5xl text-slate-500"></i>
    </div>
);

const SpecItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <i className={`fas ${icon} text-cyan-400/80 fa-fw w-5 text-center mt-1`}></i>
        <div className="ml-2">
            <p className="text-xs text-slate-400 leading-tight">{label}</p>
            <p className="font-semibold text-slate-200 text-sm leading-tight">{value}</p>
        </div>
    </div>
);

const MatchScore: React.FC<{ score: number }> = ({ score }) => (
    <div className="absolute top-4 left-4 h-12 w-12 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-cyan-500 shadow-lg">
        <span className="font-bold text-lg text-cyan-400">{score}</span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-cyan-600 font-semibold mt-4">PUAN</span>
    </div>
);


const PhoneCard: React.FC<PhoneCardProps> = ({ recommendation, onAddToComparison, isInComparison, isFavorite, onToggleFavorite, onShowSimilar }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setIsImageLoading(true);
        setImageUrl(null);

        const fetchImage = async () => {
            try {
                const url = await generatePhoneImage(recommendation.model);
                if (isMounted) setImageUrl(url);
            } catch (error) {
                console.error("Failed to generate image for", recommendation.model, error);
                if (isMounted) {
                    const seed = recommendation.model.replace(/\s+/g, '');
                    setImageUrl(`https://picsum.photos/seed/${seed}/600/400`);
                }
            } finally {
                if (isMounted) setIsImageLoading(false);
            }
        };

        fetchImage();
        return () => { isMounted = false; };
    }, [recommendation.model]);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="group bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700 flex flex-col relative aspect-[3/5] transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:scale-[1.02]">
            {/* --- BACKGROUND IMAGE --- */}
            <div className="absolute inset-0">
                {isImageLoading && <ImagePlaceholder />}
                {imageUrl && <img className="w-full h-full object-cover transition-opacity duration-500" src={imageUrl} alt={recommendation.model} style={{ opacity: isImageLoading ? 0 : 1 }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
            </div>

            <MatchScore score={recommendation.matchScore} />
            <button
                onClick={() => onToggleFavorite(recommendation.model)}
                className={`absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full text-xl transition-all duration-300 backdrop-blur-sm z-20 ${
                    isFavorite 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-black/40 text-slate-200 hover:bg-red-500/60 hover:scale-110'
                } ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
            >
                <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
            </button>


            {/* --- ALWAYS VISIBLE CONTENT --- */}
            <div className="relative mt-auto p-5 z-10">
                <h3 className="text-xl font-bold text-white drop-shadow-lg">{recommendation.model}</h3>
                <p className="text-sm text-slate-300 drop-shadow-lg">{recommendation.summary}</p>
                 {recommendation.mismatchReason && (
                    <div className="mt-3 p-2 text-xs bg-yellow-900/50 border border-yellow-700/80 rounded-lg flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-yellow-400 flex-shrink-0"></i>
                        <span className="text-yellow-300">{recommendation.mismatchReason}</span>
                    </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <button
                        onClick={toggleExpand}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-info-circle"></i> Detaylar
                    </button>
                    <button
                        onClick={() => onAddToComparison(recommendation)}
                        disabled={isInComparison}
                        className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
                    >
                       {isInComparison ? (
                           <><i className="fas fa-check-circle"></i>Karşılaştırmada</>
                       ) : (
                           <><i className="fas fa-balance-scale-right"></i>Karşılaştır</>
                       )}
                    </button>
                </div>
            </div>

            {/* --- CLICK OVERLAY --- */}
            <div className={`absolute inset-0 bg-slate-900/90 backdrop-blur-md p-5 transition-opacity duration-300 flex flex-col ${isExpanded ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'}`}>
                 <button
                    onClick={toggleExpand}
                    className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full text-xl transition-all duration-300 bg-black/40 text-slate-200 hover:bg-red-500/60 hover:scale-110 z-30"
                    aria-label="Detayları gizle"
                >
                    <i className="fas fa-times"></i>
                </button>

                <h3 className="text-xl font-bold text-cyan-400 mb-1">{recommendation.model}</h3>
                <p className="text-sm text-slate-400 mb-4">{recommendation.estimatedPrice}</p>
                
                <div className="my-2 grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-y border-slate-700 py-3">
                    <SpecItem icon="fa-mobile-screen" label="Ekran" value={recommendation.specs.display} />
                    <SpecItem icon="fa-microchip" label="İşlemci" value={recommendation.specs.processor} />
                    <SpecItem icon="fa-memory" label="RAM" value={recommendation.specs.ram} />
                    <SpecItem icon="fa-hdd" label="Depolama" value={recommendation.specs.storage} />
                    <SpecItem icon="fa-camera" label="Kamera" value={recommendation.specs.camera} />
                    <SpecItem icon="fa-battery-full" label="Batarya" value={recommendation.specs.battery} />
                </div>
                 
                <div className="flex-grow space-y-3 mt-2 overflow-y-auto pr-2 text-sm">
                    <div>
                        <h4 className="font-semibold text-green-400 mb-1">Artıları</h4>
                        <ul className="list-none space-y-1 text-slate-300">
                            {recommendation.pros.map((pro, i) => (
                                <li key={i} className="flex items-start"><i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i><span>{pro}</span></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-400 mb-1">Eksileri</h4>
                        <ul className="list-none space-y-1 text-slate-300">
                            {recommendation.cons.map((con, i) => (
                                <li key={i} className="flex items-start"><i className="fas fa-minus-circle text-red-500 mr-2 mt-1"></i><span>{con}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                     <button
                        onClick={() => onShowSimilar(recommendation)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
                    >
                       <i className="fas fa-search-plus mr-2"></i> Benzer Modelleri Bul
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhoneCard;
