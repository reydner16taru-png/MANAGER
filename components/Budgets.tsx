import React, { useState, useRef, useEffect } from 'react';
import type { Budget, WorkshopProfile } from '../types';
import { BudgetStatus } from '../types';
import NewBudgetForm from './NewBudgetForm';
import BudgetPDFLayout from './BudgetPDFLayout';

// TypeScript declarations for global libraries from CDN
declare const html2canvas: any;
declare const jspdf: any;


interface BudgetsProps {
    budgets: Budget[];
    onAddBudget: (newBudget: Omit<Budget, 'id' | 'creationDate'>) => void;
    workshopProfile: WorkshopProfile;
    onUpdateBudget: (budgetId: string, newStatus: BudgetStatus) => void;
    onUpdateBudgetDetails: (updatedBudget: Budget) => void;
    onConvertBudgetToCar: (budget: Budget) => void;
}

const statusColorMap: Record<BudgetStatus, string> = {
    [BudgetStatus.PENDING]: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
    [BudgetStatus.APPROVED]: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
    [BudgetStatus.REJECTED]: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
    [BudgetStatus.IN_SERVICE]: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
};

const Budgets: React.FC<BudgetsProps> = ({ budgets, onAddBudget, workshopProfile, onUpdateBudget, onUpdateBudgetDetails, onConvertBudgetToCar }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [budgetToExport, setBudgetToExport] = useState<Budget | null>(null);
    const pdfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (budgetToExport && pdfRef.current) {
            const { jsPDF } = jspdf;
            html2canvas(pdfRef.current, { scale: 2 })
                .then((canvas: HTMLCanvasElement) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Orcamento-${budgetToExport.customerName.replace(/\s/g, '_')}-${budgetToExport.vehiclePlate}.pdf`);
                })
                .finally(() => {
                    setBudgetToExport(null); // Reset state to hide the PDF layout component
                });
        }
    }, [budgetToExport]);

    const handleSaveNewBudget = (newBudget: Omit<Budget, 'id' | 'creationDate'>) => {
        onAddBudget(newBudget);
        setIsCreating(false);
    };

    const handleSaveChanges = (updatedData: Omit<Budget, 'id' | 'creationDate'>) => {
        if (editingBudget) {
            const fullUpdatedBudget: Budget = {
                ...updatedData,
                id: editingBudget.id,
                creationDate: editingBudget.creationDate,
            };
            onUpdateBudgetDetails(fullUpdatedBudget);
        }
        setEditingBudget(null);
    };

    const handleExportPdf = (budget: Budget) => {
        setBudgetToExport(budget);
    };

    const handleSendEmail = (budget: Budget) => {
        const subject = `Orçamento de Serviço - ${workshopProfile.name} - ${budget.vehicleBrand} ${budget.vehicleModel}`;
        const body = `Olá, ${budget.customerName}!\n\nSegue o orçamento para o veículo ${budget.vehicleBrand} ${budget.vehicleModel}, placa ${budget.vehiclePlate}.\n\nPor favor, encontre o arquivo PDF em anexo.\n\nAtenciosamente,\nEquipe ${workshopProfile.name}`;
        const mailtoLink = `mailto:${budget.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const renderActions = (budget: Budget) => {
        switch (budget.status) {
            case BudgetStatus.PENDING:
                return (
                    <>
                        <button onClick={() => setEditingBudget(budget)} className="text-[var(--color-warning-text)] hover:brightness-125 text-xs font-bold">EDITAR</button>
                        <button onClick={() => onUpdateBudget(budget.id, BudgetStatus.APPROVED)} className="text-[var(--color-success-text)] hover:brightness-125 text-xs font-bold">APROVAR</button>
                        <button onClick={() => onUpdateBudget(budget.id, BudgetStatus.REJECTED)} className="text-[var(--color-danger-text)] hover:brightness-125 text-xs font-bold">REJEITAR</button>
                    </>
                );
            case BudgetStatus.APPROVED:
                return (
                    <button onClick={() => onConvertBudgetToCar(budget)} className="flex items-center text-[var(--color-text-accent)] hover:brightness-125 text-xs font-bold">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                        ENVIAR P/ FLUXO
                    </button>
                );
            case BudgetStatus.REJECTED:
                 return <span className="text-xs text-[var(--color-text-secondary)]">Rejeitado</span>;
            case BudgetStatus.IN_SERVICE:
                 return <span className="text-xs text-[var(--color-text-secondary)]">Em Serviço</span>;
            default:
                return null;
        }
    }

    if (isCreating) {
        return <NewBudgetForm onSave={handleSaveNewBudget} onCancel={() => setIsCreating(false)} />;
    }

    if (editingBudget) {
        return <NewBudgetForm budgetToEdit={editingBudget} onSave={handleSaveChanges} onCancel={() => setEditingBudget(null)} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Orçamentos</h2>
                    <p className="text-[var(--color-text-secondary)]">Crie e gerencie os orçamentos dos clientes.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center justify-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Novo Orçamento
                </button>
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm text-left text-[var(--color-text-secondary)]">
                        <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                            <tr>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3">Veículo</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Valor Total</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.length > 0 ? (
                                budgets.map(budget => (
                                    <tr key={budget.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                        <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{budget.customerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{budget.vehicleBrand} {budget.vehicleModel} ({budget.vehiclePlate})</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(budget.creationDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[budget.status]}`}>
                                                {budget.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold whitespace-nowrap">{budget.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-4">
                                                {renderActions(budget)}
                                                <div className="flex items-center space-x-2 border-l border-[var(--color-border-secondary)] pl-4">
                                                     <button onClick={() => handleExportPdf(budget)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)]" title="Gerar PDF">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                                                     </button>
                                                     <button onClick={() => handleSendEmail(budget)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)]" title="Enviar por Email">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                                     </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-12 text-[var(--color-text-secondary)]">Nenhum orçamento criado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden component for PDF generation */}
            {budgetToExport && (
                 <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }}>
                    <BudgetPDFLayout ref={pdfRef} budget={budgetToExport} workshopProfile={workshopProfile} />
                </div>
            )}
        </>
    );
};

export default Budgets;
