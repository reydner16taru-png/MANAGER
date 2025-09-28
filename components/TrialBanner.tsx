import React from 'react';

interface TrialBannerProps {
    trialEndDate: string;
    onSubscribe: () => void;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ trialEndDate, onSubscribe }) => {
    const calculateDaysLeft = () => {
        const end = new Date(trialEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const daysLeft = calculateDaysLeft();

    if (daysLeft === 0) {
        return (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl relative mb-6 text-center">
                <strong>Seu período de avaliação terminou!</strong> Para continuar usando o sistema, por favor, ative sua assinatura.
                <button onClick={onSubscribe} className="ml-4 py-1 px-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition text-sm">Ativar Assinatura</button>
            </div>
        );
    }

    return (
        <div className="bg-cyan-900/50 border border-cyan-700 text-cyan-200 px-4 py-3 rounded-xl relative mb-6 flex items-center justify-center gap-4">
            <span role="img" aria-label="hourglass">⏳</span>
            <span>Você tem <strong>{daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}</strong> no seu período de avaliação.</span>
            <button onClick={onSubscribe} className="py-1 px-3 rounded-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition text-sm">Fazer Upgrade Agora</button>
        </div>
    );
};

export default TrialBanner;
