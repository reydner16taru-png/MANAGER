import React, { useRef, useState } from 'react';
import type { Car, WorkshopProfile, IssuedInvoice } from '../types';
import InvoicePDFLayout from './InvoicePDFLayout';

declare const html2canvas: any;
declare const jspdf: any;

interface InvoicePreviewModalProps {
    car: Car;
    workshopProfile: WorkshopProfile;
    includeMaterials: boolean;
    onClose: () => void;
    onIssueInvoice: (invoiceData: Omit<IssuedInvoice, 'id' | 'dateIssued'>) => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ car, workshopProfile, includeMaterials, onClose, onIssueInvoice }) => {
    const pdfRef = useRef<HTMLDivElement>(null);
    const [invoiceIssued, setInvoiceIssued] = useState(false);

    const triggerIssueEvent = async () => {
        if (!invoiceIssued && pdfRef.current) {
            try {
                const canvas = await html2canvas(pdfRef.current, { scale: 2 });
                const imageBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]; // Use JPEG for smaller file size

                onIssueInvoice({
                    carId: car.id,
                    carPlate: car.plate,
                    customerName: car.customer,
                    totalValue: car.serviceValue,
                    type: 'income',
                    invoiceImage: imageBase64,
                });
                setInvoiceIssued(true);
            } catch (error) {
                console.error("Erro ao gerar a imagem da nota fiscal:", error);
                // Fallback to issuing without image if canvas fails
                 onIssueInvoice({
                    carId: car.id,
                    carPlate: car.plate,
                    customerName: car.customer,
                    totalValue: car.serviceValue,
                    type: 'income',
                });
                setInvoiceIssued(true);
            }
        }
    };

    const handleDownloadPdf = async () => {
        await triggerIssueEvent();
        if (!pdfRef.current) return;
        const { jsPDF } = jspdf;
        html2canvas(pdfRef.current, { scale: 2 })
            .then((canvas: HTMLCanvasElement) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`NotaFiscal-${car.customer.split('/')[0].trim().replace(/\s/g, '_')}-${car.plate}.pdf`);
            });
    };

    const handleSendEmail = async () => {
        await triggerIssueEvent();
        const subject = `Nota Fiscal de Serviço - ${workshopProfile.name} - ${car.brand} ${car.model}`;
        const body = `Olá, ${car.customer.split('/')[0].trim()}!\n\nSegue em anexo a nota fiscal referente ao serviço no veículo ${car.brand} ${car.model}, placa ${car.plate}.\n\nAgradecemos a preferência!\n\nAtenciosamente,\nEquipe ${workshopProfile.name}`;
        const mailtoLink = `mailto:${car.customer.split('/')[1]?.trim() || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    };

    const handlePrint = async () => {
        await triggerIssueEvent();
        const content = pdfRef.current;
        if (!content) return;
    
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Imprimir Nota Fiscal</title>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(content.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4" aria-modal="true" role="dialog">
            <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)]">
                <header className="p-4 border-b border-[var(--color-border-primary)] flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pré-visualização da Nota Fiscal</h2>
                     <button type="button" onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-2xl leading-none">&times;</button>
                </header>

                <main className="flex-grow overflow-y-auto bg-gray-300 p-8">
                   <div className="mx-auto" style={{ width: '210mm' }}>
                        <InvoicePDFLayout ref={pdfRef} car={car} workshopProfile={workshopProfile} includeMaterials={includeMaterials} />
                   </div>
                </main>
                
                <footer className="p-4 bg-[var(--color-bg-primary)] border-t border-[var(--color-border-primary)] flex flex-col sm:flex-row justify-end items-center gap-4 flex-shrink-0">
                     <button onClick={handlePrint} className="action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clipRule="evenodd" /></svg>
                        Imprimir
                     </button>
                     <button onClick={handleSendEmail} className="action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        Enviar por E-mail
                     </button>
                     <button onClick={handleDownloadPdf} className="action-button bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        Salvar PDF
                     </button>
                </footer>
                 <style>{`
                    .action-button { display: inline-flex; items-center; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; background-color: var(--color-bg-tertiary); color: var(--color-text-primary); transition: background-color 0.2s; }
                    .action-button:hover { background-color: var(--color-bg-tertiary-hover); }
                 `}</style>
            </div>
        </div>
    );
};

export default InvoicePreviewModal;
