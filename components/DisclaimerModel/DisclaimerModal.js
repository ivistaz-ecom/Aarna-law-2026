'use client';

import { useState, useEffect, useRef } from 'react';
import Model from './model';

const STORAGE_KEY = 'aarna_disclaimer_seen';
const DISCLAIMER_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const DisclaimerModal = () => {
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef(null);
    const [thumbStyle, setThumbStyle] = useState({ height: '24px', top: '0px' });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;
        const storedValue = localStorage.getItem(STORAGE_KEY);
        let hasValidAcceptance = false;

        if (storedValue) {
            try {
                const parsed = JSON.parse(storedValue);
                const acceptedAt = parsed?.acceptedAt;
                if (typeof acceptedAt === 'number') {
                    hasValidAcceptance =
                        Date.now() - acceptedAt < DISCLAIMER_EXPIRY_MS;
                }
            } catch (_error) {
                hasValidAcceptance = false;
            }
        }

        // Show disclaimer if no acceptance exists or the 24-hour window expired.
        if (!hasValidAcceptance) {
            setShowDisclaimer(true);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [mounted]);

    const handleAccept = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ acceptedAt: Date.now() })
        );
        setShowDisclaimer(false);
    };

    const handleDecline = () => {
        // Treat decline as not having accepted; ensure modal shows again on return
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = 'https://www.google.com';
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        if (scrollHeight <= clientHeight) {
            setThumbStyle({ height: '0px', top: '0px' });
            return;
        }

        const trackHeight = clientHeight;
        const minThumbHeight = 24;
        const thumbHeight = Math.max(
            (clientHeight / scrollHeight) * trackHeight,
            minThumbHeight
        );
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop =
            (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;

        setThumbStyle({
            height: `${thumbHeight}px`,
            top: `${thumbTop}px`,
        });
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

                    {/* Scrollable text block - justified, dark text */}
                    {/* Wrapped in relative container so we can render a custom "visible" scrollbar that moves with scroll */}
                    <div className="relative mb-4">
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="max-h-[140px] overflow-y-auto overflow-x-hidden px-5 md:text-justify text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 scrollbar-none"
                        >
                            <Model />
                        </div>
                        {/* Custom always-visible scrollbar indicator (desktop + mobile) */}
                        <div className="pointer-events-none absolute right-1 top-2 bottom-2 w-1.5 rounded-full bg-gray-100 dark:bg-gray-600">
                            {thumbStyle.height !== '0px' && (
                                <div
                                    className="absolute w-full rounded-full bg-custom-red"
                                    style={thumbStyle}
                                />
                            )}
                        </div>
                    </div>

                    {/* Buttons - horizontal, centered on mobile, left-aligned on larger screens */}
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
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
