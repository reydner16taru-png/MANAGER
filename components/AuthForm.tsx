import React, { useState } from 'react';
import { UserType, Employee } from '../types';
import type { User } from '../types';
import type { AuthInfo } from '../App';

interface AuthFormProps {
  onLogin: (authInfo: AuthInfo) => void;
  employees: Employee[]; // To simulate password check
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, employees }) => {
  const [authMode, setAuthMode] = useState<'oficina' | 'loja'>('oficina');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // State for 'Oficina' form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for 'Loja' form
  const [employeeId, setEmployeeId] = useState('');
  const [storePassword, setStorePassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || (isRegistering && !name.trim())) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // In a real app, you'd call an API. Here we simulate success.
    // When registering, the new user is always an Administrator.
    const simulatedUser: User = {
      name: isRegistering ? name : 'Admin Teste',
      email,
      userType: UserType.ADMIN,
    };

    onLogin({ user: simulatedUser, portal: 'dashboard' });
  };
  
  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeId.trim() || !storePassword.trim()) {
      setError('Por favor, preencha o ID e a senha do funcionário.');
      return;
    }

    const employee = employees.find(
      (emp) => emp.employeeId === employeeId && emp.password === storePassword
    );

    if (employee) {
      onLogin({ user: employee, portal: 'store' });
    } else {
      setError('Credenciais da loja inválidas.');
    }
  };

  const toggleFormMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  };
  
  const renderOficinaForm = () => (
    <>
      <h2 className="text-center text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        {isRegistering ? 'Crie sua Conta de Administrador' : 'Acessar Painel'}
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)] mb-8">
        {isRegistering ? 'Comece a gerenciar sua oficina hoje mesmo.' : 'Bem-vindo de volta! Faça login para continuar.'}
      </p>
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isRegistering && (
          <div>
            <label htmlFor="name" className="sr-only">Seu Nome Completo</label>
            <input id="name" name="name" type="text" required className="input-style" placeholder="Seu Nome Completo" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="sr-only">Endereço de e-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input-style" placeholder="Endereço de e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        
        <div>
          <label htmlFor="password" className="sr-only">Senha</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input-style" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div>
          <button type="submit" className="button-primary">
            {isRegistering ? 'Criar Conta e Iniciar Teste' : 'Entrar'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button onClick={toggleFormMode} className="ml-1 font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none focus:underline">
            {isRegistering ? 'Faça Login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </>
  );

  const renderLojaForm = () => (
     <>
      <h2 className="text-center text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        Login da Loja
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)] mb-8">
        Acesso restrito ao portal da loja
      </p>
      
      <form className="space-y-5" onSubmit={handleStoreSubmit}>
        <div>
          <label htmlFor="employeeId" className="sr-only">ID do Funcionário</label>
          <input id="employeeId" name="employeeId" type="text" required className="input-style" placeholder="ID do Funcionário (Ex: G-001)" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
        </div>
        
        <div>
          <label htmlFor="storePassword" className="sr-only">Senha</label>
          <input id="storePassword" name="storePassword" type="password" required className="input-style" placeholder="Senha" value={storePassword} onChange={(e) => setStorePassword(e.target.value)} />
        </div>

        <div>
          <button type="submit" className="button-primary">
            Entrar como Loja
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="w-full bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-[var(--color-border-primary)]">
      <div className="flex">
        <button
          onClick={() => { setAuthMode('oficina'); setError(null); }}
          className={`flex-1 p-4 text-sm font-bold transition-colors duration-300 focus:outline-none ${authMode === 'oficina' ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]' : 'bg-[var(--color-bg-secondary)]/50 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary-hover)]'}`}
        >
          Painel Oficina
        </button>
        <button
          onClick={() => { setAuthMode('loja'); setError(null); }}
          className={`flex-1 p-4 text-sm font-bold transition-colors duration-300 focus:outline-none ${authMode === 'loja' ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]' : 'bg-[var(--color-bg-secondary)]/50 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary-hover)]'}`}
        >
          Login Loja
        </button>
      </div>

      <div className="p-8">
        {error && <div className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] p-3 rounded-md mb-6 text-sm text-center">{error}</div>}
        
        {authMode === 'oficina' ? renderOficinaForm() : renderLojaForm()}
      </div>
       <style>{`
        .input-style { appearance: none; border-radius: 0.375rem; position: relative; display: block; width: 100%; padding: 0.75rem; border: 1px solid var(--color-border-secondary); background-color: var(--color-bg-tertiary); color: var(--color-text-primary); placeholder-color: var(--color-text-secondary); outline: none; transition: all 0.2s; } 
        .input-style:focus { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-primary); }
        .button-primary { display: flex; width: 100%; justify-content: center; padding: 0.75rem 1rem; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; color: white; background-color: var(--color-accent-primary); transition: background-color 0.3s, transform 0.2s; }
        .button-primary:hover { background-color: var(--color-accent-secondary); transform: scale(1.02); }
        .button-primary:focus { outline: none; box-shadow: 0 0 0 2px var(--color-bg-primary), 0 0 0 4px var(--color-accent-primary); }
       `}</style>
    </div>
  );
};

export default AuthForm;