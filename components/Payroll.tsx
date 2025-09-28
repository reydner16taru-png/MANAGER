import React, { useState, useMemo } from 'react';
import type { Employee, PaymentRecord, WorkshopProfile } from '../types';
import PaymentModal from './PaymentModal';
import PaymentReceiptModal from './PaymentReceiptModal';

interface PayrollProps {
    employees: Employee[];
    paymentRecords: PaymentRecord[];
    onAddPaymentRecord: (newPayment: Omit<PaymentRecord, 'id' | 'date'>) => PaymentRecord;
    workshopProfile: WorkshopProfile;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Payroll: React.FC<PayrollProps> = ({ employees, paymentRecords, onAddPaymentRecord, workshopProfile }) => {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<{ payment: PaymentRecord, employee: Employee } | null>(null);

    const employeePaymentData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return employees.map(emp => {
            const paymentsThisMonth = paymentRecords.filter(p => {
                const pDate = new Date(p.date);
                return p.employeeId === emp.id && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
            });
            const totalPaid = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
            const salary = emp.salary || 0;
            const remaining = salary - totalPaid;

            return {
                ...emp,
                totalPaid,
                remaining,
            };
        });
    }, [employees, paymentRecords]);

    const handleOpenPaymentModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = (paymentType: 'Salário' | 'Vale', amount: number) => {
        if (!selectedEmployee) return;

        const newPayment = onAddPaymentRecord({
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.name,
            type: paymentType,
            amount: amount,
        });
        
        setIsPaymentModalOpen(false);
        setReceiptData({ payment: newPayment, employee: selectedEmployee });
    };

    const handleCloseReceipt = () => {
        setReceiptData(null);
        setSelectedEmployee(null);
    };

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Pagamento de Funcionários</h2>
                <p className="text-[var(--color-text-secondary)]">Gerencie salários e vales da sua equipe.</p>
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full text-sm text-left text-[var(--color-text-secondary)]">
                        <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                            <tr>
                                <th scope="col" className="px-6 py-3">Funcionário</th>
                                <th scope="col" className="px-6 py-3">Cargo</th>
                                <th scope="col" className="px-6 py-3 text-right">Salário Bruto</th>
                                <th scope="col" className="px-6 py-3 text-right">Vales/Adiantamentos (Mês)</th>
                                <th scope="col" className="px-6 py-3 text-right">Líquido a Pagar</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeePaymentData.length > 0 ? (
                                employeePaymentData.map(emp => (
                                    <tr key={emp.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                        <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{emp.name}</td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">{emp.role}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(emp.salary || 0)}</td>
                                        <td className="px-6 py-4 text-right text-[var(--color-warning-text)]">{formatCurrency(emp.totalPaid)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-[var(--color-success-text)]">{formatCurrency(emp.remaining)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenPaymentModal(emp)}
                                                disabled={(emp.salary || 0) <= emp.totalPaid}
                                                className="py-2 px-4 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition text-xs disabled:bg-[var(--color-bg-tertiary)] disabled:cursor-not-allowed"
                                            >
                                                Realizar Pagamento
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-12 text-[var(--color-text-secondary)]">Nenhum funcionário cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPaymentModalOpen && selectedEmployee && (
                <PaymentModal
                    employee={employeePaymentData.find(e => e.id === selectedEmployee.id)!}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleConfirmPayment}
                />
            )}
            
            {receiptData && (
                <PaymentReceiptModal
                    payment={receiptData.payment}
                    employee={receiptData.employee}
                    workshopProfile={workshopProfile}
                    onClose={handleCloseReceipt}
                />
            )}
        </>
    );
};

export default Payroll;
