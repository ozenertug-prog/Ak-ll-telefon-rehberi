
import React from 'react';
import type { PhoneRecommendation } from '../types';
import PhoneCard from './PhoneCard';

// Reusing the skeleton from Results.tsx
const LoadingSkeleton: React.FC = () => (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 animate-pulse">
        <div className="h-40 bg-slate-700 rounded-lg mb-4"></div>
        <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
    </div>
);


interface SimilarPhonesModalProps {
    targetPhone: PhoneRecommendation;
    similarPhones: PhoneRecommendation[];
    isLoading: boolean;
    onClose: () => void;
    onAddToComparison: (phone: PhoneRecommendation) => void;
    comparisonList: PhoneRecommendation[];
    favorites: string[];
    onToggleFavorite: (phoneModel: string) => void;
    onShowSimilar: (phone: PhoneRecommendation) => void;
}

const SimilarPhonesModal: React.FC<SimilarPhonesModalProps> = ({
    targetPhone,
    similarPhones,
    isLoading,
    onClose,
    onAddToComparison,
    comparisonList,
    favorites,
    onToggleFavorite,
    onShowSimilar,
}) => {

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                </div>
            );
        }

        if (similarPhones.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center py-16">
                    <i className="fas fa-box-open text-6xl text-slate-500 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-300">Benzer Model Bulunamadı</h3>
                    <p className="text-slate-400 mt-1">Bu model için uygun bir alternatif bulunamadı.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarPhones.map((rec) => {
                    const isInComparison = comparisonList.some(p => p.model === rec.model);
                    const isFavorite = favorites.includes(rec.model);
                    return (
                        <PhoneCard
                            key={rec.model}
                            recommendation={rec}
                            onAddToComparison={onAddToComparison}
                            isInComparison={isInComparison}
                            isFavorite={isFavorite}
                            onToggleFavorite={onToggleFavorite}
                            onShowSimilar={onShowSimilar}
                        />
                    );
                })}
            </div>
        );
    };


    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-6xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">
                        <i className="fas fa-search-plus mr-3 text-cyan-400"></i>
                        <span className="text-slate-400 font-normal mr-2">Benzer Modeller:</span>
                        {targetPhone.model}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </header>
                <div className="overflow-auto p-4 md:p-6">
                   {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SimilarPhonesModal;
