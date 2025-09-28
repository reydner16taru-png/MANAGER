import React, { useState, useMemo } from 'react';
import type { AuditLogEntry, Employee } from '../types';

interface AuditLogViewProps {
    auditLog: AuditLogEntry[];
    employees: Employee[];
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLog, employees }) => {
    const [filterActorId, setFilterActorId] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const filteredLogs = useMemo(() => {
        return auditLog.filter(log => {
            const logDate = new Date(log.timestamp);
            const start = filterStartDate ? new Date(filterStartDate + 'T00:00:00') : null;
            const end = filterEndDate ? new Date(filterEndDate + 'T23:59:59') : null;

            if (start && logDate < start) return false;
            if (end && logDate > end) return false;
            if (filterActorId !== 'all' && log.actorId !== filterActorId) return false;
            
            return true;
        });
    }, [auditLog, filterActorId, filterStartDate, filterEndDate]);
    
    const exportToCsv = () => {
        if (filteredLogs.length === 0) {
            alert("Nenhum dado para exportar.");
            return;
        }

        const headers = ['Timestamp', 'Autor', 'Ação', 'Detalhes'];
        const rows = filteredLogs.map(log => [
            `"${new Date(log.timestamp).toLocaleString('pt-BR')}"`,
            `"${log.actorName}"`,
            `"${log.action}"`,
            `"${log.details.replace(/"/g, '""')}"`
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `auditoria_oficina_manager_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                  <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Trilha de Auditoria</h2>
                  <p className="text-[var(--color-text-secondary)]">Monitore todas as ações importantes no sistema.</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label htmlFor="actorFilter" className="text-sm font-medium text-[var(--color-text-secondary)]">Funcionário:</label>
                    <select id="actorFilter" value={filterActorId} onChange={e => setFilterActorId(e.target.value)} className="input-style-sm">
                        <option value="all">Todos</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm text-[var(--color-text-secondary)]">De:</label>
                    <input type="date" id="startDate" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="input-style-sm" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm text-[var(--color-text-secondary)]">Até:</label>
                    <input type="date" id="endDate" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="input-style-sm" />
                </div>
                <button
                    onClick={exportToCsv}
                    className="w-full sm:w-auto sm:ml-auto flex items-center justify-center bg-[var(--color-accent-primary)]/80 hover:bg-[var(--color-accent-primary)] text-white font-semibold py-2 px-3 rounded-lg text-sm transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    Exportar CSV
                </button>
            </div>
            
             <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left text-[var(--color-text-secondary)]">
                  <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                    <tr>
                      <th scope="col" className="px-6 py-3">Data/Hora</th>
                      <th scope="col" className="px-6 py-3">Autor</th>
                      <th scope="col" className="px-6 py-3">Ação</th>
                      <th scope="col" className="px-6 py-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredLogs.length > 0 ? (
                          filteredLogs.map(log => (
                              <tr key={log.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                  <td className="px-6 py-4 whitespace-nowrap text-[var(--color-text-secondary)]">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{log.actorName}</td>
                                  <td className="px-6 py-4">
                                      <span className="font-mono bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md text-[var(--color-text-accent)] text-xs">{log.action}</span>
                                  </td>
                                  <td className="px-6 py-4">{log.details}</td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={4} className="text-center py-12 text-[var(--color-text-secondary)]">Nenhum registro de auditoria encontrado para os filtros selecionados.</td></tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            <style>{`.input-style-sm { appearance: none; border-radius: 0.375rem; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); outline: none; transition: all 0.2s; font-size: 0.875rem; } .input-style-sm:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }`}</style>
        </div>
    );
};

export default AuditLogView;
