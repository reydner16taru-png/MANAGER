import React, { useState } from 'react';
import type { Car, WorkLog } from '../types';
import { CarStatus } from '../types';
import WorkLogDetailModal from './WorkLogDetailModal';

interface CarDetailModalProps {
    car: Car;
    onClose: () => void;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode; }> = ({ label, value }) => (
    <div className="flex justify-between items-start py-3 border-b border-[var(--color-border-primary)]">
        <dt className="text-sm font-medium text-[var(--color-text-secondary)] w-1/3 pr-4">{label}</dt>
        <dd className="text-sm text-[var(--color-text-primary)] font-semibold text-right">{value}</dd>
    </div>
);

// Note: The component is renamed internally for clarity, but the filename is kept for simplicity of update.
const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, onClose }) => {
    const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);
    const finalProfit = car.serviceValue - car.accumulatedCost;
    const isCompleted = car.status === CarStatus.COMPLETED;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)] flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                           {isCompleted ? 'Detalhes do Serviço Concluído' : 'Detalhes do Serviço em Andamento'}
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-sm">{car.brand} {car.model} - <span className="font-mono">{car.plate}</span></p>
                    </div>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button>
                </header>

                <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Left Column: Details */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-[var(--color-text-accent)] mb-3">Informações Gerais</h3>
                         <dl>
                            <DetailRow label="Cliente" value={car.customer} />
                            <DetailRow label="Status" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${isCompleted ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' : 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]'}`}>{car.status}</span>} />
                            {!isCompleted && <DetailRow label="Etapa Atual" value={car.currentStage} />}
                            <DetailRow label="Data de Saída" value={new Date(car.exitDate).toLocaleDateString()} />
                             <div className="py-3 border-b border-[var(--color-border-primary)]">
                                <dt className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Descrição do Serviço</dt>
                                <dd className="text-sm text-[var(--color-text-primary)] font-semibold break-words">{car.description || 'N/A'}</dd>
                            </div>
                         </dl>
                         
                         <h3 className="text-lg font-semibold text-[var(--color-text-accent)] pt-6 mb-3">Resumo Financeiro</h3>
                         <dl>
                            <DetailRow label="Valor do Serviço" value={<span className="text-[var(--color-success-text)]">{formatCurrency(car.serviceValue)}</span>} />
                            <DetailRow label="Custo Acumulado (Materiais)" value={<span className="text-[var(--color-danger-text)]">{formatCurrency(car.accumulatedCost)}</span>} />
                            {isCompleted && (
                               <DetailRow 
                                    label="Lucro Final" 
                                    value={
                                        <span className={`font-bold ${finalProfit >= 0 ? 'text-[var(--color-text-accent)]' : 'text-[var(--color-danger-text)]'}`}>
                                            {formatCurrency(finalProfit)}
                                        </span>
                                    } 
                                />
                            )}
                         </dl>
                    </div>
                    {/* Right Column: History */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-[var(--color-text-accent)] mb-3">Histórico de Ações</h3>
                         <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 bg-[var(--color-bg-primary)]/40 p-4 rounded-lg border border-[var(--color-border-primary)]">
                            {[...car.workLog].reverse().map(log => (
                                <button
                                    key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    className={`w-full text-left p-3 rounded-lg border-l-4 transition-colors duration-200 hover:bg-[var(--color-bg-tertiary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 ${
                                        log.notes?.startsWith('PROBLEMA:') ? 'border-[var(--color-danger-text)] bg-[var(--color-danger-bg)]' : 'border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)]/60'
                                    }`}
                                >
                                    <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] mb-2">
                                        <span>{log.employeeName}</span>
                                        <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <p className="font-semibold text-sm text-[var(--color-text-primary)]">Etapa: <span className="font-bold text-[var(--color-text-accent)]">{log.stage}</span></p>
                                    {log.notes && <p className={`mt-2 text-sm italic ${log.notes.startsWith('PROBLEMA:') ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-secondary)]'}`}>"{log.notes}"</p>}
                                    {log.cost && log.cost > 0 && <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-mono">Custo da etapa: {formatCurrency(log.cost)}</p>}
                                </button>
                            ))}
                            {car.workLog.length === 0 && <p className="text-center text-sm text-[var(--color-text-secondary)] py-8">Nenhuma ação registrada ainda.</p>}
                         </div>
                    </div>
                </div>

                <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end flex-shrink-0">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Fechar</button>
                </footer>
            </div>
            
            {selectedLog && (
                <WorkLogDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
};

export default CarDetailModal;
