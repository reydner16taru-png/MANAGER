import React, { useState } from 'react';
import type { Employee } from '../types';

interface ReportProblemModalProps {
    employees: Employee[];
    onClose: () => void;
    onConfirm: (reporterId: string, password: string, description: string) => boolean;
}

const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ employees, onClose, onConfirm }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedEmployeeId || !description.trim() || !password.trim()) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        const success = onConfirm(selectedEmployeeId, password, description);

        if (success) {
            onClose();
        } else {
            setError('Senha incorreta. Tente novamente.');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" aria-modal="true" role="dialog">
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
                <header className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Relatar Problema Geral</h2>
                     <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition text-2xl leading-none">&times;</button>
                </header>
                <div className="p-8 space-y-6">
                    {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm text-center">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Funcionário *</label>
                        <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="input-style">
                            <option value="" disabled>Selecione seu nome</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Sua Senha *</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Digite sua senha para confirmar"
                            className="input-style"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Descrição do Problema *</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ex: Acabou o Verniz HS no estoque."
                            className="input-style"
                        />
                    </div>
                </div>
                 <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid #475569; background-color: #334155; color: white; placeholder-color: #94a3b8; outline: none; transition: all 0.2s; } .input-style:focus { ring: 2px; ring-color: #06b6d4; border-color: #06b6d4; }`}</style>
                <footer className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 transition">Cancelar</button>
                    <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition">Enviar Relato</button>
                </footer>
            </form>
        </div>
    );
};

export default ReportProblemModal;
