
import React, { useMemo } from 'react';
import type { PhoneRecommendation } from '../types';

interface FilterControlsProps {
    recommendations: PhoneRecommendation[];
    activeFilters: { brand: string; os: string };
    onFilterChange: (filterType: 'brand' | 'os', value: string) => void;
    onClearFilters: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ recommendations, activeFilters, onFilterChange, onClearFilters }) => {
    
    const filterOptions = useMemo(() => {
        const brands = [...new Set(recommendations.map(r => r.brand))].sort();
        const oses = [...new Set(recommendations.map(r => r.os))].sort();
        return { brands, oses };
    }, [recommendations]);

    const showClearButton = activeFilters.brand !== 'all' || activeFilters.os !== 'all';

    if (recommendations.length === 0) return null;

    return (
        <div className="bg-slate-800/60 p-4 rounded-lg mb-6 border border-slate-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 text-sm font-semibold text-slate-300">
                <i className="fas fa-filter mr-2"></i>Filtrele:
            </div>
            <div className="w-full sm:w-auto">
                <select
                    value={activeFilters.brand}
                    onChange={(e) => onFilterChange('brand', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                >
                    <option value="all">Tüm Markalar</option>
                    {filterOptions.brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>
            </div>
            <div className="w-full sm:w-auto">
                 <select
                    value={activeFilters.os}
                    onChange={(e) => onFilterChange('os', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                >
                    <option value="all">Tüm İşletim Sistemleri</option>
                    {filterOptions.oses.map(os => (
                        <option key={os} value={os}>{os}</option>
                    ))}
                </select>
            </div>
            {showClearButton && (
                 <button
                    onClick={onClearFilters}
                    className="w-full sm:w-auto bg-red-600/30 hover:bg-red-600/50 text-red-300 text-sm font-semibold py-2 px-3 rounded-md transition-all ml-auto flex items-center justify-center gap-2"
                >
                    <i className="fas fa-times-circle"></i>
                    Tümünü Temizle
                </button>
            )}
        </div>
    );
};

export default FilterControls;
