
import React, { useState } from 'react';
import type { UserPreferences } from '../types';

interface InputFormProps {
    onSubmit: (preferences: UserPreferences) => void;
    isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
    const [preferences, setPreferences] = useState<UserPreferences>({
        budget: 15000,
        camera: 'standart',
        battery: 'standart',
        performance: 'gunluk',
        screenSize: 'farketmez',
        os: 'farketmez',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: name === 'budget' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(preferences);
    };
    
    const budgetSteps = Array.from({ length: (100000 - 5000) / 2500 + 1 }, (_, i) => 5000 + i * 2500);

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Tercihlerinizi Belirtin</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-slate-300 mb-2">
                        Bütçe: <span className="font-bold text-cyan-400">{preferences.budget.toLocaleString('tr-TR')} TL</span>
                    </label>
                    <input
                        type="range"
                        id="budget"
                        name="budget"
                        min="5000"
                        max="100000"
                        step="2500"
                        value={preferences.budget}
                        onChange={handleChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                     <div className="w-full flex justify-between text-xs text-slate-400 mt-1">
                        <span>5k</span>
                        <span>50k</span>
                        <span>100k</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField id="camera" name="camera" label="Kamera" value={preferences.camera} onChange={handleChange}>
                        <option value="oncelikli">Önceliğim Kamera</option>
                        <option value="standart">Standart Olsun</option>
                        <option value="onemsiz">Önemli Değil</option>
                    </SelectField>

                    <SelectField id="battery" name="battery" label="Batarya" value={preferences.battery} onChange={handleChange}>
                        <option value="oncelikli">Uzun Pil Ömrü</option>
                        <option value="standart">Bir Günü Çıkarsın</option>
                        <option value="onemsiz">Önemli Değil</option>
                    </SelectField>

                    <SelectField id="performance" name="performance" label="Performans" value={preferences.performance} onChange={handleChange}>
                        <option value="oyun">Yüksek Performans/Oyun</option>
                        <option value="gunluk">Günlük Kullanım</option>
                        <option value="temel">Temel İşlevler</option>
                    </SelectField>

                     <SelectField id="screenSize" name="screenSize" label="Ekran Boyutu" value={preferences.screenSize} onChange={handleChange}>
                        <option value="buyuk">Büyük Ekran (6.5"+)</option>
                        <option value="kompakt">Kompakt Ekran ( &lt; 6.5")</option>
                        <option value="farketmez">Farketmez</option>
                    </SelectField>
                </div>

                <SelectField id="os" name="os" label="İşletim Sistemi" value={preferences.os} onChange={handleChange}>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="farketmez">Farketmez</option>
                </SelectField>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analiz Ediliyor...
                        </>
                    ) : (
                       <> <i className="fas fa-cogs mr-2"></i> Tavsiye Oluştur </>
                    )}
                </button>
            </form>
        </div>
    );
};

interface SelectFieldProps {
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ id, name, label, value, onChange, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
        >
            {children}
        </select>
    </div>
);

export default InputForm;
