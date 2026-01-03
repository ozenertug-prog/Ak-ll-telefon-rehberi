
import React from 'react';
import type { PhoneRecommendation } from '../types';
import PhoneCard from './PhoneCard';
import FilterControls from './FilterControls';

interface ResultsProps {
    recommendations: PhoneRecommendation[]; // Original list for filter options
    filteredRecommendations: PhoneRecommendation[]; // Filtered list for display
    isLoading: boolean;
    error: string | null;
    isInitialState: boolean;
    onAddToComparison: (phone: PhoneRecommendation) => void;
    comparisonList: PhoneRecommendation[];
    favorites: string[];
    onToggleFavorite: (phoneModel: string) => void;
    activeFilters: { brand: string; os: string };
    onFilterChange: (filterType: 'brand' | 'os', value: string) => void;
    onClearFilters: () => void;
    onShowSimilar: (phone: PhoneRecommendation) => void;
}

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

const Results: React.FC<ResultsProps> = ({ 
    recommendations,
    filteredRecommendations,
    isLoading,
    error,
    isInitialState,
    onAddToComparison,
    comparisonList,
    favorites,
    onToggleFavorite,
    activeFilters,
    onFilterChange,
    onClearFilters,
    onShowSimilar
}) => {
    
    if (isInitialState) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-800/50 rounded-xl p-8 border-2 border-dashed border-slate-700 text-center">
                <i className="fas fa-magic text-6xl text-cyan-500 mb-4"></i>
                <h2 className="text-2xl font-bold text-slate-200">Size Özel Tavsiyeler Burada</h2>
                <p className="text-slate-400 mt-2 max-w-md">
                    Soldaki formu doldurarak bütçenize ve ihtiyaçlarınıza en uygun akıllı telefon önerilerini anında alın.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                 <h2 className="text-3xl font-bold mb-6 text-slate-300">En İyi Seçenekler Aranıyor...</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-red-900/20 rounded-xl p-8 border border-red-700 text-center">
                <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h2 className="text-2xl font-bold text-red-400">Bir Sorun Oluştu</h2>
                <p className="text-red-300 mt-2 max-w-md">{error}</p>
            </div>
        );
    }
    
    if (recommendations.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-slate-800/50 rounded-xl p-8 border-2 border-dashed border-slate-700 text-center">
                <i className="fas fa-search text-6xl text-cyan-500 mb-4"></i>
                <h2 className="text-2xl font-bold text-slate-200">Sonuç Bulunamadı</h2>
                <p className="text-slate-400 mt-2 max-w-md">
                    Belirttiğiniz kriterlere uygun bir telefon bulunamadı. Lütfen filtrelerinizi değiştirip tekrar deneyin.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-300 mb-4 md:mb-0">Sizin İçin Önerilerimiz</h2>
            </div>
            
            <FilterControls
                recommendations={recommendations}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
                onClearFilters={onClearFilters}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecommendations.map((rec, index) => {
                    const isInComparison = comparisonList.some(p => p.model === rec.model);
                    const isFavorite = favorites.includes(rec.model);
                    return (
                        <PhoneCard 
                            key={index} 
                            recommendation={rec}
                            onAddToComparison={onAddToComparison}
                            isInComparison={isInComparison}
                            isFavorite={isFavorite}
                            onToggleFavorite={onToggleFavorite}
                            onShowSimilar={onShowSimilar}
                        />
                    )
                })}
            </div>
            {filteredRecommendations.length === 0 && (
                 <div className="col-span-full flex flex-col items-center justify-center text-center mt-8 bg-slate-800/50 p-6 rounded-lg">
                    <i className="fas fa-filter text-4xl text-slate-500 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-300">Bu Filtrelerle Eşleşen Sonuç Yok</h3>
                    <p className="text-slate-400 mt-1">Lütfen filtre seçiminizi değiştirin veya sıfırlayın.</p>
                </div>
            )}
        </div>
    );
};

export default Results;
