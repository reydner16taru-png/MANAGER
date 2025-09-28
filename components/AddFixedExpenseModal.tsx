import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { FixedExpense, StockItem, StockMovement } from '../types';
import { StockItemCategory, UnitOfMeasure } from '../types';

interface AddFixedExpenseModalProps {
    onClose: () => void;
    onAddExpense: (expense: Omit<FixedExpense, 'id'>) => void;
    stock: StockItem[];
    onAddStockItem: (item: Omit<StockItem, 'id'>) => void;
    onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
}

type ExtractedItem = {
    id: string;
    itemName: string;
    itemType: 'STOCK_ITEM' | 'GENERAL_EXPENSE';
    quantity: number;
    unitPrice: number;
    isNew?: boolean;
    category?: StockItemCategory;
    unitOfMeasure?: UnitOfMeasure;
    minimumQuantity?: number;
};

const PREDEFINED_EXPENSES = ['Aluguel', 'Água', 'Luz', 'Internet', 'Telefone', 'Salários', 'Outros'];

const AddFixedExpenseModal: React.FC<AddFixedExpenseModalProps> = ({ onClose, onAddExpense, stock, onAddStockItem, onAddStockMovement }) => {
    const [activeTab, setActiveTab] = useState<'manual' | 'invoice'>('manual');
    const [error, setError] = useState('');

    // State for manual form
    const [selectedExpense, setSelectedExpense] = useState(PREDEFINED_EXPENSES[0]);
    const [customName, setCustomName] = useState('');
    const [manualCost, setManualCost] = useState<number | ''>('');

    // State for invoice form
    const [invoiceImage, setInvoiceImage] = useState<File | null>(null);
    const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
    const [invoiceBase64, setInvoiceBase64] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);


    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const finalName = selectedExpense === 'Outros' ? customName.trim() : selectedExpense;
        const finalCost = Number(manualCost);

        if (!finalName) {
            setError('O nome do gasto é obrigatório.');
            return;
        }
        if (finalCost <= 0) {
            setError('O valor do gasto deve ser maior que zero.');
            return;
        }
        
        onAddExpense({ name: finalName, monthlyCost: finalCost });
        onClose();
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setInvoiceImage(file);
            setInvoicePreview(URL.createObjectURL(file));
            setExtractedItems([]);
            setAiError(null);
            const base64 = await fileToBase64(file);
            setInvoiceBase64(base64);
        }
    };
    
    const handleProcessInvoice = async () => {
        if (!invoiceImage) {
            setAiError('Por favor, selecione uma imagem da nota fiscal.');
            return;
        }
        setIsProcessing(true); setAiError(null); setExtractedItems([]);

        try {
            const base64Data = await fileToBase64(invoiceImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING, description: 'O nome do produto ou serviço.' },
                        itemType: { type: Type.STRING, description: "Classifique como 'STOCK_ITEM' para produtos físicos de inventário (peças, tintas, lixas) ou 'GENERAL_EXPENSE' para taxas, serviços, fretes ou itens não estocáveis." },
                        quantity: { type: Type.NUMBER, description: 'A quantidade do item. Para Gasto Geral, pode ser 1.' },
                        unitPrice: { type: Type.NUMBER, description: 'O preço por unidade. Para Gasto Geral, pode ser o valor total.' },
                    }, required: ["itemName", "itemType", "quantity", "unitPrice"],
                },
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { text: "Analise esta imagem de nota fiscal de uma oficina. Extraia cada item. Classifique cada item como 'STOCK_ITEM' (para produtos que vão para o estoque, como peças, tintas, lixas) ou 'GENERAL_EXPENSE' (para outros custos como frete, taxas de serviço, etc.). Retorne um array JSON. Para 'GENERAL_EXPENSE', o valor total pode ser o 'unitPrice' com quantidade 1." },
                        { inlineData: { mimeType: invoiceImage.type, data: base64Data } }
                    ]
                },
                config: { responseMimeType: "application/json", responseSchema: responseSchema },
            });

            const parsedItems = JSON.parse(response.text.trim());
            const itemsForConfirmation = parsedItems.map((item: any): ExtractedItem => {
                const existingItem = stock.find(s => s.name.toLowerCase() === item.itemName.toLowerCase());
                const isStockItem = item.itemType === 'STOCK_ITEM';
                return {
                    ...item,
                    id: new Date().toISOString() + Math.random(),
                    isNew: isStockItem && !existingItem,
                    category: isStockItem ? (existingItem?.category || StockItemCategory.OUTROS) : undefined,
                    unitOfMeasure: isStockItem ? (existingItem?.unitOfMeasure || UnitOfMeasure.UNIDADES) : undefined,
                    minimumQuantity: isStockItem ? (existingItem?.minimumQuantity || 10) : undefined,
                };
            });
            setExtractedItems(itemsForConfirmation);
        } catch (err) {
            console.error(err);
            setAiError('Falha ao processar a nota. Verifique o formato da imagem ou tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleExtractedItemChange = (id: string, field: keyof ExtractedItem, value: any) => {
        setExtractedItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleConfirmAll = () => {
        const totalAmount = extractedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        // Create a single expense record for the entire invoice purchase
        if (totalAmount > 0 && invoiceBase64) {
            onAddExpense({
                name: `Compra de Materiais (Nota Fiscal)`,
                monthlyCost: totalAmount,
                isOneTimePurchase: true,
                purchaseDate: new Date().toISOString(),
                invoiceImage: invoiceBase64,
            });
        }

        // Process stock items to update inventory, but not as separate financial expenses
         extractedItems.forEach(item => {
             if (item.itemType === 'STOCK_ITEM') {
                 const existingStockItem = stock.find(s => s.name.toLowerCase() === item.itemName.toLowerCase());
                 if (item.isNew || !existingStockItem) {
                     onAddStockItem({
                         name: item.itemName, category: item.category!, unitOfMeasure: item.unitOfMeasure!,
                         currentQuantity: item.quantity, minimumQuantity: item.minimumQuantity!, unitPrice: item.unitPrice,
                     });
                 } else {
                     onAddStockMovement({
                         stockItemId: existingStockItem.id, stockItemName: existingStockItem.name,
                         type: 'entrada', quantity: item.quantity, reason: 'Compra',
                     });
                 }
             }
         });
        onClose();
    };

    const renderManualTab = () => (
        <form onSubmit={handleManualSubmit} id="manual-form" className="space-y-6">
            {error && <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] p-3 rounded-md text-sm text-center">{error}</div>}
            <div>
                <label htmlFor="expenseType" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tipo de Gasto</label>
                <select id="expenseType" value={selectedExpense} onChange={e => setSelectedExpense(e.target.value)} className="input-style">
                    {PREDEFINED_EXPENSES.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                </select>
            </div>
            {selectedExpense === 'Outros' && (
                <div>
                    <label htmlFor="customName" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Nome do Gasto (Customizado)</label>
                    <input id="customName" type="text" placeholder="Ex: Compra de café" value={customName} onChange={e => setCustomName(e.target.value)} required className="input-style" />
                </div>
            )}
            <div>
               <label htmlFor="monthlyCost" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Valor (R$)</label>
               <input id="monthlyCost" type="number" placeholder="1500,00" value={manualCost} onChange={e => setManualCost(e.target.value === '' ? '' : Number(e.target.value))} min="0" step="0.01" required className="input-style" />
           </div>
        </form>
    );

    const renderInvoiceTab = () => (
         <div className="space-y-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Envie uma foto de uma nota ou cupom fiscal. A IA irá separar os itens de estoque dos gastos gerais.</p>
            <div className="mx-auto w-full max-w-md p-4 border-2 border-dashed border-[var(--color-border-secondary)] rounded-lg">
                <input id="invoice-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <label htmlFor="invoice-upload" className="cursor-pointer">
                    {invoicePreview ? (
                        <img src={invoicePreview} alt="Prévia da Nota Fiscal" className="w-full h-auto max-h-64 object-contain rounded-md" />
                    ) : (
                        <div className="text-[var(--color-text-secondary)]/70 py-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <p className="mt-2 text-sm font-medium">Clique para enviar a imagem</p>
                        </div>
                    )}
                </label>
            </div>
            {invoiceImage && !isProcessing && (
                <button onClick={handleProcessInvoice} className="button-primary-sm">Processar Nota Fiscal</button>
            )}
            {isProcessing && <div className="text-[var(--color-text-accent)]">Processando com IA...</div>}
            {aiError && <div className="text-[var(--color-danger-text)] text-sm">{aiError}</div>}
        </div>
    );

     const renderConfirmationStep = () => (
        <div className="space-y-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">Verifique os itens extraídos da nota fiscal:</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {extractedItems.map(item => (
                    <div key={item.id} className={`p-4 bg-[var(--color-bg-tertiary)]/50 rounded-lg border-l-4 ${item.itemType === 'STOCK_ITEM' ? 'border-[var(--color-accent-primary)]' : 'border-[var(--color-info-text)]'}`}>
                        {item.itemType === 'STOCK_ITEM' ? (
                            <span className={`text-xs font-bold uppercase ${item.isNew ? 'text-[var(--color-warning-text)]' : 'text-[var(--color-success-text)]'}`}>{item.isNew ? 'Novo Item de Estoque' : 'Entrada em Estoque'}</span>
                        ) : (
                            <span className="text-xs font-bold uppercase text-[var(--color-info-text)]">Gasto Geral</span>
                        )}
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <input type="text" value={item.itemName} onChange={e => handleExtractedItemChange(item.id, 'itemName', e.target.value)} className="input-style col-span-3" />
                            <div><label className="label-sm">Qtd.</label><input type="number" value={item.quantity} onChange={e => handleExtractedItemChange(item.id, 'quantity', Number(e.target.value))} className="input-style" /></div>
                            <div><label className="label-sm">Preço Unit.</label><input type="number" value={item.unitPrice} onChange={e => handleExtractedItemChange(item.id, 'unitPrice', Number(e.target.value))} className="input-style" /></div>
                            <div><label className="label-sm">Total</label><input type="text" readOnly value={(item.quantity * item.unitPrice).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} className="input-style bg-[var(--color-bg-tertiary)]/50" /></div>
                        </div>
                        {item.itemType === 'STOCK_ITEM' && item.isNew && (
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--color-border-secondary)]">
                                <div><label className="label-sm">Categoria</label><select value={item.category} onChange={e => handleExtractedItemChange(item.id, 'category', e.target.value)} className="input-style">{Object.values(StockItemCategory).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className="label-sm">Unidade</label><select value={item.unitOfMeasure} onChange={e => handleExtractedItemChange(item.id, 'unitOfMeasure', e.target.value)} className="input-style">{Object.values(UnitOfMeasure).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                                <div><label className="label-sm">Qtd. Mínima</label><input type="number" value={item.minimumQuantity} onChange={e => handleExtractedItemChange(item.id, 'minimumQuantity', Number(e.target.value))} className="input-style" /></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)] flex-shrink-0">
                    <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-[var(--color-text-primary)]">Adicionar Gasto</h2><button type="button" onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button></div>
                    <div className="border-b border-[var(--color-border-primary)] mt-4">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('manual')} className={`${activeTab === 'manual' ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]' : 'border-transparent text-[var(--color-text-secondary)]'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Gasto Manual</button>
                            <button onClick={() => setActiveTab('invoice')} className={`${activeTab === 'invoice' ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]' : 'border-transparent text-[var(--color-text-secondary)]'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Importar Nota Fiscal</button>
                        </nav>
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto p-8">
                     {activeTab === 'manual' && renderManualTab()}
                     {activeTab === 'invoice' && (extractedItems.length > 0 ? renderConfirmationStep() : renderInvoiceTab())}
                </main>
                <style>{`
                    .input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }
                    .button-primary-sm { display: inline-flex; justify-content: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; color: white; background-color: var(--color-accent-primary); transition: background-color 0.3s; } .button-primary-sm:hover { background-color: var(--color-accent-secondary); }
                    .label-sm { display: block; font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem; }
                `}</style>
                <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end space-x-4 sticky bottom-0">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                    {activeTab === 'manual' && <button type="submit" form="manual-form" onClick={handleManualSubmit} className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Adicionar Gasto</button>}
                    {activeTab === 'invoice' && extractedItems.length > 0 && <button type="button" onClick={handleConfirmAll} className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Confirmar e Adicionar Tudo</button>}
                </footer>
            </div>
        </div>
    );
};

export default AddFixedExpenseModal;
