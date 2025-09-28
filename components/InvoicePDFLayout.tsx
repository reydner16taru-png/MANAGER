
import React, { forwardRef, useMemo } from 'react';
import type { Car, WorkshopProfile } from '../types';

interface InvoicePDFLayoutProps {
    car: Car;
    workshopProfile: WorkshopProfile;
    includeMaterials: boolean;
}

type AggregatedMaterial = {
    name: string;
    quantity: string;
};

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const InvoicePDFLayout = forwardRef<HTMLDivElement, InvoicePDFLayoutProps>(({ car, workshopProfile, includeMaterials }, ref) => {
    
    const aggregatedMaterials = useMemo((): AggregatedMaterial[] => {
        if (!includeMaterials) return [];
        
        const allMaterials = car.workLog.flatMap(log => log.materialsUsed || []);
        // Simple aggregation for display, not summing quantities of different units
        return allMaterials.map(mat => ({ name: mat.name, quantity: String(mat.quantity) }));

    }, [car, includeMaterials]);

    const laborValue = car.serviceValue - car.accumulatedCost;

    return (
        <div ref={ref} className="invoice-container" style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: 'white', padding: '40px', width: '100%' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0891b2', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {workshopProfile.logo && (
                        <img src={workshopProfile.logo} alt="Logo da Oficina" style={{ height: '60px', width: 'auto', marginRight: '20px', objectFit: 'contain' }} />
                    )}
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0891b2', margin: 0 }}>{workshopProfile.name}</h1>
                        <p style={{ color: '#666', marginTop: '4px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                            {workshopProfile.address}\n{workshopProfile.phone} | {workshopProfile.email}\nCNPJ/CPF: {workshopProfile.taxId}
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.25rem', margin: '0 0 8px 0' }}>NOTA FISCAL DE SERVIÇO</p>
                    <p style={{ margin: 0 }}><strong>Nº:</strong> {car.id.substring(0, 8).toUpperCase()}</p>
                    <p style={{ color: '#666', margin: 0 }}><strong>Data de Emissão:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </header>

            {/* Customer & Vehicle Info */}
            <section style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '14px' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>CLIENTE</h2>
                    <p style={{ margin: '4px 0' }}><strong>Nome:</strong> {car.customer.split('/')[0].trim()}</p>
                    <p style={{ margin: '4px 0' }}><strong>Telefone:</strong> {car.customer.split('/')[1]?.trim()}</p>
                </div>
                <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>VEÍCULO</h2>
                    <p style={{ margin: '4px 0' }}><strong>Marca/Modelo:</strong> {car.brand} {car.model}</p>
                    <p style={{ margin: '4px 0' }}><strong>Ano:</strong> {car.year}</p>
                    <p style={{ margin: '4px 0' }}><strong>Placa:</strong> {car.plate}</p>
                </div>
            </section>

             {/* Services Table */}
            <section style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>DESCRIÇÃO DOS SERVIÇOS</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Descrição</th>
                            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {includeMaterials ? (
                            <>
                                <tr>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Mão de Obra e Serviços Gerais</td>
                                    <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{formatCurrency(laborValue)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                        Peças e Materiais Utilizados
                                        <div style={{ fontSize: '12px', color: '#666', paddingLeft: '15px' }}>
                                            {aggregatedMaterials.map((mat, i) => <div key={i}>- {mat.name} ({mat.quantity})</div>)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee', verticalAlign: 'top' }}>{formatCurrency(car.accumulatedCost)}</td>
                                </tr>
                            </>
                        ) : (
                             <tr>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{car.description}</td>
                                <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{formatCurrency(car.serviceValue)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

             {/* Total */}
            <footer style={{ marginTop: '40px', textAlign: 'right', borderTop: '2px solid #0891b2', paddingTop: '20px' }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>VALOR TOTAL</p>
                <p style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{formatCurrency(car.serviceValue)}</p>
            </footer>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .invoice-container, .invoice-container * {
                        visibility: visible;
                    }
                    .invoice-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>

        </div>
    );
});

export default InvoicePDFLayout;
