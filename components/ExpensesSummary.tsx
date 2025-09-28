import React, { useState, useMemo } from 'react';
import type { FixedExpense, StockItem, StockMovement, PaymentRecord } from '../types';
import AddFixedExpenseModal from './AddFixedExpenseModal';

interface ExpensesSummaryProps {
    fixedExpenses: FixedExpense[];
    stock: StockItem[];
    stockMovements: StockMovement[];
    paymentRecords: PaymentRecord[];
    onAddExpense: (expense: Omit<FixedExpense, 'id'>) => void;
    onAddStockItem: (newItem: Omit<StockItem, 'id'>) => void;
    onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl p-6 flex items-center space-x-4">
    <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg text-[var(--color-text-accent)]">{icon}</div>
    <div>
      <p className="text-[var(--color-text-secondary)] text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  </div>
);


const ExpensesSummary: React.FC<ExpensesSummaryProps> = ({ fixedExpenses, stock, stockMovements, paymentRecords, onAddExpense, onAddStockItem, onAddStockMovement }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { 
        totalFixedCost, 
        totalMaterialsConsumedCost, 
        totalCombinedCost, 
        consumedMaterials,
        paymentsByEmployee
    } = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // 1. Custo de materiais (inalterado)
        const consumed = stockMovements.filter(m => m.type === 'saída');
        const materialsCost = consumed.reduce((sum, movement) => {
            const stockItem = stock.find(s => s.id === movement.stockItemId);
            const price = stockItem ? stockItem.unitPrice : 0;
            return sum + (movement.quantity * price);
        }, 0);

        // 2. Separa outros gastos fixos de salários
        const otherFixedExpenses = fixedExpenses.filter(exp => !exp.employeeId);
        const totalOtherFixedCost = otherFixedExpenses.reduce((sum, exp) => sum + exp.monthlyCost, 0);

        // 3. Calcula o total de salários pagos no mês atual
        const paymentsByEmployee: Record<string, number> = {};
        paymentRecords.forEach(p => {
            const pDate = new Date(p.date);
            if (p.employeeId && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                paymentsByEmployee[p.employeeId] = (paymentsByEmployee[p.employeeId] || 0) + p.amount;
            }
        });
        const totalSalariesPaidThisMonth = Object.values(paymentsByEmployee).reduce((sum, amount) => sum + amount, 0);

        // 4. Calcula os totais para os cards de resumo
        // O "Gasto Total" agora usa apenas salários pagos + outros gastos fixos + materiais
        const totalCombinedCostForSummary = totalOtherFixedCost + totalSalariesPaidThisMonth + materialsCost;
        
        // O card de "Gastos Fixos" continua mostrando o total potencial do mês
        const totalPotentialFixedCost = fixedExpenses.reduce((sum, expense) => sum + expense.monthlyCost, 0);

        return {
            totalFixedCost: totalPotentialFixedCost,
            totalMaterialsConsumedCost: materialsCost,
            totalCombinedCost: totalCombinedCostForSummary,
            consumedMaterials: consumed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            paymentsByEmployee,
        };
    }, [fixedExpenses, stock, stockMovements, paymentRecords]);

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Visão Geral de Gastos</h2>
                <p className="text-[var(--color-text-secondary)]">Acompanhe todos os custos fixos e materiais consumidos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Gasto Total (Realizado)" value={formatCurrency(totalCombinedCost)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <SummaryCard title="Gastos com Materiais (Consumidos)" value={formatCurrency(totalMaterialsConsumedCost)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                <SummaryCard title="Gastos Fixos (Potencial Mensal)" value={formatCurrency(totalFixedCost)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
            </div>

            <div className="space-y-8">
                {/* Fixed Expenses Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Gastos Fixos e Diversos</h3>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center text-sm bg-[var(--color-accent-primary)]/80 hover:bg-[var(--color-accent-primary)] text-white font-semibold py-2 px-3 rounded-lg transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            Adicionar Gasto
                        </button>
                    </div>
                    <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left text-[var(--color-text-secondary)]">
                            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nome do Gasto</th>
                                    <th scope="col" className="px-6 py-3 text-right">Valor Mensal</th>
                                    <th scope="col" className="px-6 py-3 text-right">Valor Pago (Mês)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fixedExpenses.length > 0 ? (
                                    fixedExpenses.map(exp => {
                                        const paidAmount = exp.employeeId ? (paymentsByEmployee[exp.employeeId] || 0) : null;
                                        return (
                                            <tr key={exp.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                                <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{exp.name}</td>
                                                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(exp.monthlyCost)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {paidAmount !== null ? (
                                                        <span className="font-semibold text-[var(--color-success-text)]">{formatCurrency(paidAmount)}</span>
                                                    ) : (
                                                        <span className="text-[var(--color-text-secondary)]/70">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr><td colSpan={3} className="text-center py-8 text-[var(--color-text-secondary)]">Nenhum gasto fixo cadastrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Consumed Materials Section */}
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Gastos com Materiais (Saídas de Estoque)</h3>
                    <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left text-[var(--color-text-secondary)]">
                            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Item</th>
                                    <th scope="col" className="px-6 py-3 text-center">Quantidade</th>
                                    <th scope="col" className="px-6 py-3">Motivo</th>
                                    <th scope="col" className="px-6 py-3 text-right">Custo Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consumedMaterials.length > 0 ? (
                                    consumedMaterials.map(movement => {
                                        const stockItem = stock.find(s => s.id === movement.stockItemId);
                                        const cost = stockItem ? movement.quantity * stockItem.unitPrice : 0;
                                        return (
                                            <tr key={movement.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-secondary)]">{new Date(movement.timestamp).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{movement.stockItemName}</td>
                                                <td className="px-6 py-4 text-center">{movement.quantity.toFixed(2)} {stockItem?.unitOfMeasure}</td>
                                                <td className="px-6 py-4">{movement.reason}{movement.relatedCarPlate && ` (${movement.relatedCarPlate})`}</td>
                                                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(cost)}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr><td colSpan={5} className="text-center py-8 text-[var(--color-text-secondary)]">Nenhum material consumido registrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <AddFixedExpenseModal
                    onClose={() => setIsModalOpen(false)}
                    onAddExpense={onAddExpense}
                    stock={stock}
                    onAddStockItem={onAddStockItem}
                    onAddStockMovement={onAddStockMovement}
                />
            )}
        </>
    );
};

export default ExpensesSummary;
