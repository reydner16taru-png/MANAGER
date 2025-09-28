import React from 'react';
import type { User } from '../types';
import { SubscriptionStatus } from '../types';

interface SubscriptionManagementProps {
    user: User;
    onSubscribe: () => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ user, onSubscribe }) => {
    
    const renderStatusBadge = () => {
        switch (user.subscriptionStatus) {
            case SubscriptionStatus.ACTIVE:
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)]">Ativo</span>;
            case SubscriptionStatus.TRIAL:
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--color-info-bg)] text-[var(--color-info-text)]">Em Avaliação</span>;
            case SubscriptionStatus.EXPIRED:
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]">Expirado</span>;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Gerenciamento de Assinatura</h2>
                <p className="text-[var(--color-text-secondary)]">Veja os detalhes do seu plano e gerencie sua assinatura.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-[var(--color-bg-secondary)]/70 border border-[var(--color-border-primary)] rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
                        <h3 className="text-2xl font-bold text-[var(--color-text-accent)] mb-2">Plano Profissional</h3>
                        <p className="text-5xl font-extrabold text-[var(--color-text-primary)] mb-2">
                            R$99<span className="text-xl font-normal text-[var(--color-text-secondary)]">/mês</span>
                        </p>
                        <ul className="text-left space-y-3 text-[var(--color-text-secondary)] my-8">
                            <li className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--color-success-text)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Veículos ilimitados</li>
                            <li className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--color-success-text)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Funcionários ilimitados</li>
                            <li className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--color-success-text)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Relatórios Financeiros</li>
                            <li className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--color-success-text)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Suporte Prioritário</li>
                        </ul>
                        {user.subscriptionStatus !== SubscriptionStatus.ACTIVE && (
                            <button onClick={onSubscribe} className="w-full max-w-xs py-3 px-6 rounded-lg font-semibold text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition transform hover:scale-105">
                                Ativar Assinatura
                            </button>
                        )}
                        {user.subscriptionStatus === SubscriptionStatus.ACTIVE && (
                             <button className="w-full max-w-xs py-3 px-6 rounded-lg font-semibold bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">
                                Gerenciar no Portal de Pagamento
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-primary)] rounded-xl p-6 space-y-6">
                     <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Status da Conta</h3>
                     <div className="flex justify-between items-center">
                         <span className="text-[var(--color-text-secondary)]">Plano Atual:</span>
                         <span className="font-bold text-[var(--color-text-primary)]">Profissional</span>
                     </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[var(--color-text-secondary)]">Status:</span>
                         {renderStatusBadge()}
                     </div>
                     {user.subscriptionStatus === SubscriptionStatus.TRIAL && user.trialEndDate && (
                        <div className="text-center bg-[var(--color-bg-tertiary)]/50 p-4 rounded-md">
                            <p className="text-sm text-[var(--color-text-secondary)]">Sua avaliação termina em:</p>
                            <p className="font-bold text-[var(--color-text-primary)] mt-1">{new Date(user.trialEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
