import React, { forwardRef } from 'react';
import type { Budget, WorkshopProfile } from '../types';

interface BudgetPDFLayoutProps {
    budget: Budget;
    workshopProfile: WorkshopProfile;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const BudgetPDFLayout = forwardRef<HTMLDivElement, BudgetPDFLayoutProps>(({ budget, workshopProfile }, ref) => {
    
    return (
        <div ref={ref} style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: 'white', padding: '40px', width: '100%' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0891b2', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {workshopProfile.logo && (
                        <img src={workshopProfile.logo} alt="Logo da Oficina" style={{ height: '60px', width: 'auto', marginRight: '20px', objectFit: 'contain' }} />
                    )}
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0891b2', margin: 0 }}>{workshopProfile.name}</h1>
                        <p style={{ color: '#666', marginTop: '4px', fontSize: '12px' }}>
                            {workshopProfile.address} <br/>
                            {workshopProfile.phone} | {workshopProfile.email} <br />
                            CNPJ/CPF: {workshopProfile.taxId}
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>Orçamento #{budget.id.substring(0, 8)}</p>
                    <p style={{ color: '#666', margin: 0 }}>Data: {new Date(budget.creationDate).toLocaleDateString()}</p>
                </div>
            </header>

            {/* Customer & Vehicle Info */}
            <section style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '14px' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>CLIENTE</h2>
                    <p style={{ margin: '4px 0' }}><strong>Nome:</strong> {budget.customerName}</p>
                    <p style={{ margin: '4px 0' }}><strong>Telefone:</strong> {budget.customerPhone}</p>
                    <p style={{ margin: '4px 0' }}><strong>Email:</strong> {budget.customerEmail}</p>
                </div>
                <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>VEÍCULO</h2>
                    <p style={{ margin: '4px 0' }}><strong>Marca/Modelo:</strong> {budget.vehicleBrand} {budget.vehicleModel}</p>
                    <p style={{ margin: '4px 0' }}><strong>Ano:</strong> {budget.vehicleYear}</p>
                    <p style={{ margin: '4px 0' }}><strong>Placa:</strong> {budget.vehiclePlate}</p>
                </div>
            </section>

            {/* Vehicle Photos */}
            {budget.images && budget.images.length > 0 && (
                <section style={{ marginTop: '30px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>FOTOS DO VEÍCULO</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {budget.images.map((imgSrc, index) => (
                            <img
                                key={index}
                                src={imgSrc}
                                style={{ width: '150px', height: 'auto', border: '1px solid #eee', borderRadius: '4px' }}
                                alt={`Veículo ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Services Table */}
            <section style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '10px' }}>SERVIÇOS</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Descrição</th>
                            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budget.services.map(service => (
                            <tr key={service.id}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{service.description}</td>
                                <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{formatCurrency(service.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Total */}
            <footer style={{ marginTop: '40px', textAlign: 'right', borderTop: '2px solid #0891b2', paddingTop: '20px' }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>VALOR TOTAL DO ORÇAMENTO</p>
                <p style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{formatCurrency(budget.totalValue)}</p>
            </footer>

        </div>
    );
});

export default BudgetPDFLayout;