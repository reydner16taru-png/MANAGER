import React, { useState, useMemo } from 'react';
import type { StockItem, StockMovement } from '../types';
import AddStockItemModal from './AddMaterialModal'; // Re-using and will adapt this modal
import StockMovementModal from './StockMovementModal'; // New modal for entry/exit

interface StockManagementProps {
    stock: StockItem[];
    stockMovements: StockMovement[];
    onAddStockItem: (newItem: Omit<StockItem, 'id'>) => void;
    onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
    onUpdateStockItem: (updatedItem: StockItem) => void;
    onRemoveStockItem: (itemId: string) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const StockManagement: React.FC<StockManagementProps> = ({ stock, stockMovements, onAddStockItem, onAddStockMovement, onUpdateStockItem, onRemoveStockItem }) => {
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [movementModalState, setMovementModalState] = useState<{ isOpen: boolean; item: StockItem | null; type: 'entrada' | 'saída' }>({ isOpen: false, item: null, type: 'entrada' });
    
    // Filters for movements history
    const [historyFilter, setHistoryFilter] = useState({ item: 'all', type: 'all', startDate: '', endDate: '' });

    const summary = useMemo(() => {
        const totalValue = stock.reduce((sum, item) => sum + (item.currentQuantity * item.unitPrice), 0);
        const lowStockCount = stock.filter(item => item.currentQuantity <= item.minimumQuantity).length;
        return { totalValue, lowStockCount };
    }, [stock]);

    const filteredMovements = useMemo(() => {
        return stockMovements.filter(m => {
            if (historyFilter.item !== 'all' && m.stockItemId !== historyFilter.item) return false;
            if (historyFilter.type !== 'all' && m.type !== historyFilter.type) return false;
            const movementDate = new Date(m.timestamp);
            if (historyFilter.startDate && movementDate < new Date(historyFilter.startDate + 'T00:00:00')) return false;
            if (historyFilter.endDate && movementDate > new Date(historyFilter.endDate + 'T23:59:59')) return false;
            return true;
        });
    }, [stockMovements, historyFilter]);

    const openMovementModal = (item: StockItem, type: 'entrada' | 'saída') => {
        setMovementModalState({ isOpen: true, item, type });
    };

    const handleRemoveItem = (itemId: string, itemName: string) => {
        if (window.confirm(`Tem certeza que deseja remover permanentemente o item "${itemName}" do estoque? Esta ação não pode ser desfeita.`)) {
            onRemoveStockItem(itemId);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                  <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Gerenciamento de Estoque</h2>
                  <p className="text-[var(--color-text-secondary)]">Controle o inventário de materiais e ferramentas.</p>
              </div>
              <button onClick={() => setIsAddItemModalOpen(true)} className="flex items-center justify-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold py-2 px-4 rounded-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Adicionar Item
              </button>
            </div>
            
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-6 flex items-center space-x-4">
                 <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg text-[var(--color-text-accent)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></div>
                 <div><p className="text-[var(--color-text-secondary)] text-sm font-medium">Valor Total em Estoque</p><p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatCurrency(summary.totalValue)}</p></div>
              </div>
              <div className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-6 flex items-center space-x-4">
                 <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg text-[var(--color-danger-text)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                 <div><p className="text-[var(--color-text-secondary)] text-sm font-medium">Itens com Estoque Baixo</p><p className="text-2xl font-bold text-[var(--color-text-primary)]">{summary.lowStockCount}</p></div>
              </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden mb-8">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] p-4 bg-[var(--color-bg-secondary)]">Itens em Estoque</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left text-[var(--color-text-secondary)]">
                  <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                    <tr>
                      <th className="px-6 py-3">Nome</th><th className="px-6 py-3">Categoria</th><th className="px-6 py-3 text-center">Qtd. Atual</th><th className="px-6 py-3 text-center">Qtd. Mínima</th><th className="px-6 py-3 text-right">Preço Unit.</th><th className="px-6 py-3 text-right">Valor Total</th><th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map(item => (
                      <tr key={item.id} className={`border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50 ${item.currentQuantity <= item.minimumQuantity ? 'bg-[var(--color-warning-bg)]' : ''}`}>
                        <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{item.name}</td><td className="px-6 py-4">{item.category}</td>
                        <td className="px-6 py-4 text-center font-bold">{item.currentQuantity.toFixed(2)} <span className="text-xs text-[var(--color-text-secondary)]">{item.unitOfMeasure}</span></td>
                        <td className="px-6 py-4 text-center">
                            <input
                                type="number"
                                value={item.minimumQuantity}
                                onChange={(e) => {
                                    const minQty = e.target.value ? parseInt(e.target.value, 10) : 0;
                                    if (minQty >= 0) {
                                      onUpdateStockItem({ ...item, minimumQuantity: minQty });
                                    }
                                }}
                                min="0"
                                step="1"
                                className="input-editable-style text-center"
                                aria-label={`Quantidade mínima de ${item.name}`}
                            />
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end">
                                <span className="text-[var(--color-text-secondary)] mr-1">R$</span>
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => {
                                        const price = e.target.value ? parseFloat(e.target.value) : 0;
                                        onUpdateStockItem({ ...item, unitPrice: price });
                                    }}
                                    step="0.01"
                                    min="0"
                                    className="input-editable-style text-right"
                                    aria-label={`Preço unitário de ${item.name}`}
                                />
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(item.currentQuantity * item.unitPrice)}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-3">
                                <button onClick={() => openMovementModal(item, 'entrada')} className="text-[var(--color-success-text)] hover:brightness-125 text-xs font-bold">ENTRADA</button>
                                <button onClick={() => openMovementModal(item, 'saída')} className="text-[var(--color-danger-text)] hover:brightness-125 text-xs font-bold">SAÍDA</button>
                                <button onClick={() => handleRemoveItem(item.id, item.name)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" title="Excluir item permanentemente">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] p-4 bg-[var(--color-bg-secondary)]">Histórico de Movimentações</h3>
                <div className="overflow-x-auto">
                     <table className="w-full min-w-[600px] text-sm text-left text-[var(--color-text-secondary)]">
                        <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                            <tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Item</th><th className="px-6 py-3 text-center">Tipo</th><th className="px-6 py-3 text-center">Quantidade</th><th className="px-6 py-3">Motivo</th></tr>
                        </thead>
                         <tbody>
                            {filteredMovements.map(m => (
                                <tr key={m.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">{new Date(m.timestamp).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{m.stockItemName}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.type === 'entrada' ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'}`}>{m.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">{m.quantity}</td>
                                    <td className="px-6 py-4">{m.reason}{m.relatedCarPlate && ` (${m.relatedCarPlate})`}</td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                </div>
            </div>

            {isAddItemModalOpen && <AddStockItemModal 
                                        onClose={() => setIsAddItemModalOpen(false)} 
                                        onAddStockItem={onAddStockItem}
                                        stock={stock}
                                        onAddStockMovement={onAddStockMovement}
                                    />}
            {movementModalState.isOpen && movementModalState.item && <StockMovementModal item={movementModalState.item} type={movementModalState.type} onClose={() => setMovementModalState({isOpen: false, item: null, type: 'entrada'})} onConfirm={onAddStockMovement} />}
            <style>{`
                .input-editable-style {
                    background-color: transparent;
                    border: 1px solid transparent;
                    border-radius: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    width: 6rem; /* 96px */
                    transition: all 0.2s;
                    color: var(--color-text-primary);
                    -moz-appearance: textfield;
                }
                .input-editable-style::-webkit-outer-spin-button,
                .input-editable-style::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .input-editable-style:hover {
                    border-color: var(--color-border-secondary);
                }
                .input-editable-style:focus {
                    background-color: var(--color-bg-tertiary);
                    border-color: var(--color-accent-primary);
                    outline: none;
                    box-shadow: 0 0 0 1px var(--color-accent-primary);
                }
            `}</style>
        </>
    );
};

export default StockManagement;
