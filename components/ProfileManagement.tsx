import React, { useState, useEffect, useRef } from 'react';
import type { WorkshopProfile } from '../types';

interface ProfileManagementProps {
    profile: WorkshopProfile;
    onUpdateProfile: (newProfile: WorkshopProfile) => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ profile, onUpdateProfile }) => {
    const [formData, setFormData] = useState<WorkshopProfile>(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile(formData);
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Perfil da Oficina</h2>
                <p className="text-[var(--color-text-secondary)]">Personalize as informações do seu negócio que aparecerão nos orçamentos e relatórios.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl">
                <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl">
                    <div className="p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row items-start gap-8">
                            {/* Logo Uploader */}
                             <div className="flex-shrink-0">
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Logo da Oficina</label>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                />
                                <div 
                                    onClick={handleLogoClick}
                                    className="w-40 h-40 bg-[var(--color-bg-tertiary)]/50 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed border-[var(--color-border-secondary)] hover:border-[var(--color-accent-primary)] transition-all group"
                                >
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Prévia da Logo" className="w-full h-full rounded-full object-cover"/>
                                    ) : (
                                        <div className="text-center text-[var(--color-text-secondary)]">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 group-hover:text-[var(--color-text-accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-xs mt-2 block">Clique para enviar</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Text Fields */}
                            <div className="flex-grow space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Nome da Oficina</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-style"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="taxId" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">CPF / CNPJ</label>
                                    <input
                                        id="taxId"
                                        name="taxId"
                                        type="text"
                                        value={formData.taxId}
                                        onChange={handleInputChange}
                                        className="input-style"
                                        placeholder="00.000.000/0001-00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-border-primary)]">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Celular / Telefone</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="input-style"
                                    placeholder="(11) 98765-4321"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">E-mail de Contato</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="input-style"
                                    placeholder="contato@suaoficina.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Endereço</label>
                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleInputChange}
                                className="input-style"
                                placeholder="Rua das Flores, 123, Bairro, Cidade - UF, 00000-000"
                            />
                        </div>
                    </div>
                    <footer className="p-6 bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border-primary)] flex justify-end">
                        <button
                            type="submit"
                            className="py-2 px-6 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition transform hover:scale-105"
                        >
                            Salvar Alterações
                        </button>
                    </footer>
                </div>
            </form>
            <style>{`.input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }`}</style>
        </div>
    );
};

export default ProfileManagement;
