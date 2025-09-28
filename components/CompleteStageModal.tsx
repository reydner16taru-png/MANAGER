import React, { useState, useMemo, FC } from 'react';
import { ServiceStage, EmployeeRole, UnitOfMeasure } from '../types';
import type { Employee, StockItem } from '../types';

type MaterialsToDeduct = { name: string; quantity: number; unit: string };

interface CompleteStageModalProps {
    stageName: ServiceStage;
    onClose: () => void;
    onConfirm: (data: {
        employee: Employee;
        photos: File[];
        comments: string;
        cost: number;
        materialsUsed: MaterialsToDeduct[];
        stageSpecificData: any;
    }) => void;
    employees: Employee[];
    stock: StockItem[]; // Now uses StockItem instead of Material
}

const InputField: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`input-style ${props.className}`} />
);
const SelectField: FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`input-style ${props.className}`} />
);
const TextAreaField: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className={`input-style ${props.className}`} />
);

const CompleteStageModal: React.FC<CompleteStageModalProps> = ({ stageName, onClose, onConfirm, employees, stock }) => {
    // Common state
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [authPassword, setAuthPassword] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');

    // Stage-specific state
    const [brokenPart, setBrokenPart] = useState(false);
    const [brokenPartDetails, setBrokenPartDetails] = useState<{ name: string; cost: number }>({ name: '', cost: 0 });

    const [usedMaterials, setUsedMaterials] = useState<Record<string, { used: boolean; quantity: number }>>({});
    const [puttyWeight, setPuttyWeight] = useState(0);

    const [painterId, setPainterId] = useState<string>(employees.find(e => e.role === EmployeeRole.PINTOR)?.id || '');
    const [paintQty, setPaintQty] = useState(0);
    const [varnishQty, setVarnishQty] = useState(0);

    const [polishingDone, setPolishingDone] = useState(true);
    const [washingDone, setWashingDone] = useState(true);

    const findStockItem = (name: string) => stock.find(s => s.name.toLowerCase() === name.toLowerCase());

    const calculatedCost = useMemo(() => {
        let total = 0;
        
        // Cost from checkbox-based unit items
        Object.keys(usedMaterials).forEach((name) => {
            const data = usedMaterials[name];
            if (data.used) total += (findStockItem(name)?.unitPrice || 0) * data.quantity;
        });
        
        // Cost from specific quantity inputs
        if (puttyWeight > 0) {
            total += (findStockItem('Massa Poliéster')?.unitPrice || 0) * puttyWeight;
        }
        if (paintQty > 0) {
            total += (findStockItem('Tinta Metálica Azul')?.unitPrice || 0) * paintQty;
        }
        if (varnishQty > 0) {
            total += (findStockItem('Verniz HS')?.unitPrice || 0) * varnishQty;
        }

        return total;
    }, [usedMaterials, puttyWeight, paintQty, varnishQty, stock]);

    const handleConfirm = () => {
        setError('');
        const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
        if (!selectedEmployeeId || !selectedEmployee) {
            setError('Por favor, selecione o funcionário responsável.');
            return;
        }
        
        // Password validation
        if (selectedEmployee.password !== authPassword) {
            setError('Senha do funcionário incorreta.');
            return;
        }

        let materialsUsed: MaterialsToDeduct[] = [];
        let stageSpecificData: any = {};

        switch (stageName) {
            case ServiceStage.DISASSEMBLY:
                stageSpecificData = { hasBrokenPart: brokenPart, details: brokenPart ? brokenPartDetails : null };
                break;
            case ServiceStage.REPAIR:
                Object.keys(usedMaterials).forEach((name) => {
                    const data = usedMaterials[name];
                    const stockItem = findStockItem(name);
                    if (data.used && stockItem) materialsUsed.push({ name, quantity: data.quantity, unit: stockItem.unitOfMeasure });
                });
                if (puttyWeight > 0) materialsUsed.push({ name: 'Massa Poliéster', quantity: puttyWeight, unit: UnitOfMeasure.GRAMAS });
                stageSpecificData = { materialsUsed, puttyWeight };
                break;
            case ServiceStage.PAINTING:
                 if(paintQty > 0) materialsUsed.push({ name: 'Tinta Metálica Azul', quantity: paintQty, unit: UnitOfMeasure.ML });
                 if(varnishQty > 0) materialsUsed.push({ name: 'Verniz HS', quantity: varnishQty, unit: UnitOfMeasure.ML });
                stageSpecificData = { painterId, paintQty, varnishQty };
                break;
            case ServiceStage.POLISHING:
            case ServiceStage.WASHING:
                stageSpecificData = { polishingDone, washingDone };
                break;
        }

        onConfirm({ employee: selectedEmployee, photos, comments, cost: calculatedCost, materialsUsed, stageSpecificData });
    };

    const renderStageSpecificFields = () => {
        switch (stageName) {
            case ServiceStage.DISASSEMBLY:
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">Alguma peça foi quebrada?</label>
                        <div className="flex items-center gap-4">
                            <label><input type="radio" name="broken" checked={!brokenPart} onChange={() => setBrokenPart(false)} className="mr-2" /> Não</label>
                            <label><input type="radio" name="broken" checked={brokenPart} onChange={() => setBrokenPart(true)} className="mr-2" /> Sim</label>
                        </div>
                        {brokenPart && (
                            <div className="grid grid-cols-2 gap-4 p-4 border border-slate-600 rounded-md bg-slate-700/50">
                                <InputField placeholder="Nome da peça" value={brokenPartDetails.name} onChange={e => setBrokenPartDetails(p => ({ ...p, name: e.target.value }))} />
                                <InputField type="number" placeholder="Custo de reposição (R$)" value={brokenPartDetails.cost} onChange={e => setBrokenPartDetails(p => ({ ...p, cost: Number(e.target.value) }))} />
                            </div>
                        )}
                    </div>
                );
            case ServiceStage.REPAIR:
                const repairMaterials = ['Lixa 80', 'Lixa 320', 'Primer PU'];
                return (
                     <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-300">Materiais Usados</h4>
                        {repairMaterials.map(matName => {
                             const stockItem = findStockItem(matName);
                             const quantityUsed = usedMaterials[matName]?.quantity || 0;
                             const isStockLow = stockItem ? quantityUsed > stockItem.currentQuantity : false;
                             return (
                                <div key={matName} className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" checked={usedMaterials[matName]?.used || false} onChange={e => setUsedMaterials(m => ({...m, [matName]: {used: e.target.checked, quantity: m[matName]?.quantity || 1}}))} /> 
                                        {matName}
                                        <span className="text-xs text-slate-400 ml-2">({(stockItem?.unitPrice || 0).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}/{stockItem?.unitOfMeasure})</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${isStockLow ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                                          Estoque: {stockItem?.currentQuantity.toFixed(2) || 0}
                                        </span>
                                        {usedMaterials[matName]?.used && <InputField type="number" className="w-24" placeholder="Qtd." value={quantityUsed || 1} onChange={e => setUsedMaterials(m => ({...m, [matName]: {used: true, quantity: Number(e.target.value)}}))} min="1"/>}
                                    </div>
                                </div>
                            )
                        })}
                         <div className="flex items-center justify-between border-t border-slate-600 pt-4">
                             <label className="flex-grow">Massa Poliéster <span className="text-xs text-slate-400">({UnitOfMeasure.GRAMAS})</span></label>
                             <InputField type="number" className="w-24" placeholder="Gramas" value={puttyWeight} onChange={e => setPuttyWeight(Number(e.target.value))} min="0"/>
                         </div>
                         <p className="text-right font-semibold text-cyan-300">Custo da Etapa: {calculatedCost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                    </div>
                );
            case ServiceStage.PAINTING:
                 return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">Pintor</label>
                        <SelectField value={painterId} onChange={e => setPainterId(e.target.value)}>
                            <option value="" disabled>Selecione um pintor</option>
                            {employees.filter(e => e.role === EmployeeRole.PINTOR || e.role === EmployeeRole.GERENTE).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </SelectField>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Tinta Usada ({UnitOfMeasure.ML})</label>
                                <InputField type="number" placeholder="750" value={paintQty} onChange={e => setPaintQty(Number(e.target.value))} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Verniz Usado ({UnitOfMeasure.ML})</label>
                                <InputField type="number" placeholder="500" value={varnishQty} onChange={e => setVarnishQty(Number(e.target.value))} />
                            </div>
                        </div>
                        <p className="text-right font-semibold text-cyan-300">Custo da Etapa: {calculatedCost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                    </div>
                );
             case ServiceStage.POLISHING:
             case ServiceStage.WASHING:
                return (
                     <div className="space-y-4">
                        <label><input type="checkbox" className="mr-2" checked={polishingDone} onChange={e => setPolishingDone(e.target.checked)} /> Polimento realizado</label>
                        <label><input type="checkbox" className="mr-2" checked={washingDone} onChange={e => setWashingDone(e.target.checked)} /> Lavagem realizada</label>
                     </div>
                );
            default:
                return <p className="text-sm text-slate-400">Nenhum campo específico para esta etapa.</p>;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] transition-opacity duration-300" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col border border-slate-700">
                <header className="p-6 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Concluir Etapa: <span className="text-blue-300">{stageName}</span></h2>
                </header>
                <div className="p-8 space-y-6 overflow-y-auto flex-grow">
                    {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm text-center">{error}</div>}
                    
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Funcionário Responsável *</label>
                            <SelectField value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
                                <option value="" disabled>Selecione um funcionário</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>)}
                            </SelectField>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Senha do Funcionário *</label>
                            <InputField 
                                type="password" 
                                value={authPassword} 
                                onChange={e => setAuthPassword(e.target.value)} 
                                placeholder="Digite a senha para confirmar"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Fotos da Etapa (Opcional)</label>
                        <InputField type="file" multiple onChange={e => setPhotos(Array.from(e.target.files || []))} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/20 file:text-cyan-300 hover:file:bg-cyan-600/40" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Comentário / Observações (Opcional)</label>
                        <TextAreaField rows={4} value={comments} onChange={e => setComments(e.target.value)} placeholder="Descreva o trabalho realizado, dificuldades, etc." />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700">
                         {renderStageSpecificFields()}
                    </div>
                </div>
                 <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid #475569; background-color: #334155; color: white; placeholder-color: #94a3b8; outline: none; transition: all 0.2s; } .input-style:focus { --tw-ring-color: #06b6d4; border-color: #06b6d4; box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
                <footer className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end space-x-4 flex-shrink-0">
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 transition">Cancelar</button>
                    <button type="button" onClick={handleConfirm} className="py-2 px-5 rounded-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition">Salvar e Avançar</button>
                </footer>
            </div>
        </div>
    );
};

export default CompleteStageModal;