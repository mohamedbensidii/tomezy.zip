"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export function Modal({ isOpen, onClose, title, description, children }: {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
                aria-hidden="true" 
            />
            
            {/* Modal Panel */}
            <div className="relative z-50 w-full max-w-md transform overflow-hidden rounded-2xl bg-bg-surface border border-bg-border p-6 text-right shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {(title || description) && (
                    <div className="mb-5 space-y-2">
                        {title && <h3 className="text-xl font-bold leading-6 text-white">{title}</h3>}
                        {description && <p className="text-sm text-text-muted">{description}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
