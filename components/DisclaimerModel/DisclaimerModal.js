'use client';

import { useState, useEffect } from 'react';
import Model from './model';

const STORAGE_KEY = 'aarna_disclaimer_seen';

const DisclaimerModal = () => {
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;
        const seen = localStorage.getItem(STORAGE_KEY);
        // Only hide disclaimer if the user has explicitly accepted
        if (seen !== 'accepted') {
            setShowDisclaimer(true);
        }
    }, [mounted]);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        setShowDisclaimer(false);
    };

    const handleDecline = () => {
        // Treat decline as not having accepted; ensure modal shows again on return
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = 'https://www.google.com';
    };

    if (!mounted || !showDisclaimer) return null;

    return (
        <>
            {/* Overlay: blocks clicks/links on page but allows page to scroll (no body overflow hidden) */}
            <div
                className="fixed inset-0 z-[9998] bg-black/20"
                aria-hidden
            />

            {/* Disclaimer panel at bottom - reference layout: centered block, light beige background */}
            <div className="fixed bottom-0 left-0 right-0 z-[9999] w-full border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:border-gray-700">
                <div className="mx-auto w-full p-5">
                    {/* Heading - top left, prominent */}
                    <h3 className="mb-4 text-xl font-bold text-custom-red sm:text-2xl">
                        Disclaimer
                    </h3>

                    {/* Scrollable text block - justified, dark text, visible scrollbar */}
                    <div className="mb-4 max-h-[140px] overflow-y-scroll overflow-x-hidden px-5 md:text-justify text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-custom-red scrollbar-thumb-rounded-full dark:scrollbar-track-gray-600 dark:scrollbar-thumb-custom-red">
                        <Model />
                    </div>

                    {/* Buttons - horizontal, left-aligned, gap between */}
                    <div className="flex flex-wrap gap-4 ">
                        <button
                            onClick={handleAccept}
                            className="bg-custom-red px-6 py-1.5 text-base font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleDecline}
                            className="bg-custom-red px-6 py-1.5 text-base font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DisclaimerModal;
