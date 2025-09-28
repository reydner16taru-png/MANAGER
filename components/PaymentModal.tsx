import React, { useState, useMemo } from 'react';
import type { Employee } from '../types';

interface PaymentModalProps {
    employee: Employee & { totalPaid: number; remaining: number };
    onClose: () => void;
    onConfirm: (paymentType: 'Salário' | 'Vale', amount: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ employee, onClose, onConfirm }) => {
    const [paymentOption, setPaymentOption] = useState<'full' | 'advance'>('full');
    const [advanceAmount, setAdvanceAmount] = useState<number | ''>('');
    const [error, setError] = useState('');

    const amountToPay = useMemo(() => {
        if (paymentOption === 'full') {
            return employee.remaining;
        }
        return Number(advanceAmount);
    }, [paymentOption, advanceAmount, employee.remaining]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (paymentOption === 'advance') {
            if (Number(advanceAmount) <= 0) {
                setError('O valor do vale deve ser maior que zero.');
                return;
            }
            if (Number(advanceAmount) > employee.remaining) {
                setError(`O valor do vale não pode exceder o saldo a pagar de ${employee.remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`);
                return;
            }
        }
        
        onConfirm(paymentOption === 'full' ? 'Salário' : 'Vale', amountToPay);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" aria-modal="true" role="dialog">
            <form onSubmit={handleSubmit} className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-lg border border-[var(--color-border-primary)]">
                <header className="p-6 border-b border-[var(--color-border-primary)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Realizar Pagamento</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">Para: <span className="font-semibold text-[var(--color-text-accent)]">{employee.name}</span></p>
                </header>
                <div className="p-8 space-y-6">
                    {error && <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] p-3 rounded-md text-sm text-center">{error}</div>}
                    <div className="space-y-3">
                        <label
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${paymentOption === 'full' ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border-secondary)] bg-[var(--color-bg-tertiary)]/50'}`}
                        >
                            <input
                                type="radio"
                                name="paymentOption"
                                value="full"
                                checked={paymentOption === 'full'}
                                onChange={() => setPaymentOption('full')}
                                className="h-4 w-4 text-[var(--color-accent-primary)] border-[var(--color-border-secondary)] focus:ring-[var(--color-accent-primary)]"
                            />
                            <span className="ml-3 text-sm font-medium text-[var(--color-text-primary)]">Pagar Salário Total (quitar saldo)</span>
                        </label>
                        <label
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${paymentOption === 'advance' ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border-secondary)] bg-[var(--color-bg-tertiary)]/50'}`}
                        >
                            <input
                                type="radio"
                                name="paymentOption"
                                value="advance"
                                checked={paymentOption === 'advance'}
                                onChange={() => setPaymentOption('advance')}
                                className="h-4 w-4 text-[var(--color-accent-primary)] border-[var(--color-border-secondary)] focus:ring-[var(--color-accent-primary)]"
                            />
                            <span className="ml-3 text-sm font-medium text-[var(--color-text-primary)]">Fazer um Vale / Adiantamento</span>
                        </label>
                    </div>

                    {paymentOption === 'advance' && (
                         <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Valor do Vale (R$)</label>
                            <input
                                type="number"
                                value={advanceAmount}
                                onChange={e => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                min="0.01"
                                step="0.01"
                                max={employee.remaining}
                                required
                                className="input-style"
                                placeholder="Ex: 500.00"
                            />
                        </div>
                    )}
                    
                    <div className="p-4 bg-[var(--color-bg-primary)]/50 rounded-lg text-center border border-[var(--color-border-primary)]">
                        <p className="text-sm text-[var(--color-text-secondary)]">Valor a ser pago nesta transação:</p>
                        <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{amountToPay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }`}</style>
                <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                    <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Confirmar Pagamento</button>
                </footer>
            </form>
        </div>
    );
};

export default PaymentModal;
