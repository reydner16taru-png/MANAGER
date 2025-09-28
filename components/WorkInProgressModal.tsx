
import React, { useState, useRef, useMemo } from 'react';
import type { Car, WorkLog, Employee, StageDetail, StockItem } from '../types';
import { ServiceStage, CarStatus, EmployeeRole } from '../types';
import CompleteStageModal from './CompleteStageModal';

const STAGES_ORDER = [
  ServiceStage.DISASSEMBLY, ServiceStage.REPAIR, ServiceStage.SANDING,
  ServiceStage.PAINTING, ServiceStage.POLISHING, ServiceStage.WASHING,
];

interface WorkInProgressModalProps {
  car: Car;
  onClose: () => void;
  onUpdateCar: (updatedCar: Car) => void;
  onStageComplete: (updatedCar: Car, materialsToDeduct: { name: string; quantity: number; unit: string }[]) => void;
  employees: Employee[];
  stock: StockItem[];
  user: Employee;
}

const WorkInProgressModal: React.FC<WorkInProgressModalProps> = ({ car, onClose, onUpdateCar, onStageComplete, employees, stock, user }) => {
    const [isReportingProblem, setIsReportingProblem] = useState(false);
    const [problemNotes, setProblemNotes] = useState('');
    const [isCompletingStage, setIsCompletingStage] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const currentStageIndex = STAGES_ORDER.indexOf(car.currentStage);
    const isLastStage = currentStageIndex === STAGES_ORDER.length - 1;
    const managerIsPresent = employees.some(e => e.role === EmployeeRole.GERENTE); // Placeholder for authorization

    const allPhotos = useMemo(() => {
        const photos: { url: string; stage: ServiceStage | 'Entrada' }[] = car.images.map(file => ({
            url: URL.createObjectURL(file),
            stage: 'Entrada'
        }));
        
        Object.entries(car.stageDetails).forEach(([stage, details]) => {
            (details as StageDetail).photos.forEach(file => {
                photos.push({
                    url: URL.createObjectURL(file),
                    stage: stage as ServiceStage
                });
            });
        });
        return photos;
    }, [car]);

    const handleAddPhotoClick = () => photoInputRef.current?.click();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const currentDetails = car.stageDetails[car.currentStage];
            const updatedCar = {
                ...car,
                stageDetails: {
                    ...car.stageDetails,
                    [car.currentStage]: {
                        ...currentDetails,
                        photos: [...currentDetails.photos, ...newFiles]
                    }
                }
            };
            onUpdateCar(updatedCar);
        }
    };
    
    const handleSaveProblemReport = () => {
        if (!problemNotes.trim()) return;
        const newLog: WorkLog = {
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            stage: car.currentStage,
            employeeName: user.name,
            notes: `PROBLEMA: ${problemNotes}`
        };
        onUpdateCar({ ...car, workLog: [...car.workLog, newLog], hasProblemReport: true });
        setProblemNotes('');
        setIsReportingProblem(false);
    };

    const handleCompleteStageConfirm = (data: { employee: Employee; photos: File[]; comments: string; cost: number; materialsUsed: any[]; stageSpecificData: any; }) => {
        const { employee, photos, comments, cost, materialsUsed, stageSpecificData } = data;
        
        const newLog: WorkLog = {
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            stage: car.currentStage,
            employeeName: employee.name,
            notes: comments,
            photos,
            cost,
            materialsUsed: materialsUsed.map(m => ({ name: m.name, quantity: `${m.quantity} ${m.unit}`})), // for display
        };

        let extraLogs: WorkLog[] = [];
        let hasNewProblem = false;
        // FIX: In `handleCompleteStageConfirm`, replaced undefined variable `stageName` with `car.currentStage` to correctly check the car's current service stage.
        if (car.currentStage === ServiceStage.DISASSEMBLY && stageSpecificData.hasBrokenPart && stageSpecificData.details.name) {
            const problemLog: WorkLog = {
                id: new Date().toISOString() + '-problem',
                timestamp: new Date().toISOString(),
                stage: car.currentStage,
                employeeName: employee.name,
                notes: `PROBLEMA: Peça quebrada - ${stageSpecificData.details.name}. Custo estimado: ${stageSpecificData.details.cost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`,
                resolved: false,
            };
            extraLogs.push(problemLog);
            hasNewProblem = true;
        }

        const currentDetails = car.stageDetails[car.currentStage];
        const updatedStageDetails = {
            ...car.stageDetails,
            [car.currentStage]: {
                photos: [...currentDetails.photos, ...photos],
                expenses: currentDetails.expenses + cost,
                details: stageSpecificData,
            }
        };
        
        let updatedCar: Car;
        const newAccumulatedCost = car.accumulatedCost + cost;
        const finalWorkLog = [...car.workLog, newLog, ...extraLogs];

        if (!isLastStage) {
            updatedCar = { 
                ...car, 
                currentStage: STAGES_ORDER[currentStageIndex + 1], 
                workLog: finalWorkLog,
                stageDetails: updatedStageDetails,
                accumulatedCost: newAccumulatedCost,
                hasProblemReport: car.hasProblemReport || hasNewProblem,
            };
        } else {
            updatedCar = { 
                ...car, 
                status: CarStatus.COMPLETED, 
                exitDate: new Date().toISOString().split('T')[0], 
                workLog: finalWorkLog,
                stageDetails: updatedStageDetails,
                accumulatedCost: newAccumulatedCost,
                hasProblemReport: car.hasProblemReport || hasNewProblem,
            };
        }
        
        onStageComplete(updatedCar, materialsUsed);

        setIsCompletingStage(false);
        if (updatedCar.status === CarStatus.COMPLETED) onClose(); // Close main modal if service is finished
    };


    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 p-2 sm:p-4" aria-modal="true" role="dialog">
                <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-slate-700 mx-2">
                    <input type="file" multiple ref={photoInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                    <header className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-white">{car.brand} {car.model} ({car.plate})</h2>
                            <p className="text-xs sm:text-sm text-slate-400">Cliente: {car.customer}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition text-2xl leading-none">&times;</button>
                    </header>
                    <main className="flex-grow overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Progress & Actions */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Photo Gallery */}
                            <div>
                                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Fotos</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                {allPhotos.length > 0 ? allPhotos.map((photo, i) => (
                                    <div key={i} className="relative aspect-square group">
                                        <img src={photo.url} className="w-full h-full object-cover rounded-md" alt={`Foto ${i+1}`} />
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-xs text-center p-1">{photo.stage}</span>
                                        </div>
                                    </div>
                                )) : <p className="col-span-full text-center text-sm text-slate-500 py-4">Nenhuma foto adicionada.</p>}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <h3 className="text-lg font-semibold text-cyan-300 mb-6">Etapa Atual: <span className="text-blue-300">{car.currentStage}</span></h3>
                                <div className="relative pt-4">
                                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-600" style={{ transform: 'translateY(-50%)' }}></div>
                                    <div className="absolute left-0 top-1/2 h-0.5 bg-cyan-500 transition-all duration-500" style={{ width: `${(currentStageIndex / (STAGES_ORDER.length - 1)) * 100}%` }}></div>
                                    <ol className="relative flex justify-between items-start">
                                        {STAGES_ORDER.map((stage, index) => {
                                            const isCompleted = index < currentStageIndex;
                                            const isActive = index === currentStageIndex;
                                            return (
                                                <li key={stage} className="text-center flex-1">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-cyan-500' : ''} ${isActive ? 'bg-blue-500 ring-4 ring-blue-500/30' : ''} ${!isCompleted && !isActive ? 'bg-slate-600 border-2 border-slate-500' : ''}`}>
                                                            {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-900" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                                        </div>
                                                        <p className={`mt-3 text-xs font-medium ${isActive ? 'text-blue-300' : 'text-slate-400'}`}>{stage}</p>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>
                            </div>
                             {/* Actions */}
                            <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                               <button onClick={() => setIsCompletingStage(true)} className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition transform hover:scale-105">
                                 {isLastStage ? 'Concluir Serviço' : 'Próxima Etapa'}
                               </button>
                               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                   <button onClick={handleAddPhotoClick} className="py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-600 transition text-sm">Adicionar Foto</button>
                                   <button onClick={() => setIsReportingProblem(!isReportingProblem)} className="py-2 px-3 rounded-md bg-slate-700 hover:bg-slate-600 transition text-sm">Relatar Problema</button>
                                   <button disabled={!isLastStage || !managerIsPresent} className="py-2 px-3 rounded-md bg-red-800/50 text-red-400 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed" title={!managerIsPresent ? "Apenas Gerentes podem encerrar" : ""}>Encerrar Serviço</button>
                               </div>
                               {isReportingProblem && (
                                   <div className="pt-4">
                                       <textarea value={problemNotes} onChange={e => setProblemNotes(e.target.value)} rows={3} placeholder="Descreva o problema ou peça quebrada..." className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                       <button onClick={handleSaveProblemReport} className="mt-2 text-xs py-1 px-3 rounded-md bg-cyan-600 hover:bg-cyan-700">Salvar Relato</button>
                                   </div>
                               )}
                            </div>
                        </div>

                        {/* Right Column - History */}
                        <div className="space-y-4 lg:border-l lg:border-slate-700 lg:pl-8">
                            <h3 className="text-lg font-semibold text-cyan-300">Histórico de Ações</h3>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {car.workLog.length > 0 ? [...car.workLog].reverse().map(log => (
                                    <div key={log.id} className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-slate-600">
                                        <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                            <span>{log.employeeName}</span>
                                            <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <p className="font-semibold text-sm text-white">Etapa: <span className="font-bold text-blue-300">{log.stage}</span></p>
                                        {log.notes && <p className={`mt-2 text-sm italic ${log.notes.startsWith('PROBLEMA:') ? 'text-red-400' : 'text-slate-300'}`}>"{log.notes}"</p>}
                                        {log.cost && log.cost > 0 && <p className="text-xs text-slate-400 mt-1 font-mono">Custo da etapa: {log.cost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>}
                                    </div>
                                )) : <p className="text-center text-sm text-slate-500 py-8">Nenhuma ação registrada.</p>}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            {isCompletingStage && (
                <CompleteStageModal
                    stageName={car.currentStage}
                    onClose={() => setIsCompletingStage(false)}
                    onConfirm={handleCompleteStageConfirm}
                    employees={employees}
                    stock={stock}
                />
            )}
        </>
    );
};

export default WorkInProgressModal;
