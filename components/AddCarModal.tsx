import React, { useState } from 'react';
import type { Car, CarPart } from '../types';

interface AddCarModalProps {
  onClose: () => void;
  // FIX: Corrected the type for onAddCar to align with its implementation in App.tsx.
  // The function initializes workLog and accumulatedCost, so they should not be passed in.
  onAddCar: (car: Omit<Car, 'id' | 'status' | 'currentStage' | 'stageDetails' | 'workLog' | 'accumulatedCost'>) => void;
}

const initialParts: CarPart[] = [
  { id: 'front-bumper', name: 'Para-choque Dianteiro', selected: false },
  { id: 'rear-bumper', name: 'Para-choque Traseiro', selected: false },
  { id: 'hood', name: 'Capô', selected: false },
  { id: 'trunk', name: 'Porta-malas', selected: false },
  { id: 'roof', name: 'Teto', selected: false },
  { id: 'driver-door', name: 'Porta Motorista', selected: false },
  { id: 'passenger-door', name: 'Porta Passageiro', selected: false },
  { id: 'driver-rear-door', name: 'Porta Tras. Motorista', selected: false },
  { id: 'passenger-rear-door', name: 'Porta Tras. Passageiro', selected: false },
  { id: 'left-fender', name: 'Paralama Esquerdo', selected: false },
  { id: 'right-fender', name: 'Paralama Direito', selected: false },
  { id: 'windshield', name: 'Para-brisa', selected: false },
];


const AddCarModal: React.FC<AddCarModalProps> = ({ onClose, onAddCar }) => {
  const [formData, setFormData] = useState({
    model: '', year: new Date().getFullYear(), brand: '', vin: '', plate: '',
    customer: '', deliveryDate: '', exitDate: '', description: '', serviceValue: 0,
  });
  const [images, setImages] = useState<File[]>([]);
  const [parts, setParts] = useState<CarPart[]>(initialParts);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handlePartToggle = (partId: string) => {
    setParts(prevParts =>
      prevParts.map(part =>
        part.id === partId ? { ...part, selected: !part.selected } : part
      )
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCar({ ...formData, images, parts: parts.filter(p => p.selected) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300" aria-modal="true" role="dialog">
      <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--color-border-primary)] mx-2">
        <header className="p-6 border-b border-[var(--color-border-primary)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Adicionar Novo Carro</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">&times;</button>
        </header>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Column 1 */}
                <div className="space-y-6">
                    <input type="text" name="model" placeholder="Modelo" value={formData.model} onChange={handleInputChange} required className="input-style" />
                    <input type="number" name="year" placeholder="Ano" value={formData.year} onChange={handleInputChange} required className="input-style" />
                    <input type="text" name="brand" placeholder="Marca" value={formData.brand} onChange={handleInputChange} required className="input-style" />
                    <input type="text" name="plate" placeholder="Placa" value={formData.plate} onChange={handleInputChange} required className="input-style" />
                    <input type="text" name="customer" placeholder="Nome/Telefone do Cliente" value={formData.customer} onChange={handleInputChange} required className="input-style" />
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Valor do Serviço (R$)</label>
                        <input type="number" name="serviceValue" placeholder="2500,00" value={formData.serviceValue} onChange={handleInputChange} required min="0" step="0.01" className="input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Fotos do Veículo</label>
                        <input type="file" multiple onChange={handleImageChange} className="input-style file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-accent-primary)]/20 file:text-[var(--color-text-accent)] hover:file:bg-[var(--color-accent-primary)]/40" />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Data de Entrega Prevista</label>
                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className="input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Data Planejada de Saída</label>
                        <input type="date" name="exitDate" value={formData.exitDate} onChange={handleInputChange} className="input-style" />
                    </div>
                    <textarea name="description" placeholder="Descrição do Serviço" value={formData.description} onChange={handleInputChange} rows={4} className="input-style"></textarea>
                    
                    <fieldset>
                        <legend className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Peças a Serem Trabalhadas</legend>
                        <div className="grid grid-cols-2 gap-3 p-4 border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-tertiary)]/50 max-h-48 overflow-y-auto">
                            {parts.map(part => (
                                <label key={part.id} className="flex items-center space-x-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                                    <input type="checkbox" checked={part.selected} onChange={() => handlePartToggle(part.id)} className="rounded text-[var(--color-accent-primary)] bg-[var(--color-bg-tertiary)] border-[var(--color-border-secondary)] focus:ring-[var(--color-accent-primary)]" />
                                    <span>{part.name}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
            </div>
            <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }`}</style>
            <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end space-x-4 sticky bottom-0">
                <button type="button" onClick={onClose} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">Salvar Carro</button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default AddCarModal;
