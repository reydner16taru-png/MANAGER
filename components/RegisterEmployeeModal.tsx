import React, { useState, useEffect } from 'react';
import type { Employee } from '../types';
import { EmployeeRole } from '../types';

interface ManageEmployeesModalProps {
    onClose: () => void;
    loggedInUser: Employee;
    employees: Employee[];
    onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
}

const ManageEmployeesModal: React.FC<ManageEmployeesModalProps> = ({ onClose, loggedInUser, employees, onAddEmployee, onUpdateEmployee }) => {
    // State for the "add new" form
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<EmployeeRole>(EmployeeRole.MONTADOR);
    const [newPhone, setNewPhone] = useState('');
    const [newEmployeeId, setNewEmployeeId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    
    // State for the "edit self" form
    const [selfFormState, setSelfFormState] = useState<Employee>(loggedInUser);

    useEffect(() => {
        setSelfFormState(loggedInUser);
    }, [loggedInUser]);

    const isManager = loggedInUser.role === EmployeeRole.GERENTE;

    const resetForm = () => {
        setNewName(''); setNewRole(EmployeeRole.MONTADOR); setNewPhone('');
        setNewEmployeeId(''); setNewPassword(''); setError('');
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newName.trim() || !newRole) {
            setError('Nome completo e Cargo são obrigatórios.');
            return;
        }
        onAddEmployee({ name: newName, role: newRole, phone: newPhone, employeeId: newEmployeeId, password: newPassword });
        resetForm();
    };

    const handleUpdateSelfSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateEmployee(selfFormState);
        alert('Seu perfil foi atualizado com sucesso!');
    };

    // Manager View: Form to add a new employee
    const renderAddEmployeeForm = () => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Adicionar Novo Funcionário</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm text-center col-span-2">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <input type="text" placeholder="Nome Completo" value={newName} onChange={e => setNewName(e.target.value)} required className="input-style" />
                    <select value={newRole} onChange={e => setNewRole(e.target.value as EmployeeRole)} className="input-style">
                        {Object.values(EmployeeRole).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input type="tel" placeholder="Telefone" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="input-style" />
                    <input type="text" placeholder="ID ou Matrícula (Opcional)" value={newEmployeeId} onChange={e => setNewEmployeeId(e.target.value)} className="input-style" />
                    <input type="password" placeholder="Senha de Acesso" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-style col-span-2" />
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition">Salvar Funcionário</button>
                </div>
            </form>
        </div>
    );

    // Manager View: List of all employees
    const renderEmployeeList = () => (
        <div>
             <h3 className="text-lg font-semibold text-cyan-300 mb-4">Funcionários Cadastrados</h3>
             <div className="bg-slate-800/70 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-64">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0">
                            <tr><th scope="col" className="px-6 py-3">Nome</th><th scope="col" className="px-6 py-3">Cargo</th><th scope="col" className="px-6 py-3 text-center">Ações</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {employees.length > 0 ? (
                                employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-white">{emp.name}</td>
                                        <td className="px-6 py-4">{emp.role}</td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button className="text-yellow-400 hover:text-yellow-200 text-xs font-bold">Editar</button>
                                            <button className="text-red-400 hover:text-red-200 text-xs font-bold">Excluir</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="text-center py-8 text-slate-400">Nenhum funcionário cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );

    // Non-manager View: Edit own profile
    const renderSelfProfileForm = () => (
         <div className="mb-8">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Meu Perfil</h3>
            <form onSubmit={handleUpdateSelfSubmit} className="space-y-4 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="text-xs text-slate-400">Nome</label>
                        <input type="text" value={selfFormState.name} onChange={e => setSelfFormState(s => ({...s, name: e.target.value}))} required className="input-style" />
                    </div>
                     <div>
                        <label className="text-xs text-slate-400">Cargo</label>
                        <input type="text" value={selfFormState.role} readOnly className="input-style bg-slate-700/50 cursor-not-allowed" />
                    </div>
                     <div>
                        <label className="text-xs text-slate-400">Telefone</label>
                        <input type="tel" value={selfFormState.phone} onChange={e => setSelfFormState(s => ({...s, phone: e.target.value}))} className="input-style" />
                    </div>
                     <div>
                        <label className="text-xs text-slate-400">ID / Matrícula</label>
                        <input type="text" value={selfFormState.employeeId} readOnly className="input-style bg-slate-700/50 cursor-not-allowed" />
                    </div>
                     <div className="col-span-2">
                        <label className="text-xs text-slate-400">Nova Senha (deixe em branco para não alterar)</label>
                        <input type="password" placeholder="••••••••" onChange={e => setSelfFormState(s => ({...s, password: e.target.value}))} className="input-style" />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition">Atualizar Perfil</button>
                </div>
            </form>
        </div>
    );


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
                <header className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Gerenciar Equipe</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition text-2xl leading-none">&times;</button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-8">
                   {isManager ? (
                       <>
                           {renderAddEmployeeForm()}
                           {renderEmployeeList()}
                       </>
                   ) : (
                       renderSelfProfileForm()
                   )}
                </div>

                <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid #475569; background-color: #334155; color: white; placeholder-color: #94a3b8; outline: none; transition: all 0.2s; } .input-style:focus { --tw-ring-color: #06b6d4; border-color: #06b6d4; box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
                <footer className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end flex-shrink-0">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 transition">Fechar</button>
                </footer>
            </div>
        </div>
    );
};

export default ManageEmployeesModal;