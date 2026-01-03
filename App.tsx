
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { UserPreferences, PhoneRecommendation } from './types';
import { getPhoneRecommendations, getSimilarPhones } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import Results from './components/Results';
import Comparison from './components/Comparison';
import SimilarPhonesModal from './components/SimilarPhonesModal';

const App: React.FC = () => {
    const [recommendations, setRecommendations] = useState<PhoneRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
    const [comparisonList, setComparisonList] = useState<PhoneRecommendation[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<{ brand: string; os: string }>({
        brand: 'all',
        os: 'all',
    });
    const [similarPhones, setSimilarPhones] = useState<PhoneRecommendation[]>([]);
    const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(false);
    const [similarModalTarget, setSimilarModalTarget] = useState<PhoneRecommendation | null>(null);

    useEffect(() => {
      try {
        const storedFavorites = localStorage.getItem('phoneFavorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Failed to load favorites from localStorage", error);
      }
    }, []);

    useEffect(() => {
      try {
        localStorage.setItem('phoneFavorites', JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites to localStorage", error);
      }
    }, [favorites]);

    const handleGenerateRecommendations = useCallback(async (preferences: UserPreferences) => {
        setIsLoading(true);
        setError(null);
        setIsFormSubmitted(true);
        setComparisonList([]); // Clear comparison on new search
        setActiveFilters({ brand: 'all', os: 'all' }); // Reset filters on new search
        try {
            const result = await getPhoneRecommendations(preferences);
            // Ensure sorting as a fallback
            result.sort((a, b) => b.matchScore - a.matchScore);
            setRecommendations(result);
        } catch (err) {
            console.error(err);
            setError('Tavsiyeler alınırken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAddToComparison = useCallback((phone: PhoneRecommendation) => {
        setComparisonList(prevList => {
            if (prevList.length >= 3) {
                alert("En fazla 3 telefon karşılaştırabilirsiniz.");
                return prevList;
            }
            if (prevList.some(p => p.model === phone.model)) {
                return prevList; // Already in list
            }
            return [...prevList, phone];
        });
    }, []);

    const handleRemoveFromComparison = useCallback((phoneModel: string) => {
        setComparisonList(prevList => prevList.filter(p => p.model !== phoneModel));
    }, []);
    
    const handleClearComparison = useCallback(() => {
        setComparisonList([]);
    }, []);

    const handleToggleFavorite = useCallback((phoneModel: string) => {
      setFavorites(prev => 
        prev.includes(phoneModel) 
          ? prev.filter(model => model !== phoneModel) 
          : [...prev, phoneModel]
      );
    }, []);

    const handleFilterChange = useCallback((filterType: 'brand' | 'os', value: string) => {
        setActiveFilters(prev => ({ ...prev, [filterType]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setActiveFilters({ brand: 'all', os: 'all' });
    }, []);

    const handleShowSimilar = useCallback(async (phone: PhoneRecommendation) => {
        setSimilarModalTarget(phone);
        setIsSimilarLoading(true);
        setSimilarPhones([]);
        try {
            const results = await getSimilarPhones(phone);
            setSimilarPhones(results);
        } catch (err) {
            console.error(err);
            // Optionally, set an error state for the modal
        } finally {
            setIsSimilarLoading(false);
        }
    }, []);

    const handleCloseSimilarModal = useCallback(() => {
        setSimilarModalTarget(null);
        setSimilarPhones([]);
    }, []);

    const filteredRecommendations = useMemo(() => {
        return recommendations.filter(phone => {
            const brandMatch = activeFilters.brand === 'all' || phone.brand === activeFilters.brand;
            const osMatch = activeFilters.os === 'all' || phone.os === activeFilters.os;
            return brandMatch && osMatch;
        });
    }, [recommendations, activeFilters]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                         <InputForm onSubmit={handleGenerateRecommendations} isLoading={isLoading} />
                    </div>
                    <div className="lg:col-span-2">
                        <Results
                            recommendations={recommendations}
                            filteredRecommendations={filteredRecommendations}
                            isLoading={isLoading}
                            error={error}
                            isInitialState={!isFormSubmitted}
                            onAddToComparison={handleAddToComparison}
                            comparisonList={comparisonList}
                            favorites={favorites}
                            onToggleFavorite={handleToggleFavorite}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            onShowSimilar={handleShowSimilar}
                        />
                    </div>
                </div>
                <Comparison 
                    list={comparisonList} 
                    onRemove={handleRemoveFromComparison} 
                    onClear={handleClearComparison}
                />
            </main>
            {similarModalTarget && (
                <SimilarPhonesModal
                    targetPhone={similarModalTarget}
                    similarPhones={similarPhones}
                    isLoading={isSimilarLoading}
                    onClose={handleCloseSimilarModal}
                    onAddToComparison={handleAddToComparison}
                    comparisonList={comparisonList}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onShowSimilar={handleShowSimilar}
                />
            )}
            <footer className="text-center p-4 mt-8 text-slate-500 text-sm">
                <p>Yapay Zeka Destekli Akıllı Telefon Rehberi &copy; 2024</p>
            </footer>
        </div>
    );
};

export default App;
