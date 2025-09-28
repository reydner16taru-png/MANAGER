import React, { useState, useMemo } from 'react';
import type { Budget, BudgetService } from '../types';
import { BudgetStatus } from '../types';

interface NewBudgetFormProps {
    onSave: (budget: Omit<Budget, 'id' | 'creationDate'>) => void;
    onCancel: () => void;
    budgetToEdit?: Budget;
}

const NewBudgetForm: React.FC<NewBudgetFormProps> = ({ onSave, onCancel, budgetToEdit }) => {
    const isEditing = !!budgetToEdit;

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
    const [vehicleBrand, setVehicleBrand] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [services, setServices] = useState<BudgetService[]>([]);
    const [status, setStatus] = useState<BudgetStatus>(BudgetStatus.PENDING);
    const [images, setImages] = useState<string[]>([]); // For Base64 strings

    React.useEffect(() => {
        if (budgetToEdit) {
            setCustomerName(budgetToEdit.customerName);
            setCustomerPhone(budgetToEdit.customerPhone);
            setCustomerEmail(budgetToEdit.customerEmail);
            setVehicleModel(budgetToEdit.vehicleModel);
            setVehicleYear(budgetToEdit.vehicleYear);
            setVehicleBrand(budgetToEdit.vehicleBrand);
            setVehiclePlate(budgetToEdit.vehiclePlate);
            setServices(budgetToEdit.services);
            setStatus(budgetToEdit.status);
            setImages(budgetToEdit.images || []);
        }
    }, [budgetToEdit]);

    // Services handlers
    const addService = () => setServices([...services, { id: new Date().toISOString(), description: '', value: 0 }]);
    const updateService = (id: string, field: keyof Omit<BudgetService, 'id'>, value: string | number) => {
        setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
    };
    const removeService = (id: string) => setServices(services.filter(s => s.id !== id));
    
    // Image handlers
    const handleImageUpload = (files: FileList | null) => {
        if (!files) return;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };


    // Total calculation
    const totalValue = useMemo(() => {
        const servicesTotal = services.reduce((sum, s) => sum + Number(s.value), 0);
        return servicesTotal;
    }, [services]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            customerName, customerPhone, customerEmail,
            vehicleModel, vehicleYear, vehicleBrand, vehiclePlate,
            services, totalValue, status, images
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">{isEditing ? 'Editar Orçamento' : 'Criar Novo Orçamento'}</h2>
                    <p className="text-[var(--color-text-secondary)]">{isEditing ? `Editando orçamento para o veículo ${budgetToEdit?.vehiclePlate}.` : 'Preencha os detalhes abaixo.'}</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer & Vehicle */}
                <div className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                        {/* Customer */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[var(--color-text-accent)] border-b border-[var(--color-border-secondary)] pb-2">Dados do Cliente</h3>
                            <input type="text" placeholder="Nome Completo" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="input-style" />
                            <input type="tel" placeholder="Telefone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="input-style" />
                            <input type="email" placeholder="E-mail" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required className="input-style" />
                        </div>
                        {/* Vehicle */}
                        <div className="space-y-4">
                             <h3 className="text-lg font-semibold text-[var(--color-text-accent)] border-b border-[var(--color-border-secondary)] pb-2">Dados do Veículo</h3>
                             <input type="text" placeholder="Marca" value={vehicleBrand} onChange={e => setVehicleBrand(e.target.value)} required className="input-style" />
                             <input type="text" placeholder="Modelo" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} required className="input-style" />
                             <div className="flex gap-4">
                                <input type="number" placeholder="Ano" value={vehicleYear} onChange={e => setVehicleYear(Number(e.target.value))} required className="input-style w-1/2" />
                                <input type="text" placeholder="Placa" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} required className="input-style w-1/2" />
                             </div>
                        </div>
                        {/* Status */}
                        <div className="space-y-4 md:col-span-2 lg:col-span-1">
                             <h3 className="text-lg font-semibold text-[var(--color-text-accent)] border-b border-[var(--color-border-secondary)] pb-2">Status Inicial</h3>
                             <select value={status} onChange={e => setStatus(e.target.value as BudgetStatus)} className="input-style">
                                 <option value={BudgetStatus.PENDING}>Pendente</option>
                                 <option value={BudgetStatus.APPROVED}>Aprovado</option>
                                 <option value={BudgetStatus.REJECTED}>Rejeitado</option>
                             </select>
                        </div>
                    </div>
                </div>
                 {/* Photos */}
                <div className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-6">
                     <h3 className="text-lg font-semibold text-[var(--color-text-accent)] mb-4">Fotos do Veículo</h3>
                     <div className="p-4 border-2 border-dashed border-[var(--color-border-secondary)] rounded-lg text-center">
                         <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e.target.files)} className="input-style file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-accent-primary)]/20 file:text-[var(--color-text-accent)] hover:file:bg-[var(--color-accent-primary)]/40" />
                     </div>
                     {images.length > 0 && (
                         <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                            {images.map((imgSrc, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <img src={imgSrc} alt={`Veículo ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >&times;</button>
                                </div>
                            ))}
                         </div>
                     )}
                </div>

                {/* Services */}
                <div className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-accent)] mb-4">Serviços a Realizar</h3>
                    <div className="space-y-4">
                        {services.map(service => (
                            <div key={service.id} className="flex items-center gap-4">
                                <input type="text" placeholder="Descrição do serviço" value={service.description} onChange={e => updateService(service.id, 'description', e.target.value)} className="input-style flex-grow" />
                                <input type="number" placeholder="Valor (R$)" value={service.value} onChange={e => updateService(service.id, 'value', Number(e.target.value))} min="0" step="0.01" className="input-style w-32" />
                                <button type="button" onClick={() => removeService(service.id)} className="text-[var(--color-danger-text)] hover:brightness-125 p-2 rounded-md bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger-bg)]">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addService} className="mt-4 text-sm font-medium text-[var(--color-text-accent)] hover:brightness-125">+ Adicionar Serviço</button>
                </div>
                
                {/* Footer */}
                <div className="flex justify-between items-center p-6 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-primary)] rounded-b-xl">
                    <div>
                        <span className="text-[var(--color-text-secondary)]">Valor Total do Orçamento:</span>
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                     <div className="flex gap-4">
                        <button type="button" onClick={onCancel} className="py-2 px-5 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">Cancelar</button>
                        <button type="submit" className="py-2 px-5 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">{isEditing ? 'Salvar Alterações' : 'Salvar Orçamento'}</button>
                    </div>
                </div>
            </form>
            <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }`}</style>
        </div>
    );
};

export default NewBudgetForm;
