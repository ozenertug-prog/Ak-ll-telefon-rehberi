
import React, { useState } from 'react';
import type { PhoneRecommendation } from '../types';
import { comparePhoneFeatures } from '../services/geminiService';

interface ComparisonProps {
    list: PhoneRecommendation[];
    onRemove: (phoneModel: string) => void;
    onClear: () => void;
}

const FeatureComparisonPopup: React.FC<{
    data: { feature: string; result: string; isLoading: boolean };
    onClose: () => void;
}> = ({ data, onClose }) => {
    
    const formatResult = (text: string) => {
        return text.split('* ').filter(line => line.trim() !== '').map((line, index) => (
            <li key={index} className="flex items-start">
                 <i className="fas fa-info-circle text-cyan-400 mr-3 mt-1 flex-shrink-0"></i>
                <span>{line}</span>
            </li>
        ));
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-cyan-400">
                        <i className="fas fa-microscope mr-2"></i>
                        Detaylı Karşılaştırma: <span className="text-white">{data.feature}</span>
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </header>
                <div className="p-6 overflow-auto">
                    {data.isLoading ? (
                        <div className="flex flex-col items-center justify-center text-center text-slate-400">
                             <svg className="animate-spin h-8 w-8 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="font-semibold">Yapay zeka analiz ediyor...</p>
                            <p className="text-sm">Lütfen bekleyin.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3 text-slate-300">
                           {formatResult(data.result)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


const ComparisonModal: React.FC<{ list: PhoneRecommendation[], onClose: () => void }> = ({ list, onClose }) => {
    const [comparisonData, setComparisonData] = useState<{
        feature: string;
        result: string;
        isLoading: boolean;
    } | null>(null);

    const handleFeatureCompare = async (featureTitle: string, featuresToCompare: { model: string; value: string }[]) => {
        if (comparisonData?.isLoading) return;

        setComparisonData({ feature: featureTitle, result: '', isLoading: true });
        try {
            const result = await comparePhoneFeatures(featureTitle, featuresToCompare);
            setComparisonData({ feature: featureTitle, result, isLoading: false });
        } catch (error) {
            console.error(error);
            alert("Özellik karşılaştırması sırasında bir hata oluştu.");
            setComparisonData(null);
        }
    };
    
    const specRows: { title: string; key: keyof PhoneRecommendation['specs'] }[] = [
        { title: 'Ekran', key: 'display' },
        { title: 'Batarya', key: 'battery' },
        { title: 'Kamera', key: 'camera' },
        { title: 'İşlemci', key: 'processor' },
        { title: 'RAM', key: 'ram' },
        { title: 'Depolama', key: 'storage' },
    ];

    return (
    <>
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-6xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">
                        <i className="fas fa-balance-scale-right mr-3 text-cyan-400"></i>
                        Cihaz Karşılaştırması
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </header>
                <div className="overflow-auto p-4 md:p-6">
                    <div className="inline-block min-w-full">
                        <div className={`grid gap-px bg-slate-700`} style={{ gridTemplateColumns: `minmax(120px, 0.5fr) repeat(${list.length}, 1fr)` }}>
                            <div className="bg-slate-800 p-3 font-bold sticky top-0 left-0 z-10">Özellik</div>
                            
                            {list.map(phone => (
                                <div key={phone.model} className="bg-slate-800 p-3 text-center sticky top-0 z-10">
                                    <h3 className="font-bold text-base text-cyan-400">{phone.model}</h3>
                                </div>
                            ))}

                            {specRows.map(row => (
                                <FeatureRow
                                    key={row.key}
                                    title={row.title}
                                    onCompare={() => handleFeatureCompare(row.title, list.map(p => ({ model: p.model, value: p.specs[row.key] })))}
                                >
                                    <>{list.map(phone => <CellData key={phone.model}>{phone.specs[row.key]}</CellData>)}</>
                                </FeatureRow>
                            ))}
                            
                            <FeatureRow title="Tahmini Fiyat"><>{list.map(phone => <CellData key={phone.model}>{phone.estimatedPrice}</CellData>)}</></FeatureRow>
                            <FeatureRow title="Özet"><>{list.map(phone => <CellData key={phone.model}>{phone.summary}</CellData>)}</></FeatureRow>
                            <FeatureRow title="Artıları"><>{list.map(phone => <ListCellData key={phone.model} items={phone.pros} type="pro" />)}</></FeatureRow>
                            <FeatureRow title="Eksileri"><>{list.map(phone => <ListCellData key={phone.model} items={phone.cons} type="con" />)}</></FeatureRow>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {comparisonData && (
            <FeatureComparisonPopup 
                data={comparisonData}
                onClose={() => setComparisonData(null)}
            />
        )}
    </>
    )
};

const Comparison: React.FC<ComparisonProps> = ({ list, onRemove, onClear }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (list.length === 0) {
        return null;
    }

    const canCompare = list.length >= 2;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 z-30 shadow-2xl animate-slide-up">
                <div className="container mx-auto p-4 flex items-center justify-between gap-4">
                    <div className="flex-grow flex items-center gap-3 overflow-x-auto">
                        {list.map(phone => (
                            <div key={phone.model} className="flex-shrink-0 bg-slate-700 text-sm rounded-full py-1 px-3 flex items-center gap-2">
                                <span className="text-slate-200">{phone.model}</span>
                                <button onClick={() => onRemove(phone.model)} className="text-slate-400 hover:text-red-400">
                                    <i className="fas fa-times-circle"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!canCompare}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-5 rounded-full transition duration-300 ease-in-out flex items-center justify-center"
                        >
                            <i className="fas fa-balance-scale-right mr-2"></i>
                            Karşılaştır ({list.length}/3)
                        </button>
                        <button
                            onClick={onClear}
                            className="bg-red-600/50 hover:bg-red-600/80 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out text-sm"
                            aria-label="Tüm karşılaştırma listesini temizle"
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            {isModalOpen && <ComparisonModal list={list} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

// Helper components for the table
const FeatureRow: React.FC<{title: string; children: React.ReactNode; onCompare?: () => void}> = ({title, children, onCompare}) => (
    <>
        <div className="bg-slate-800 p-3 font-semibold text-slate-300 sticky left-0 z-10 flex items-center">
             {onCompare ? (
                <button onClick={onCompare} className="text-left w-full flex items-center justify-between group">
                    <span className="group-hover:text-cyan-400 transition-colors">{title}</span>
                    <i className="fas fa-microscope text-xs ml-2 text-slate-500 group-hover:text-cyan-400 transition-colors"></i>
                </button>
            ) : (
                <span>{title}</span>
            )}
        </div>
        {children}
    </>
);

const CellData: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="bg-slate-900 p-3 text-sm text-slate-300 flex items-center">{children}</div>
);

const ListCellData: React.FC<{items: string[], type: 'pro' | 'con'}> = ({items, type}) => (
    <div className="bg-slate-900 p-3 text-sm text-slate-300">
        <ul className="list-none space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start">
                    <i className={`fas ${type === 'pro' ? 'fa-check-circle text-green-500/80' : 'fa-minus-circle text-red-500/80'} mr-2 mt-1 flex-shrink-0`}></i>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);


export default Comparison;
