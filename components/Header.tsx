
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <i className="fas fa-mobile-alt text-4xl text-cyan-400"></i>
                        <h1 className="text-2xl md:text-3xl font-bold ml-4 bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                            Akıllı Telefon Rehberi
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
