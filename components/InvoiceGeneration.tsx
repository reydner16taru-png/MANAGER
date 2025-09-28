import React, { useState, useMemo } from 'react';
import type { Car, WorkshopProfile, IssuedInvoice } from '../types';
import { CarStatus } from '../types';
import InvoiceOptionsModal from './InvoiceOptionsModal';
import InvoicePreviewModal from './InvoicePreviewModal';

interface InvoiceGenerationProps {
    cars: Car[];
    workshopProfile: WorkshopProfile;
    onIssueInvoice: (invoiceData: Omit<IssuedInvoice, 'id' | 'dateIssued'>) => void;
}

const InvoiceGeneration: React.FC<InvoiceGenerationProps> = ({ cars, workshopProfile, onIssueInvoice }) => {
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [includeMaterials, setIncludeMaterials] = useState(false);

    const completedCars = useMemo(() => {
        return cars.filter(car => car.status === CarStatus.COMPLETED || car.status === CarStatus.HISTORY);
    }, [cars]);

    const handleStartIssuing = (car: Car) => {
        setSelectedCar(car);
        setIsOptionsModalOpen(true);
    };

    const handleOptionSelect = (shouldIncludeMaterials: boolean) => {
        setIncludeMaterials(shouldIncludeMaterials);
        setIsOptionsModalOpen(false);
        setIsPreviewModalOpen(true);
    };

    const closeAllModals = () => {
        setSelectedCar(null);
        setIsOptionsModalOpen(false);
        setIsPreviewModalOpen(false);
    };

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Emitir Nota Fiscal</h2>
                <p className="text-[var(--color-text-secondary)]">Selecione um serviço concluído para gerar a nota fiscal.</p>
            </div>

            <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full text-sm text-left text-[var(--color-text-secondary)]">
                  <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)]">
                    <tr>
                      <th scope="col" className="px-6 py-3">Veículo</th>
                      <th scope="col" className="px-6 py-3">Cliente</th>
                      <th scope="col" className="px-6 py-3">Data de Conclusão</th>
                      <th scope="col" className="px-6 py-3 text-right">Valor Total</th>
                      <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                      {completedCars.length > 0 ? (
                          completedCars.map(car => (
                              <tr key={car.id} className="border-b border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)]/50">
                                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{car.brand} {car.model} ({car.plate})</td>
                                  <td className="px-6 py-4">{car.customer.split('/')[0]}</td>
                                  <td className="px-6 py-4">{new Date(car.exitDate).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 text-right font-semibold">{car.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                  <td className="px-6 py-4 text-center">
                                      <button
                                        onClick={() => handleStartIssuing(car)}
                                        className="py-2 px-4 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition text-xs"
                                      >
                                          Emitir Nota
                                      </button>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={5} className="text-center py-12 text-[var(--color-text-secondary)]">Nenhum serviço concluído para faturamento.</td></tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {isOptionsModalOpen && selectedCar && (
                <InvoiceOptionsModal
                    onClose={closeAllModals}
                    onSelect={handleOptionSelect}
                />
            )}

            {isPreviewModalOpen && selectedCar && (
                <InvoicePreviewModal
                    car={selectedCar}
                    workshopProfile={workshopProfile}
                    includeMaterials={includeMaterials}
                    onClose={closeAllModals}
                    onIssueInvoice={onIssueInvoice}
                />
            )}
        </>
    );
};

export default InvoiceGeneration;
