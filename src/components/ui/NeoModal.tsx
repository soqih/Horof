import React, { useEffect } from 'react';

interface NeoModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const NeoModal: React.FC<NeoModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative z-10 w-full max-w-2xl bg-[var(--color-neo-bg)] border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">

                {/* Header */}
                {(title || onClose) && (
                    <div className="flex items-center justify-between border-b-8 border-black p-4 bg-[var(--color-neo-pink)] text-white">
                        {title && <h2 className="text-3xl font-black">{title}</h2>}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center border-4 border-black bg-white text-black font-black hover:bg-gray-200 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xl"
                            >
                                X
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-6 overflow-y-auto font-bold text-2xl leading-relaxed">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="border-t-8 border-black p-6 bg-[var(--color-neo-primary)]">
                        {footer}
                    </div>
                )}

            </div>
        </div>
    );
};
