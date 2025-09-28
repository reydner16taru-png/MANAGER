import React, { useState } from 'react';
import type { StockItem, StockMovement } from '../types';
import { StockItemCategory, UnitOfMeasure } from '../types';

const predefinedStockItems: Omit<StockItem, 'id' | 'currentQuantity'>[] = [
    { name: 'Lixa 80', category: StockItemCategory.LIXA, unitOfMeasure: UnitOfMeasure.UNIDADES, minimumQuantity: 20, unitPrice: 2.50 },
    { name: 'Lixa 320', category: StockItemCategory.LIXA, unitOfMeasure: UnitOfMeasure.UNIDADES, minimumQuantity: 20, unitPrice: 2.80 },
    { name: 'Massa Poliéster', category: StockItemCategory.MASSA, unitOfMeasure: UnitOfMeasure.GRAMAS, minimumQuantity: 1000, unitPrice: 0.045 },
    { name: 'Primer PU', category: StockItemCategory.VERNIZ, unitOfMeasure: UnitOfMeasure.LITROS, minimumQuantity: 2, unitPrice: 80.00 },
    { name: 'Tinta Metálica Azul', category: StockItemCategory.TINTA, unitOfMeasure: UnitOfMeasure.ML, minimumQuantity: 500, unitPrice: 0.15 },
    { name: 'Verniz HS', category: StockItemCategory.VERNIZ, unitOfMeasure: UnitOfMeasure.ML, minimumQuantity: 1000, unitPrice: 0.12 },
];

interface AddStockItemModalProps {
    onClose: () => void;
    stock: StockItem[];
    onAddStockItem: (item: Omit<StockItem, 'id'>) => void;
    onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
}

const AddStockItemModal: React.FC<AddStockItemModalProps> = ({ onClose, stock, onAddStockItem, onAddStockMovement }) => {
    const [activeTab, setActiveTab] = useState<'common' | 'other'>('common');
    const [error, setError] = useState('');

    // State for "Common" tab
    const [quantities, setQuantities] = useState<Record<string, string>>({});

    // State for "Other" tab
    const [formData, setFormData] = useState<Omit<StockItem, 'id'>>({
        name: '', category: StockItemCategory.OUTROS, unitOfMeasure: UnitOfMeasure.UNIDADES,
        currentQuantity: 0, minimumQuantity: 0, unitPrice: 0,
        supplier: '', expiryDate: '',
    });

    const handleQuantityChange = (name: string, value: string) => {
        setQuantities(prev => ({ ...prev, [name]: value }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleCommonItemsSubmit = () => {
        setError('');
        const itemsToProcess = Object.entries(quantities)
            .filter(([_, value]) => Number(value) > 0)
            .map(([name, value]) => ({ name, quantity: Number(value) }));

        if (itemsToProcess.length === 0) {
            setError('Por favor, insira a quantidade para pelo menos um item.');
            return;
        }

        itemsToProcess.forEach(itemToAdd => {
            const existingStockItem = stock.find(s => s.name === itemToAdd.name);
            if (existingStockItem) {
                onAddStockMovement({
                    stockItemId: existingStockItem.id, stockItemName: existingStockItem.name,
                    type: 'entrada', quantity: itemToAdd.quantity, reason: 'Compra',
                });
            } else {
                const template = predefinedStockItems.find(p => p.name === itemToAdd.name);
                if (template) {
                    onAddStockItem({ ...template, currentQuantity: itemToAdd.quantity });
                }
            }
        });
        onClose();
    };

    const handleOtherItemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name.trim() || formData.currentQuantity < 0 || formData.unitPrice < 0 || formData.minimumQuantity < 0) {
            setError('Por favor, preencha os campos obrigatórios corretamente.');
            return;
        }
        onAddStockItem(formData);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)] flex-shrink-0">
                    <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-[var(--color-text-primary)]">Adicionar Itens ao Estoque</h2><button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button></div>
                    <div className="border-b border-[var(--color-border-primary)] mt-4">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('common')} className={`${activeTab === 'common' ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]' : 'border-transparent text-[var(--color-text-secondary)]'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Itens Pré-definidos</button>
                            <button onClick={() => setActiveTab('other')} className={`${activeTab === 'other' ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]' : 'border-transparent text-[var(--color-text-secondary)]'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Outros</button>
                        </nav>
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto p-8">
                    {error && <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] p-3 rounded-md text-sm text-center mb-6">{error}</div>}
                    {activeTab === 'common' && renderCommonItemsTab()}
                    {activeTab === 'other' && renderOtherTab()}
                </main>
                <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); } .label-style { display: block; text-sm font-medium text-[var(--color-text-secondary)] mb-2; }`}</style>
                <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end space-x-4 flex-shrink-0">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                    {activeTab === 'common' && <button type="button" onClick={handleCommonItemsSubmit} className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Adicionar Itens</button>}
                    {activeTab === 'other' && <button type="submit" form="other-item-form" onClick={handleOtherItemSubmit} className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Salvar Novo Item</button>}
                </footer>
            </div>
        </div>
    );
    
    // Helper render functions
    function renderCommonItemsTab() {
        return (
            <div className="space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)]">Adicione a quantidade de entrada para os itens comuns. O sistema irá somar ao estoque existente ou criar um novo item se for a primeira entrada.</p>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {predefinedStockItems.map(item => (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)]/50 rounded-lg">
                            <div>
                                <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{item.category} - {item.unitPrice.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}/{item.unitOfMeasure}</p>
                            </div>
                            <input type="number" placeholder="Qtd." value={quantities[item.name] || ''} onChange={e => handleQuantityChange(item.name, e.target.value)} min="0" className="input-style w-32" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    function renderOtherTab() {
        return (
            <form onSubmit={handleOtherItemSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-2"><label className="label-style">Nome do Item *</label><input name="name" type="text" placeholder="Ex: Chave de Fenda Phillips" value={formData.name} onChange={handleFormChange} required className="input-style" /></div>
                    <div><label className="label-style">Categoria *</label><select name="category" value={formData.category} onChange={handleFormChange} className="input-style">{Object.values(StockItemCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    <div><label className="label-style">Unidade de Medida *</label><select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleFormChange} className="input-style">{Object.values(UnitOfMeasure).map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></div>
                    <div><label className="label-style">Quantidade Inicial *</label><input name="currentQuantity" type="number" value={formData.currentQuantity} onChange={handleFormChange} min="0" required className="input-style" /></div>
                     <div><label className="label-style">Quantidade Mínima *</label><input name="minimumQuantity" type="number" value={formData.minimumQuantity} onChange={handleFormChange} min="0" required className="input-style" /></div>
                    <div className="col-span-2"><label className="label-style">Preço Unitário (R$) *</label><input name="unitPrice" type="number" placeholder="50,00" value={formData.unitPrice} onChange={handleFormChange} min="0" step="0.01" required className="input-style" /></div>
                    <div><label className="label-style">Fornecedor (Opcional)</label><input name="supplier" type="text" value={formData.supplier || ''} onChange={handleFormChange} className="input-style" /></div>
                    <div><label className="label-style">Data de Validade (Opcional)</label><input name="expiryDate" type="date" value={formData.expiryDate || ''} onChange={handleFormChange} className="input-style" /></div>
                </div>
            </form>
        );
    }
};

export default AddStockItemModal;
