import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'red' | 'blue' | 'pink' | 'green' | 'gray';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {

        const baseClass = "inline-flex items-center justify-center font-bold font-cairo border-4 border-black transition-all duration-100 uppercase tracking-widest";

        const sizeClasses = {
            sm: "px-3 py-1 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            md: "px-6 py-2 text-lg shadow-neo",
            lg: "px-8 py-3 text-2xl shadow-neo",
            xl: "px-12 py-6 text-4xl shadow-neo-lg",
        };

        const variantClasses = {
            primary: "bg-[var(--color-neo-primary)] text-black hover:bg-yellow-300",
            red: "bg-[var(--color-neo-red)] text-white hover:bg-red-400",
            blue: "bg-[var(--color-neo-blue)] text-white hover:bg-blue-400",
            pink: "bg-[var(--color-neo-pink)] text-white hover:bg-pink-400",
            green: "bg-[var(--color-neo-green)] text-black hover:bg-teal-300",
            gray: "bg-[var(--color-neo-gray)] text-gray-800",
        };

        const activeState = disabled
            ? "opacity-50 cursor-not-allowed transform translate-x-1 translate-y-1 !shadow-none"
            : "active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-y-0.5";

        return (
            <button
                ref={ref}
                disabled={disabled}
                className={cn(baseClass, sizeClasses[size], variantClasses[variant], activeState, className)}
                {...props}
            >
                {children}
            </button>
        );
    }
);

NeoButton.displayName = 'NeoButton';
