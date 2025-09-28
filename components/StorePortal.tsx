

import React, { useState, useMemo } from 'react';
import type { Employee, Car, StockItem, Notification } from '../types';
import { ServiceStage, CarStatus } from '../types';
import WorkInProgressModal from './WorkInProgressModal';
import ReportProblemModal from './ReportProblemModal';

interface StorePortalProps {
  user: Employee;
  onLogout: () => void;
  cars: Car[];
  onUpdateCar: (updatedCar: Car) => void;
  onStageComplete: (updatedCar: Car, materialsToDeduct: { name: string; quantity: number; unit: string }[]) => void;
  employees: Employee[];
  stock: StockItem[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  onReportProblem: (reporterId: string, password: string, description: string) => boolean;
}

const STAGES_ORDER = [
  ServiceStage.DISASSEMBLY,
  ServiceStage.REPAIR,
  ServiceStage.SANDING,
  ServiceStage.PAINTING,
  ServiceStage.POLISHING,
  ServiceStage.WASHING,
];

const StorePortal: React.FC<StorePortalProps> = ({ user, onLogout, cars, onUpdateCar, onStageComplete, employees, stock, addNotification, onReportProblem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<ServiceStage | 'all'>('all');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

  const inProgressCars = useMemo(() => {
    return cars
      .filter(car => car.status === CarStatus.IN_PROGRESS)
      .filter(car => 
        car.plate.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(car =>
        stageFilter === 'all' || car.currentStage === stageFilter
      );
  }, [cars, searchTerm, stageFilter]);

  return (
    <>
      <div className="min-h-screen w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col font-sans">
        {/* Header */}
        <header className="bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm border-b border-[var(--color-border-primary)] p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Portal Loja
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
                Conectado como <span className="font-semibold text-[var(--color-text-accent)]">{user.name}</span> (<span className="font-semibold text-[var(--color-text-accent)]">{user.role}</span>)
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={() => setIsProblemModalOpen(true)}
              className="flex items-center bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 font-bold py-2 px-4 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Relatar Problema
            </button>
            <button
              onClick={onLogout}
              className="flex items-center bg-red-600/20 hover:bg-red-600/40 text-red-300 font-bold py-2 px-4 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
              Sair
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Carros em Andamento</h2>
            </div>

            {/* Filters */}
            <div className="mb-8 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:w-1/3">
                  <input 
                      type="text"
                      placeholder="Pesquisar por placa..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-[var(--color-bg-tertiary)] border-[var(--color-border-secondary)] rounded-md py-2 pl-10 pr-4 text-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)]"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                </div>
                <div className="flex-grow flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)] mr-2 flex-shrink-0">Filtrar por Etapa:</span>
                  <button onClick={() => setStageFilter('all')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex-shrink-0 ${stageFilter === 'all' ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)]'}`}>Todos</button>
                  {STAGES_ORDER.map(stage => (
                    <button key={stage} onClick={() => setStageFilter(stage)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex-shrink-0 ${stageFilter === stage ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)]'}`}>{stage}</button>
                  ))}
                </div>
            </div>

            {/* Car Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {inProgressCars.length > 0 ? (
                  inProgressCars.map(car => (
                    <div key={car.id} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl flex flex-col transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer" onClick={() => setSelectedCar(car)}>
                      <div className="h-40 bg-[var(--color-bg-tertiary)] flex items-center justify-center rounded-t-xl overflow-hidden">
                        {car.images && car.images.length > 0 ? (
                           <img src={URL.createObjectURL(car.images[0])} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <div className="p-5 flex-grow flex flex-col">
                          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{car.brand} {car.model}</h3>
                          <p className="text-sm text-[var(--color-text-accent)] font-mono bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md inline-block mt-1 mb-3 self-start">{car.plate}</p>
                          
                          <div className="text-xs text-[var(--color-text-primary)] space-y-2 mb-4 flex-grow">
                              <p><span className="font-semibold text-[var(--color-text-secondary)] w-28 inline-block">Cliente:</span> {car.customer.split('/')[0]}</p>
                              <p><span className="font-semibold text-[var(--color-text-secondary)] w-28 inline-block">Etapa Atual:</span> <span className="font-bold text-blue-400">{car.currentStage}</span></p>
                              <p><span className="font-semibold text-[var(--color-text-secondary)] w-28 inline-block">Previsão Saída:</span> {new Date(car.exitDate).toLocaleDateString()}</p>
                          </div>

                          <button 
                            className="w-full mt-auto bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold py-2.5 px-4 rounded-lg transition transform hover:scale-105"
                            onClick={(e) => { e.stopPropagation(); setSelectedCar(car); }}
                           >
                            Iniciar / Selecionar
                          </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border-primary)] rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">Nenhum carro encontrado</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Ajuste os filtros ou verifique se há carros em andamento.</p>
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>

      {selectedCar && (
        <WorkInProgressModal 
            user={user}
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
            onUpdateCar={(updatedCar) => {
                onUpdateCar(updatedCar);
                setSelectedCar(updatedCar);
            }}
            onStageComplete={(updatedCar, materialsToDeduct) => {
                onStageComplete(updatedCar, materialsToDeduct);
                // Also update the car in the modal's view immediately
                setSelectedCar(updatedCar);
            }}
            employees={employees}
            stock={stock}
        />
      )}

      {isProblemModalOpen && (
        <ReportProblemModal
            employees={employees}
            onClose={() => setIsProblemModalOpen(false)}
            onConfirm={onReportProblem}
        />
      )}
    </>
  );
};

export default StorePortal;