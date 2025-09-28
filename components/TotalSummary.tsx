import React, { useMemo, useState } from 'react';
import type { Car, StockItem, FixedExpense, PaymentRecord, StockMovement } from '../types';
import { CarStatus } from '../types';
import CarDetailModal from './CompletedCarDetailModal';

interface TotalSummaryProps {
    cars: Car[];
    stock: StockItem[];
    fixedExpenses: FixedExpense[];
    paymentRecords: PaymentRecord[];
    stockMovements: StockMovement[];
    theme: string;
    setTheme: (theme: string) => void;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl p-6 flex items-center space-x-4 transform hover:-translate-y-1 transition-transform duration-300">
    <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg text-[var(--color-text-accent)]">{icon}</div>
    <div>
      <p className="text-[var(--color-text-secondary)] text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  </div>
);

const ThemeSwitcher: React.FC<{ currentTheme: string; setTheme: (theme: string) => void }> = ({ currentTheme, setTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const themes = [
        { id: 'theme-dark', name: 'Escuro' },
        { id: 'theme-neutral', name: 'Neutro' },
        { id: 'theme-light', name: 'Claro' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Mudar tema"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg shadow-xl z-20"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => { setTheme(theme.id); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm ${currentTheme === theme.id ? 'font-bold text-[var(--color-text-accent)]' : 'text-[var(--color-text-primary)]'} hover:bg-[var(--color-bg-tertiary)]`}
                            >
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const TotalSummary: React.FC<TotalSummaryProps> = ({ cars, stock, fixedExpenses, paymentRecords, stockMovements, theme, setTheme }) => {
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);

    const summaryData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const completedCarsThisMonth = cars.filter(c => {
            if (c.status !== CarStatus.COMPLETED && c.status !== CarStatus.HISTORY) return false;
            const exitDate = new Date(c.exitDate);
            return exitDate.getMonth() === currentMonth && exitDate.getFullYear() === currentYear;
        });
        
        const totalRevenue = completedCarsThisMonth.reduce((sum, car) => sum + car.serviceValue, 0);
        
        // --- Cálculo de Gastos Realizados no Mês ---
        
        const materialsConsumedCost = stockMovements
            .filter(m => {
                const mDate = new Date(m.timestamp);
                return m.type === 'saída' && mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear;
            })
            .reduce((sum, movement) => {
                const stockItem = stock.find(s => s.id === movement.stockItemId);
                return sum + (movement.quantity * (stockItem?.unitPrice || 0));
            }, 0);

        const recurringFixedCost = fixedExpenses
            .filter(exp => !exp.isOneTimePurchase && !exp.employeeId)
            .reduce((sum, exp) => sum + exp.monthlyCost, 0);

        const oneTimePurchasesThisMonth = fixedExpenses
            .filter(exp => {
                if (!exp.isOneTimePurchase || !exp.purchaseDate) return false;
                const pDate = new Date(exp.purchaseDate);
                return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
            })
            .reduce((sum, exp) => sum + exp.monthlyCost, 0);

        const salariesPaidThisMonth = paymentRecords
            .filter(p => {
                const pDate = new Date(p.date);
                return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        const totalExpenses = materialsConsumedCost + recurringFixedCost + oneTimePurchasesThisMonth + salariesPaidThisMonth;
        const totalProfit = totalRevenue - totalExpenses;

        // Data for Service Evolution Chart (last 4 weeks)
        const now = new Date();
        const weeklyCompletions = [
            { label: '3 sem. atrás', count: 0 },
            { label: '2 sem. atrás', count: 0 },
            { label: 'Semana passada', count: 0 },
            { label: 'Esta semana', count: 0 },
        ];

        const startOfWeek = (date: Date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        };

        const thisWeekStart = startOfWeek(now);
        thisWeekStart.setHours(0, 0, 0, 0);

        cars.filter(c => c.status === CarStatus.COMPLETED || c.status === CarStatus.HISTORY).forEach(car => {
            const exitDate = new Date(car.exitDate);
            const diffTime = thisWeekStart.getTime() - exitDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (exitDate >= thisWeekStart) {
                weeklyCompletions[3].count++; // This week
            } else if (diffDays <= 7) {
                weeklyCompletions[2].count++; // Last week
            } else if (diffDays <= 14) {
                weeklyCompletions[1].count++; // 2 weeks ago
            } else if (diffDays <= 21) {
                weeklyCompletions[0].count++; // 3 weeks ago
            }
        });

        return {
            completedCarsCount: completedCarsThisMonth.length,
            totalRevenue,
            totalExpenses,
            totalProfit,
            completedCars: completedCarsThisMonth,
            serviceEvolutionData: weeklyCompletions,
        };
    }, [cars, stock, fixedExpenses, paymentRecords, stockMovements]);
    
    const maxEvolutionCount = Math.max(...summaryData.serviceEvolutionData.map(d => d.count), 1);


    return (
        <>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Resumo Geral</h2>
                    <p className="text-[var(--color-text-secondary)]">Painel financeiro e operacional da oficina.</p>
                </div>
                <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <SummaryCard title="Receita Total (Mês)" value={formatCurrency(summaryData.totalRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                <SummaryCard title="Gastos Operacionais (Mês)" value={formatCurrency(summaryData.totalExpenses)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <SummaryCard title="Lucro Líquido (Mês)" value={formatCurrency(summaryData.totalProfit)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <SummaryCard title="Carros Concluídos (Mês)" value={String(summaryData.completedCarsCount)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl p-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Receita vs. Gastos (Mês Atual)</h3>
                     <div className="h-64 flex items-end justify-around gap-4 text-center">
                        <div className="flex flex-col justify-end items-center h-full w-1/2">
                            <div className="text-sm font-bold text-green-500 mb-1">{formatCurrency(summaryData.totalRevenue)}</div>
                            <div className="bg-green-500 w-3/4 rounded-t-md transition-all duration-700 ease-out" style={{ height: `${Math.max(0, (summaryData.totalRevenue / (summaryData.totalRevenue + summaryData.totalExpenses || 1)) * 100)}%` }}></div>
                            <span className="text-xs text-[var(--color-text-secondary)] mt-2">Receita</span>
                        </div>
                         <div className="flex flex-col justify-end items-center h-full w-1/2">
                            <div className="text-sm font-bold text-red-500 mb-1">{formatCurrency(summaryData.totalExpenses)}</div>
                            <div className="bg-red-500 w-3/4 rounded-t-md transition-all duration-700 ease-out" style={{ height: `${Math.max(0, (summaryData.totalExpenses / (summaryData.totalRevenue + summaryData.totalExpenses || 1)) * 100)}%` }}></div>
                            <span className="text-xs text-[var(--color-text-secondary)] mt-2">Gastos</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl p-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Evolução dos Serviços (Últimas 4 semanas)</h3>
                     <div className="h-64 flex items-end justify-around gap-2 text-center">
                        {summaryData.serviceEvolutionData.map((data, index) => (
                             <div key={index} className="flex flex-col justify-end items-center h-full w-1/4">
                                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{data.count}</p>
                                <div className="w-1/2 bg-[var(--color-bg-tertiary)] rounded-t-md relative overflow-hidden">
                                    <div 
                                        className="bg-[var(--color-accent-primary)] transition-all duration-700 ease-out"
                                        style={{ height: `${(data.count / maxEvolutionCount) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-[var(--color-text-secondary)] mt-2">{data.label}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Report Table */}
            <div>
                 <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Relatório Detalhado de Serviços (Mês Atual)</h3>
                 <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm text-left text-[var(--color-text-secondary)]">
                            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-tertiary)]">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Carro</th>
                                    <th scope="col" className="px-6 py-3">Cliente</th>
                                    <th scope="col" className="px-6 py-3 text-right">Custos (Materiais)</th>
                                    <th scope="col" className="px-6 py-3 text-right">Valor Recebido</th>
                                    <th scope="col" className="px-6 py-3 text-right">Lucro Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.completedCars.length > 0 ? (
                                    summaryData.completedCars.map(car => {
                                        const finalProfit = car.serviceValue - car.accumulatedCost;
                                        
                                        return (
                                            <tr 
                                                key={car.id} 
                                                className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary-hover)] cursor-pointer"
                                                onClick={() => setSelectedCar(car)}
                                            >
                                                <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                                                    {car.brand} {car.model} <span className="font-mono text-xs text-[var(--color-text-accent)]">({car.plate})</span>
                                                </td>
                                                <td className="px-6 py-4">{car.customer}</td>
                                                <td className="px-6 py-4 text-right text-red-500">{formatCurrency(car.accumulatedCost)}</td>
                                                <td className="px-6 py-4 text-right text-green-500">{formatCurrency(car.serviceValue)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-[var(--color-text-primary)]">{formatCurrency(finalProfit)}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr><td colSpan={5} className="text-center py-12 text-[var(--color-text-secondary)]">Nenhum carro concluído este mês para exibir no relatório.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
            
            {selectedCar && (
                <CarDetailModal 
                    car={selectedCar}
                    onClose={() => setSelectedCar(null)}
                />
            )}
        </>
    );
};

export default TotalSummary;