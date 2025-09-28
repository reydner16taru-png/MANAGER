import React, { useState, useMemo } from 'react';
import type { IssuedInvoice, PaymentRecord, FixedExpense, StockMovement, StockItem } from '../types';

interface InvoicesHistoryProps {
    issuedInvoices: IssuedInvoice[];
    paymentRecords: PaymentRecord[];
    fixedExpenses: FixedExpense[];
    stockMovements: StockMovement[];
    stock: StockItem[];
}

type FinancialRecord = {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    invoiceImage?: string; // For scanned invoices
};

type FilterType = 'all' | 'today' | 'week' | 'month' | 'year';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const InvoicesHistory: React.FC<InvoicesHistoryProps> = ({ issuedInvoices, paymentRecords, fixedExpenses, stock, stockMovements }) => {
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const allRecords = useMemo((): FinancialRecord[] => {
        const income: FinancialRecord[] = issuedInvoices.map(inv => ({
            id: inv.id,
            date: inv.dateIssued,
            description: `Serviço no veículo ${inv.carPlate}`,
            category: 'Venda de Serviço',
            amount: inv.totalValue,
            type: 'income',
            invoiceImage: inv.invoiceImage,
        }));

        const expenses: FinancialRecord[] = [];

        // Employee Payments
        paymentRecords.forEach(p => {
            expenses.push({
                id: p.id,
                date: p.date,
                description: `Pagamento para ${p.employeeName}`,
                category: `Folha de Pagamento (${p.type})`,
                amount: p.amount,
                type: 'expense',
            });
        });

        // Other Fixed Expenses and One-Time Purchases
        fixedExpenses.filter(e => !e.employeeId).forEach(e => { // Filter out salary templates
            expenses.push({
                id: e.id,
                date: e.isOneTimePurchase ? e.purchaseDate! : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                description: e.name,
                category: e.isOneTimePurchase ? 'Compra de Material' : 'Gasto Fixo',
                amount: e.monthlyCost,
                type: 'expense',
                invoiceImage: e.invoiceImage,
            });
        });

        return [...income, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [issuedInvoices, paymentRecords, fixedExpenses, stockMovements, stock]);


    const filteredRecords = useMemo(() => {
        let records = allRecords.filter(r => r.type === activeTab);
        
        if (filterType === 'all') {
            return records;
        }
        
        const now = new Date();
        let startRange: Date;
        const endRange = new Date(new Date(now).setHours(23, 59, 59, 999));


        switch (filterType) {
            case 'today':
              startRange = new Date(new Date(now).setHours(0, 0, 0, 0));
              break;
            case 'week':
              const firstDayOfWeek = new Date(now);
              firstDayOfWeek.setDate(now.getDate() - now.getDay());
              startRange = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
              break;
            case 'month':
              startRange = new Date(now.getFullYear(), now.getMonth(), 1);
              startRange.setHours(0, 0, 0, 0);
              break;
            case 'year':
              startRange = new Date(now.getFullYear(), 0, 1);
              startRange.setHours(0, 0, 0, 0);
              break;
        }

        return records.filter(rec => {
            const recDate = new Date(rec.date);
            return recDate >= startRange && recDate <= endRange;
        });
    }, [allRecords, activeTab, filterType]);

    const FilterButton: React.FC<{ type: FilterType, label: string }> = ({ type, label }) => (
      <button 
        onClick={() => setFilterType(type)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filterType === type ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)]'}`}
      >
        {label}
      </button>
    );

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Histórico Financeiro</h2>
                <p className="text-[var(--color-text-secondary)]">Consulte todas as entradas e saídas de caixa.</p>
            </div>

            <div className="border-b border-[var(--color-border-primary)] mb-6">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => { setActiveTab('income'); setFilterType('all'); }} className={`${activeTab === 'income' ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-secondary)]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Entradas
                    </button>
                    <button onClick={() => { setActiveTab('expense'); setFilterType('all'); }} className={`${activeTab === 'expense' ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-secondary)]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Saídas
                    </button>
                </nav>
            </div>
            
            <div className="mb-6 p-4 bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[var(--color-text-secondary)] mr-2">Filtrar por:</span>
              <FilterButton type="all" label="Tudo" />
              <FilterButton type="today" label="Hoje" />
              <FilterButton type="week" label="Esta Semana" />
              <FilterButton type="month" label="Este Mês" />
              <FilterButton type="year" label="Este Ano" />
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full text-sm text-left text-[var(--color-text-secondary)]">
                        <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Descrição</th>
                                <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3 text-center">Comprovante</th>
                                <th scope="col" className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map(rec => (
                                    <tr key={rec.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(rec.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{rec.description}</td>
                                        <td className="px-6 py-4">{rec.category}</td>
                                        <td className="px-6 py-4 text-center">
                                            {rec.invoiceImage ? (
                                                <button onClick={() => setViewingImage(rec.invoiceImage!)} className="text-[var(--color-text-accent)] hover:brightness-125 text-xs font-bold underline">
                                                    Ver Nota
                                                </button>
                                            ) : (
                                                <span className="text-[var(--color-text-secondary)]/70">--</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${rec.type === 'income' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                                            {rec.type === 'expense' && '-'}{formatCurrency(rec.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center py-12 text-[var(--color-text-secondary)]">Nenhum registro encontrado para o período selecionado.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[var(--color-bg-secondary)] font-bold">
                                <td colSpan={4} className="px-6 py-3 text-right text-[var(--color-text-primary)] uppercase">Total do Período</td>
                                <td className={`px-6 py-3 text-right text-lg ${activeTab === 'income' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                                    {formatCurrency(filteredRecords.reduce((sum, rec) => sum + rec.amount, 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {viewingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[70] p-4" onClick={() => setViewingImage(null)}>
                    <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl p-2 border border-[var(--color-border-primary)] max-w-4xl max-h-[90vh] relative">
                        <button onClick={() => setViewingImage(null)} className="absolute -top-3 -right-3 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] text-[var(--color-text-primary)] rounded-full w-8 h-8 flex items-center justify-center text-lg z-10">&times;</button>
                        <div className="overflow-auto max-h-[calc(90vh-1rem)]">
                             <img src={`data:image/jpeg;base64,${viewingImage}`} alt="Nota Fiscal" className="max-w-full max-h-full object-contain rounded-lg" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvoicesHistory;