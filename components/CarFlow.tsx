import React, { useState, useMemo } from 'react';
import type { Car } from '../types';
import { CarStatus } from '../types';
import AddCarModal from './AddCarModal';
import CarProgressCard from './CarProgressCard';
import CarDetailModal from './CompletedCarDetailModal';

interface CarFlowProps {
  cars: Car[];
  // FIX: Corrected the type for onAddCar to align with its implementation in App.tsx.
  // The function initializes workLog and accumulatedCost, so they should not be passed in.
  onAddCar: (newCar: Omit<Car, 'id' | 'status' | 'currentStage' | 'stageDetails' | 'workLog' | 'accumulatedCost'>) => void;
  onUpdateCar: (updatedCar: Car) => void;
  onRevertCarStage: (carId: string) => void;
}

const CarFlow: React.FC<CarFlowProps> = ({ cars, onAddCar, onUpdateCar, onRevertCarStage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CarStatus>(CarStatus.IN_PROGRESS);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  
  // State for date filtering
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  const TABS = [
    { name: 'Serviços em Andamento', status: CarStatus.IN_PROGRESS },
    { name: 'Serviços Prontos', status: CarStatus.COMPLETED },
    { name: 'Histórico de Serviços', status: CarStatus.HISTORY },
  ];
  
  const filteredCars = useMemo(() => {
    let carsToShow = cars.filter(car => {
      // History tab shows completed cars
      if (activeTab === CarStatus.HISTORY) {
        return car.status === CarStatus.COMPLETED;
      }
      return car.status === activeTab;
    });

    if (activeTab === CarStatus.HISTORY && filterType !== 'all') {
      const now = new Date();
      let startRange: Date;
      let endRange: Date;

      switch (filterType) {
        case 'today':
          startRange = new Date(now.setHours(0, 0, 0, 0));
          endRange = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'week':
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          startRange = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
          endRange = new Date(); // up to now
          break;
        case 'month':
          startRange = new Date(now.getFullYear(), now.getMonth(), 1);
          startRange.setHours(0, 0, 0, 0);
          endRange = new Date(); // up to now
          break;
        case 'year':
          startRange = new Date(now.getFullYear(), 0, 1);
          startRange.setHours(0, 0, 0, 0);
          endRange = new Date(); // up to now
          break;
        case 'custom':
          // For custom, we need to adjust for timezone and inclusivity
          startRange = startDate ? new Date(startDate + 'T00:00:00') : new Date('1970-01-01');
          endRange = endDate ? new Date(endDate + 'T23:59:59') : new Date();
          break;
        default:
          return carsToShow;
      }
      
      carsToShow = carsToShow.filter(car => {
        const carExitDate = new Date(car.exitDate);
        return carExitDate >= startRange && carExitDate <= endRange;
      });
    }

    return carsToShow;
  }, [cars, activeTab, filterType, startDate, endDate]);


  const handleCardClick = (car: Car) => {
    // Create a version of the car with cleared flags to pass to the modal
    const carAfterRead = { ...car, hasUnreadUpdate: false, hasProblemReport: false };
    
    // If there were notifications, persist the change by calling the update function
    if (car.hasUnreadUpdate || car.hasProblemReport) {
      onUpdateCar(carAfterRead);
    }
    
    // Open the modal with the "read" version of the car to provide immediate visual feedback
    setSelectedCar(carAfterRead);
  };
  
  const handleFilterChange = (type: typeof filterType) => {
    setFilterType(type);
    setStartDate('');
    setEndDate('');
  };

  const handleCustomDateChange = (start: string, end: string) => {
      setFilterType('custom');
      setStartDate(start);
      setEndDate(end);
  };

  const FilterButton: React.FC<{ type: typeof filterType, label: string }> = ({ type, label }) => (
      <button 
        onClick={() => handleFilterChange(type)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filterType === type && type !== 'custom' ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)]'}`}
      >
        {label}
      </button>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Fluxo de Carros</h2>
            <p className="text-[var(--color-text-secondary)]">Gerencie os veículos na oficina.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Adicionar Carro
        </button>
      </div>

      <div className="border-b border-[var(--color-border-primary)] mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {TABS.map(tab => (
                <button
                    key={tab.name}
                    onClick={() => { setActiveTab(tab.status); handleFilterChange('all'); }}
                    className={`${
                    activeTab === tab.status
                        ? 'border-[var(--color-text-accent)] text-[var(--color-text-accent)]'
                        : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-secondary)]'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                >
                    {tab.name}
                </button>
            ))}
        </nav>
      </div>

      {activeTab === CarStatus.HISTORY && (
        <div className="mb-6 p-4 bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[var(--color-text-secondary)] mr-2">Filtrar por:</span>
              <FilterButton type="all" label="Todos" />
              <FilterButton type="today" label="Hoje" />
              <FilterButton type="week" label="Semana" />
              <FilterButton type="month" label="Mês" />
              <FilterButton type="year" label="Ano" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <label htmlFor="startDate" className="text-xs text-[var(--color-text-secondary)]">De:</label>
                <input 
                    type="date" 
                    id="startDate"
                    value={startDate}
                    onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
                    className="bg-[var(--color-bg-tertiary)] border-[var(--color-border-secondary)] rounded-md p-1 text-xs focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] w-full text-[var(--color-text-primary)]"
                />
                 <label htmlFor="endDate" className="text-xs text-[var(--color-text-secondary)]">Até:</label>
                <input 
                    type="date" 
                    id="endDate"
                    value={endDate}
                    onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
                    className="bg-[var(--color-bg-tertiary)] border-[var(--color-border-secondary)] rounded-md p-1 text-xs focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] w-full text-[var(--color-text-primary)]"
                />
            </div>
        </div>
      )}
      
      <div className="space-y-6">
        {filteredCars.length > 0 ? (
            filteredCars.map(car => (
                <CarProgressCard 
                    key={car.id} 
                    car={car} 
                    onUpdate={onUpdateCar} 
                    onCardClick={handleCardClick}
                    onRevertStage={onRevertCarStage}
                />
            ))
        ) : (
            <div className="text-center py-12 bg-[var(--color-bg-secondary)]/50 border border-dashed border-[var(--color-border-primary)] rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">Nenhum carro nesta seção</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {activeTab === CarStatus.HISTORY ? 'Nenhum carro encontrado para o período selecionado.' : 'Adicione um novo carro para começar.'}
                </p>
            </div>
        )}
      </div>

      {isModalOpen && (
        <AddCarModal
          onClose={() => setIsModalOpen(false)}
          onAddCar={onAddCar}
        />
      )}

      {selectedCar && (
        <CarDetailModal 
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
        />
      )}
    </>
  );
};

export default CarFlow;
