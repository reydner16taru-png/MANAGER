
import React, { forwardRef } from 'react';
import type { PaymentRecord, Employee, WorkshopProfile } from '../types';

interface PaymentReceiptLayoutProps {
    payment: PaymentRecord;
    employee: Employee;
    workshopProfile: WorkshopProfile;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PaymentReceiptLayout = forwardRef<HTMLDivElement, PaymentReceiptLayoutProps>(({ payment, employee, workshopProfile }, ref) => {
    
    return (
        <div ref={ref} style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: 'white', padding: '40px', width: '100%', border: '1px solid #ddd' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '20px', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: 0 }}>{workshopProfile.name}</h1>
                    <p style={{ color: '#666', marginTop: '4px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                        {workshopProfile.address}\nCNPJ/CPF: {workshopProfile.taxId}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>RECIBO DE PAGAMENTO</p>
                    <p style={{ margin: '4px 0 0 0' }}>Data: {new Date(payment.date).toLocaleDateString()}</p>
                </div>
            </header>

            {/* Body */}
            <section style={{ fontSize: '16px', lineHeight: '1.8' }}>
                <p>
                    Recebi de <strong>{workshopProfile.name}</strong>,
                    CNPJ/CPF nº <strong>{workshopProfile.taxId}</strong>, a importância de{' '}
                    <strong style={{ fontSize: '18px', color: '#0891b2' }}>{formatCurrency(payment.amount)}</strong>,
                    referente ao pagamento de <strong>{payment.type}</strong>.
                </p>
                <p>
                    Este pagamento é destinado a <strong>{employee.name}</strong>,
                    portador do cargo de <strong>{employee.role}</strong>.
                </p>
                <p>
                    Para clareza, firmo o presente recibo, dando plena e geral quitação pelo valor recebido.
                </p>
            </section>

            {/* Footer / Signature */}
            <footer style={{ marginTop: '80px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '300px', borderTop: '1px solid #333', paddingTop: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>{employee.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Assinatura do Funcionário</p>
                </div>
            </footer>
        </div>
    );
});

export default PaymentReceiptLayout;
