import React, { useState, useEffect } from 'react';
import type { Employee } from '../types';
import { EmployeeRole } from '../types';

interface ManageEmployeeModalProps {
    onClose: () => void;
    onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
    onRemove: () => void;
    employeeToEdit?: Employee | null;
}

const initialFormState: Omit<Employee, 'id'> = {
    name: '',
    role: EmployeeRole.MONTADOR,
    phone: '',
    employeeId: '',
    password: '',
    salary: 0,
};

const ManageEmployeeModal: React.FC<ManageEmployeeModalProps> = ({ onClose, onAddEmployee, onUpdateEmployee, onRemove, employeeToEdit }) => {
    const isEditing = !!employeeToEdit;
    const [formData, setFormData] = useState<Omit<Employee, 'id' | 'password'> & { password?: string }>(initialFormState);
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (isEditing && employeeToEdit) {
            setFormData({
                ...employeeToEdit,
                password: '', // Password is blank for editing unless changed
            });
        } else {
            setFormData(initialFormState);
        }
    }, [employeeToEdit, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.employeeId?.trim()) {
            setError('Nome e ID de Acesso são campos obrigatórios.');
            return;
        }

        if (isEditing && employeeToEdit) {
             const finalData: Employee = {
                ...employeeToEdit, // a base é o original, para manter o ID
                ...formData, // sobrescreve com os dados do form
                // se a senha não foi alterada no form, mantém a original
                password: formData.password?.trim() ? formData.password : employeeToEdit.password,
            };
            onUpdateEmployee(finalData);
        } else {
            if (!formData.password?.trim()) {
                setError('Senha é um campo obrigatório para novos funcionários.');
                return;
            }
            onAddEmployee(formData as Omit<Employee, 'id'>);
        }
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{isEditing ? `Editar Funcionário` : 'Adicionar Novo Funcionário'}</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6 overflow-y-auto">
                        {error && <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] p-3 rounded-md text-sm text-center">{error}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Nome Completo *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Cargo *</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="input-style">
                                    {Object.values(EmployeeRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Telefone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-style" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Salário Mensal (R$)</label>
                                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="input-style" placeholder="3500.00" min="0" step="0.01" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">ID de Acesso / Matrícula *</label>
                                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required className="input-style" placeholder="Ex: M-002" disabled={isEditing} />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Senha de Acesso *</label>
                                <input 
                                    type={isPasswordVisible ? 'text' : 'password'} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleInputChange} 
                                    required={!isEditing} 
                                    className="input-style pr-10" 
                                    placeholder={isEditing ? 'Deixe em branco para não alterar' : ''}
                                />
                                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                                    {isPasswordVisible ? 
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" /><path d="M10 17a7 7 0 01-7-7c0-1.792.644-3.449 1.69-4.805L1.95 3.55a1 1 0 011.414-1.414l14.09 14.09a1 1 0 01-1.414 1.414L11.81 15.31A6.973 6.973 0 0110 17z" /></svg> :
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                    <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); } .input-style:disabled { background-color: var(--color-bg-tertiary); opacity: 0.7; cursor: not-allowed; }`}</style>
                    <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-between items-center sticky bottom-0">
                        <div>
                             {isEditing && (
                                <button
                                    type="button"
                                    onClick={onRemove}
                                    className="py-2 px-4 rounded-lg font-medium text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] hover:brightness-90 transition text-sm flex items-center gap-2"
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    Demitir Funcionário
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                            <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">{isEditing ? 'Salvar Alterações' : 'Salvar Funcionário'}</button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ManageEmployeeModal;
