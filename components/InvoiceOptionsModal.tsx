import React from 'react';

interface InvoiceOptionsModalProps {
    onClose: () => void;
    onSelect: (includeMaterials: boolean) => void;
}

const InvoiceOptionsModal: React.FC<InvoiceOptionsModalProps> = ({ onClose, onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-lg border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Opções da Nota Fiscal</h2>
                     <button type="button" onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button>
                </header>
                <div className="p-8 text-center">
                    <p className="text-[var(--color-text-secondary)] mb-6">Como você deseja emitir a nota fiscal?</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => onSelect(true)}
                            className="flex-1 py-3 px-5 rounded-lg font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition"
                        >
                            Incluir Materiais Detalhados
                        </button>
                        <button
                            onClick={() => onSelect(false)}
                            className="flex-1 py-3 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition"
                        >
                            Apenas Valor Total do Serviço
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceOptionsModal;
