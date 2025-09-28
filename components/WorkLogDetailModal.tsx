import React from 'react';
import type { WorkLog } from '../types';

interface WorkLogDetailModalProps {
    log: WorkLog;
    onClose: () => void;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const WorkLogDetailModal: React.FC<WorkLogDetailModalProps> = ({ log, onClose }) => {
    const hasMaterials = log.materialsUsed && log.materialsUsed.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
                <header className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Detalhes da Etapa: <span className="text-blue-300">{log.stage}</span></h2>
                        <p className="text-xs text-slate-400">Realizada por {log.employeeName} em {new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition text-2xl leading-none">&times;</button>
                </header>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                    {log.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-300 mb-2">Observações</h3>
                            <p className={`text-sm italic p-3 rounded-md ${log.notes.startsWith('PROBLEMA:') ? 'bg-red-500/10 text-red-300' : 'bg-slate-700/50 text-slate-200'}`}>
                                "{log.notes}"
                            </p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Materiais Utilizados</h3>
                        {hasMaterials ? (
                            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                                {log.materialsUsed!.map((material, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-200">{material.name}</span>
                                        <span className="font-mono text-slate-300">{String(material.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Nenhum material registrado para esta etapa.</p>
                        )}
                    </div>
                </div>

                <footer className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
                    <div className="text-sm">
                        <span className="text-slate-400">Custo Total da Etapa:</span>
                        <p className="font-bold text-lg text-cyan-400">{formatCurrency(log.cost || 0)}</p>
                    </div>
                    <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 transition">Fechar</button>
                </footer>
            </div>
        </div>
    );
};

export default WorkLogDetailModal;
