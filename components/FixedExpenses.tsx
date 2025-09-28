import React, { useState, useMemo } from 'react';
// FIX: Add StockItem and StockMovement to type imports to support AddFixedExpenseModal props.
import type { FixedExpense, StockItem, StockMovement } from '../types';
import AddFixedExpenseModal from './AddFixedExpenseModal';

interface FixedExpensesProps {
    expenses: FixedExpense[];
    onAddExpense: (expense: Omit<FixedExpense, 'id'>) => void;
    // FIX: Add missing props required by AddFixedExpenseModal for its invoice import feature.
    stock: StockItem[];
    onAddStockItem: (item: Omit<StockItem, 'id'>) => void;
    onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
}

const FixedExpenses: React.FC<FixedExpensesProps> = ({ expenses, onAddExpense, stock, onAddStockItem, onAddStockMovement }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalMonthlyCost = useMemo(() => {
        return expenses.reduce((sum, expense) => sum + expense.monthlyCost, 0);
    }, [expenses]);

    return (
        <>
            <div className="flex justify-between items-center mb-8">
              <div>
                  <h2 className="text-3xl font-bold text-white">Gastos Fixos Mensais</h2>
                  <p className="text-slate-400">Controle as despesas recorrentes da oficina.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Adicionar Gasto Fixo
              </button>
            </div>
            
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center space-x-4">
                 <div className="bg-slate-700 p-3 rounded-lg text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 </div>
                 <div>
                    <p className="text-slate-400 text-sm font-medium">Total de Gastos Fixos Mensais</p>
                    <p className="text-2xl font-bold text-white">{totalMonthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                 </div>
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nome do Gasto</th>
                      <th scope="col" className="px-6 py-3 text-right">Valor Mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                      {expenses.length > 0 ? (
                          expenses.map(exp => (
                              <tr key={exp.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{exp.name}</td>
                                  <td className="px-6 py-4 text-right font-semibold">{exp.monthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={2} className="text-center py-12 text-slate-400">Nenhum gasto fixo cadastrado.</td></tr>
                      )}
                  </tbody>
                </table>
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

export default FixedExpenses;