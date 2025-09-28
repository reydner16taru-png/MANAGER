import React, { useRef } from 'react';
import type { Car } from '../types';
import { ServiceStage, CarStatus } from '../types';

interface CarProgressCardProps {
  car: Car;
  onUpdate: (car: Car) => void;
  onCardClick: (car: Car) => void;
  onRevertStage: (carId: string) => void;
}

const STAGES_ORDER = [
  ServiceStage.DISASSEMBLY,
  ServiceStage.REPAIR,
  ServiceStage.SANDING,
  ServiceStage.PAINTING,
  ServiceStage.POLISHING,
  ServiceStage.WASHING,
];

const CarProgressCard: React.FC<CarProgressCardProps> = ({ car, onUpdate, onCardClick, onRevertStage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentStageIndex = STAGES_ORDER.indexOf(car.currentStage);

  const handleCompleteStage = () => {
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex < STAGES_ORDER.length) {
      const nextStage = STAGES_ORDER[nextStageIndex];
      onUpdate({ ...car, currentStage: nextStage });
    } else {
      // Last stage completed
      onUpdate({ ...car, status: CarStatus.COMPLETED });
    }
  };

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      const currentStageDetails = car.stageDetails[car.currentStage] || { photos: [], expenses: 0 };
      
      const updatedStageDetails = {
        ...car.stageDetails,
        [car.currentStage]: {
          ...currentStageDetails,
          photos: [...currentStageDetails.photos, ...newFiles],
        },
      };
      onUpdate({ ...car, stageDetails: updatedStageDetails });
      alert(`${newFiles.length} foto(s) adicionada(s) à etapa ${car.currentStage}.`);
    }
  };

  return (
    <div 
        className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[var(--color-accent-primary)]/50 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col md:flex-row cursor-pointer"
        onClick={() => onCardClick(car)}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Image Section */}
      <div className="md:w-48 flex-shrink-0 bg-[var(--color-bg-tertiary)]/50 flex items-center justify-center">
        {car.images && car.images.length > 0 ? (
            <img src={URL.createObjectURL(car.images[0])} alt={`${car.brand} ${car.model}`} className="w-full h-48 md:h-full object-cover" />
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )}
      </div>

      {/* Details and Progress Section */}
      <div className="flex-grow flex flex-col">
        <header className="relative p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-grow">
            {car.hasProblemReport && (
                <span className="absolute top-4 right-4 flex h-3 w-3" title="Problema relatado">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
            {!car.hasProblemReport && car.hasUnreadUpdate && (
                <span className="absolute top-4 right-4 flex h-3 w-3" title="Etapa concluída">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            )}
            <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{car.brand} {car.model} <span className="text-[var(--color-text-secondary)] font-normal">({car.year})</span></h3>
            <p className="text-sm text-[var(--color-text-accent)] font-mono bg-[var(--color-bg-tertiary)]/50 px-2 py-1 rounded-md inline-block mt-1">{car.plate}</p>
            </div>
            <div className="text-left sm:text-right">
                <p className="text-sm text-[var(--color-text-secondary)]">{car.customer}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Previsão de Saída: {new Date(car.exitDate).toLocaleDateString()}</p>
            </div>
        </header>

        <div className="p-6">
            <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-[var(--color-bg-tertiary)]" style={{transform: 'translateY(-50%)'}}></div>
            <div
                className="absolute left-0 top-1/2 h-0.5 bg-[var(--color-accent-primary)] transition-all duration-500"
                style={{ width: `${(currentStageIndex / (STAGES_ORDER.length - 1)) * 100}%`, transform: 'translateY(-50%)' }}
            ></div>
            
            <ol className="relative flex justify-between items-start">
                {STAGES_ORDER.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isActive = index === currentStageIndex;
                
                return (
                    <li key={stage} className="text-center flex-1">
                    <div className="flex flex-col items-center">
                        <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                            ${isCompleted ? 'bg-[var(--color-accent-primary)]' : ''}
                            ${isActive ? 'bg-[var(--color-accent-secondary)] ring-4 ring-[var(--color-accent-secondary)]/30' : ''}
                            ${!isCompleted && !isActive ? 'bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border-secondary)]' : ''}
                        `}
                        >
                        {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                        <p className={`mt-3 text-xs font-medium ${isActive ? 'text-[var(--color-text-accent)]' : 'text-[var(--color-text-secondary)]'}`}>
                        {stage}
                        </p>
                    </div>
                    </li>
                );
                })}
            </ol>
            </div>

            {car.status === CarStatus.IN_PROGRESS && (
                <div className="mt-8 pt-6 border-t border-[var(--color-border-primary)] text-center">
                    <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">Próxima Etapa: <span className="text-[var(--color-text-accent)]">{car.currentStage}</span></h4>
                    <div className="my-3 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]/50 inline-block px-3 py-1 rounded-full">
                        <span>Fotos: {car.stageDetails[car.currentStage]?.photos.length || 0}</span>
                    </div>
                    <div className="mt-2 flex justify-center items-center gap-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRevertStage(car.id); }}
                            disabled={currentStageIndex === 0}
                            className="text-xs py-2 px-3 rounded-md bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={currentStageIndex === 0 ? "Não é possível reverter a primeira etapa" : "Voltar para a etapa anterior"}
                        >
                            Voltar Etapa
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleAddPhotosClick(); }} className="text-xs py-2 px-3 rounded-md bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Adicionar Fotos</button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCompleteStage(); }}
                            className="py-2 px-6 rounded-lg font-semibold text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition transform hover:scale-105"
                        >
                            Concluir Etapa
                        </button>
                    </div>
                </div>
            )}
            {car.status === CarStatus.COMPLETED && (
                <div className="mt-8 pt-6 border-t border-[var(--color-border-primary)] text-center">
                    <h4 className="text-lg font-semibold text-[var(--color-success-text)] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Serviço Concluído
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Clique para ver o resumo financeiro e histórico.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CarProgressCard;
