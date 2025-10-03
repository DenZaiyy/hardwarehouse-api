"use client";

import React, {useEffect} from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;

}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if ((e.target as HTMLElement).id === 'modal') {
                onClose();
            }
        }

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !children) return null;

    return (
        <div id="modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-foreground rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-background text-2xl font-bold !m-0">{title}</span>
                    <button
                        onClick={onClose}
                        className="text-foreground hover:text-background bg-background hover:bg-foreground border-2 border-background rounded-full px-4 py-2 text-2xl hover:scale-85 transition-all duration-300 cursor-pointer"
                    >
                        X
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}