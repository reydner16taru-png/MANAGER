import React, { useState } from 'react';
import type { StockItem, StockMovement } from '../types';

interface StockMovementModalProps {
    item: StockItem;
    type: 'entrada' | 'saída';
    onClose: () => void;
    onConfirm: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ item, type, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState<'Compra' | 'Ajuste' | 'Perda' | 'Consumo não vinculado'>(type === 'entrada' ? 'Compra' : 'Consumo não vinculado');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');
        if (quantity <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }
        if (type === 'saída' && quantity > item.currentQuantity) {
            setError(`Não é possível dar saída de ${quantity} ${item.unitOfMeasure}. Estoque atual: ${item.currentQuantity}.`);
            return;
        }
        onConfirm({
            stockItemId: item.id,
            stockItemName: item.name,
            type,
            quantity,
            reason,
        });
        onClose();
    };
    
    const reasonOptions = type === 'entrada'
        ? ['Compra', 'Ajuste']
        : ['Consumo não vinculado', 'Perda', 'Ajuste'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-lg border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] capitalize">{type} de Estoque: <span className="text-[var(--color-text-accent)]">{item.name}</span></h2>
                </header>
                <div className="p-8 space-y-6">
                    {error && <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] p-3 rounded-md text-sm text-center">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Quantidade ({item.unitOfMeasure})</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="input-style" />
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">Estoque atual: {item.currentQuantity} {item.unitOfMeasure}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Motivo</label>
                        <select value={reason} onChange={e => setReason(e.target.value as any)} className="input-style">
                            {reasonOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
                 <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }`}</style>
                <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Confirmar</button>
                </footer>
            </div>
        </div>
    );
};

export default StockMovementModal;
