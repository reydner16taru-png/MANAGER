import React, { useMemo } from 'react';
import type { Car, WorkLog, GeneralProblem } from '../types';

interface ProblemManagementProps {
    cars: Car[];
    onResolveProblem: (carId: string, workLogId: string) => void;
    generalProblems: GeneralProblem[];
    onResolveGeneralProblem: (problemId: string) => void;
}

type UnifiedProblem = {
    id: string;
    timestamp: string;
    type: 'car' | 'general';
    title: string;
    subtitle: string;
    description: string;
    onResolve: () => void;
    isResolved: boolean;
};


const ProblemManagement: React.FC<ProblemManagementProps> = ({ cars, onResolveProblem, generalProblems, onResolveGeneralProblem }) => {

    const allProblems = useMemo((): UnifiedProblem[] => {
        const problems: UnifiedProblem[] = [];

        // Car problems
        cars.forEach(car => {
            car.workLog.forEach(log => {
                if (log.notes?.startsWith('PROBLEMA:')) {
                    problems.push({
                        id: log.id,
                        timestamp: log.timestamp,
                        type: 'car',
                        title: `${car.brand} ${car.model} - ${car.plate}`,
                        subtitle: `Etapa: ${log.stage} | Por: ${log.employeeName}`,
                        description: log.notes.replace('PROBLEMA: ', ''),
                        onResolve: () => onResolveProblem(car.id, log.id),
                        isResolved: log.resolved || false,
                    });
                }
            });
        });

        // General problems
        generalProblems.forEach(problem => {
            problems.push({
                id: problem.id,
                timestamp: problem.timestamp,
                type: 'general',
                title: 'Problema Geral da Oficina',
                subtitle: `Relatado por: ${problem.reporterName}`,
                description: problem.description,
                onResolve: () => onResolveGeneralProblem(problem.id),
                isResolved: problem.resolved,
            });
        });

        return problems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [cars, generalProblems, onResolveProblem, onResolveGeneralProblem]);


    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Histórico de Problemas</h2>
                <p className="text-[var(--color-text-secondary)]">Revise todos os problemas relatados, pendentes e resolvidos.</p>
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl">
                <div className="p-4 bg-[var(--color-bg-secondary)]">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Total de Problemas Registrados ({allProblems.length})</h3>
                </div>
                <div className="space-y-4 p-6">
                    {allProblems.length > 0 ? (
                        allProblems.map((problem) => (
                            <div
                                key={problem.id}
                                className={`bg-[var(--color-bg-secondary)] border rounded-lg p-5 flex flex-col md:flex-row items-start gap-4 transition-all duration-300 ${
                                    problem.isResolved
                                        ? 'border-[var(--color-success-text)]/30 opacity-70'
                                        : (problem.type === 'car' ? 'border-[var(--color-danger-text)]/30' : 'border-[var(--color-warning-text)]/30')
                                }`}
                            >
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-[var(--color-text-primary)]">{problem.title}</h4>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                {problem.subtitle} em {new Date(problem.timestamp).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-sm p-3 rounded-md italic ${
                                        problem.isResolved 
                                            ? 'bg-[var(--color-bg-tertiary)]/50 text-[var(--color-text-secondary)]' 
                                            : (problem.type === 'car' ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]')
                                    }`}>
                                        "{problem.description}"
                                    </p>
                                </div>
                                <div className="flex-shrink-0 pt-2">
                                    {problem.isResolved ? (
                                        <div className="flex items-center text-[var(--color-success-text)] font-bold text-sm px-4 py-2 bg-[var(--color-success-bg)] rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Resolvido
                                        </div>
                                    ) : (
                                        <button
                                            onClick={problem.onResolve}
                                            className="flex items-center justify-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Marcar como Resolvido
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-16">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">Nenhum problema foi relatado</h3>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">O histórico de problemas da oficina aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemManagement;
