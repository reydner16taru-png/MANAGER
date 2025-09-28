import React, { useRef } from 'react';
import type { PaymentRecord, Employee, WorkshopProfile } from '../types';
import PaymentReceiptLayout from './PaymentReceiptLayout';

declare const html2canvas: any;
declare const jspdf: any;

interface PaymentReceiptModalProps {
    payment: PaymentRecord;
    employee: Employee;
    workshopProfile: WorkshopProfile;
    onClose: () => void;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ payment, employee, workshopProfile, onClose }) => {
    const pdfRef = useRef<HTMLDivElement>(null);

     const handleDownloadPdf = () => {
        if (!pdfRef.current) return;
        const { jsPDF } = jspdf;
        html2canvas(pdfRef.current, { scale: 2 })
            .then((canvas: HTMLCanvasElement) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Recibo_${payment.type}_${employee.name.replace(/\s/g, '_')}.pdf`);
            });
    };

    const handleSendEmail = () => {
        // This is a placeholder as employee email is not stored. It would need to be added to the Employee type.
        const employeeEmail = "email_do_funcionario@example.com";
        const subject = `Comprovante de Pagamento - ${workshopProfile.name}`;
        const body = `Olá, ${employee.name}!\n\nSegue em anexo seu comprovante de pagamento de ${payment.type} no valor de ${payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.\n\nAtenciosamente,\nEquipe ${workshopProfile.name}`;
        const mailtoLink = `mailto:${employeeEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    };

    const handlePrint = () => {
        const content = pdfRef.current;
        if (!content) return;
    
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Imprimir Recibo</title>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(content.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[70] p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)]">
                <header className="p-4 border-b border-[var(--color-border-primary)] flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Recibo de Pagamento Gerado</h2>
                     <button type="button" onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button>
                </header>

                <main className="flex-grow overflow-y-auto bg-gray-300 p-8">
                   <div className="mx-auto" style={{ width: '210mm' }}>
                        <PaymentReceiptLayout ref={pdfRef} payment={payment} employee={employee} workshopProfile={workshopProfile} />
                   </div>
                </main>
                
                <footer className="p-4 bg-[var(--color-bg-primary)] border-t border-[var(--color-border-primary)] flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                    <p className="text-sm text-[var(--color-text-secondary)]">Recibo gerado com sucesso!</p>
                    <div className="flex items-center gap-4">
                         <button onClick={handlePrint} className="action-button">Imprimir</button>
                         <button onClick={handleSendEmail} className="action-button">Enviar por E-mail</button>
                         <button onClick={handleDownloadPdf} className="action-button bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white">Salvar PDF</button>
                         <button onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Fechar</button>
                    </div>
                </footer>
                 <style>{`
                    .action-button { display: inline-flex; items-center; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; background-color: var(--color-bg-tertiary); color: var(--color-text-primary); transition: background-color 0.2s; }
                    .action-button:hover { background-color: var(--color-bg-tertiary-hover); }
                 `}</style>
            </div>
        </div>
    );
};

export default PaymentReceiptModal;
