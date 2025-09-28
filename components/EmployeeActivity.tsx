import React, { useState, useMemo } from 'react';
import type { Employee, Car, AuditLogEntry } from '../types';
import ManageEmployeeModal from './ManageEmployeeModal';

interface EmployeeActivityProps {
    employees: Employee[];
    cars: Car[];
    auditLog: AuditLogEntry[];
    onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
    onRemoveEmployee: (employeeId: string) => void;
}

// A unified type for the activity feed
type Activity = {
    id: string;
    timestamp: string;
    description: string;
    details?: string;
    cost?: number;
    source: 'workLog' | 'auditLog';
};

const EmployeeActivity: React.FC<EmployeeActivityProps> = ({ employees, cars, auditLog, onAddEmployee, onUpdateEmployee, onRemoveEmployee }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

    const selectedEmployee = useMemo(() => {
        if (!selectedEmployeeId) return null;
        return employees.find(e => e.id === selectedEmployeeId);
    }, [selectedEmployeeId, employees]);

    const activityFeed = useMemo((): Activity[] => {
        if (!selectedEmployee) return [];

        const employeeName = selectedEmployee.name;
        let activities: Activity[] = [];

        // 1. Process car work logs
        cars.forEach(car => {
            car.workLog.forEach(log => {
                if (log.employeeName === employeeName) {
                    activities.push({
                        id: log.id,
                        timestamp: log.timestamp,
                        description: `Concluiu a etapa '${log.stage}' no carro ${car.brand} ${car.model} (${car.plate}).`,
                        details: log.notes,
                        cost: log.cost,
                        source: 'workLog',
                    });
                }
            });
        });
        
        // 2. Process audit logs to supplement data
        auditLog.forEach(log => {
            if (log.actorName === employeeName) {
                if (log.action === 'STAGE_COMPLETED') return; // Avoid duplicates
                activities.push({
                    id: log.id,
                    timestamp: log.timestamp,
                    description: log.details,
                    source: 'auditLog',
                });
            }
        });

        // 3. Sort by most recent
        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    }, [selectedEmployee, cars, auditLog]);
    
    const openAddModal = () => {
      setEmployeeToEdit(null);
      setIsManageModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
      setEmployeeToEdit(employee);
      setIsManageModalOpen(true);
    };
    
    const closeModal = () => {
      setIsManageModalOpen(false);
      setEmployeeToEdit(null);
    };

    const handleFireEmployee = (employee: Employee) => {
        if (window.confirm(`Você tem certeza que deseja demitir permanentemente o funcionário ${employee.name}? Esta ação é irreversível e também removerá seu salário dos gastos fixos.`)) {
            if (selectedEmployeeId === employee.id) {
                setSelectedEmployeeId(null);
            }
            onRemoveEmployee(employee.id);
            // Ensure modal closes if the action was triggered from it
            closeModal();
        }
    };
    
    return (
      <>
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Gerenciamento de Funcionários</h2>
                    <p className="text-[var(--color-text-secondary)]">Adicione, remova e visualize as atividades da sua equipe.</p>
                </div>
                 <button
                    onClick={openAddModal}
                    className="flex items-center justify-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
                    Adicionar Funcionário
                </button>
            </div>

            <div className="flex flex-1 md:flex-row gap-8 min-h-0">
                {/* Employee List Panel */}
                <aside className="md:w-1/3 lg:w-1/4 flex flex-col bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 px-3 flex-shrink-0">Equipe</h3>
                    <div className="space-y-2 overflow-y-auto pr-2">
                        {employees.map(emp => (
                            <div key={emp.id} className="group relative">
                                <button
                                    onClick={() => setSelectedEmployeeId(emp.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 cursor-pointer ${
                                        selectedEmployeeId === emp.id
                                            ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-text-accent)]'
                                            : 'hover:bg-[var(--color-bg-tertiary)]/50 text-[var(--color-text-primary)]'
                                    }`}
                                >
                                    <p className="font-semibold">{emp.name}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{emp.role}</p>
                                </button>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 gap-1">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openEditModal(emp); }}
                                      className="p-1.5 rounded-full bg-[var(--color-bg-tertiary)]/50 text-[var(--color-text-secondary)] hover:bg-[var(--color-warning-bg)] hover:text-[var(--color-warning-text)] transition-all"
                                      title={`Editar ${emp.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleFireEmployee(emp); }}
                                        className="p-1.5 rounded-full bg-[var(--color-bg-tertiary)]/50 text-[var(--color-text-secondary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] transition-all"
                                        title={`Demitir ${emp.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {employees.length === 0 && (
                            <div className="text-center py-10 px-4 text-sm text-[var(--color-text-secondary)]">
                                Nenhum funcionário cadastrado.
                            </div>
                        )}
                    </div>
                </aside>

                {/* Activity Feed Panel */}
                <main className="flex-grow md:w-2/3 lg:w-3/4 bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl flex flex-col">
                    {selectedEmployeeId && selectedEmployee ? (
                        <div className="flex flex-col h-full">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] p-6 flex-shrink-0 border-b border-[var(--color-border-primary)]">
                                Histórico de <span className="text-[var(--color-text-accent)]">{selectedEmployee.name}</span>
                            </h3>
                            <div className="space-y-4 overflow-y-auto p-6">
                                {activityFeed.length > 0 ? (
                                    activityFeed.map(activity => (
                                        <div key={activity.id} className="p-4 bg-[var(--color-bg-secondary)]/70 rounded-lg border-l-4 border-[var(--color-accent-primary)] flex items-start gap-4">
                                            <div className="flex-shrink-0 pt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-text-accent)]" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-[var(--color-text-primary)]">{activity.description}</p>
                                                {activity.details && (
                                                    <p className="mt-1 text-sm text-[var(--color-text-secondary)] italic">"{activity.details}"</p>
                                                )}
                                                <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                                                    <span>{new Date(activity.timestamp).toLocaleString('pt-BR')}</span>
                                                    {typeof activity.cost !== 'undefined' && activity.cost > 0 && (
                                                        <span className="font-mono bg-[var(--color-bg-tertiary)] px-2 py-1 rounded">Custo: {activity.cost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                        <h3 className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">Nenhuma atividade registrada</h3>
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Este funcionário ainda não registrou nenhuma atividade no sistema.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-[var(--color-text-primary)]">Selecione um funcionário</h3>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Escolha um membro da equipe na lista ao lado para ver seu histórico de atividades.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
        {isManageModalOpen && (
            <ManageEmployeeModal
                employeeToEdit={employeeToEdit}
                onClose={closeModal}
                onAddEmployee={onAddEmployee}
                onUpdateEmployee={onUpdateEmployee}
                onRemove={() => employeeToEdit && handleFireEmployee(employeeToEdit)}
            />
        )}
      </>
    );
};

export default EmployeeActivity;
