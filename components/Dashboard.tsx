import React, { useState, useMemo } from 'react';
import type { User, Car, FixedExpense, StockItem, Budget, Employee, AuditLogEntry, StockMovement, Notification, WorkshopProfile, GeneralProblem, PaymentRecord, IssuedInvoice } from '../types';
import { CarStatus, BudgetStatus, SubscriptionStatus } from '../types';
import CarFlow from './CarFlow';
import StockManagement from './MaterialsManagement'; // Renamed to StockManagement logic
import ExpensesSummary from './ExpensesSummary';
import TotalSummary from './TotalSummary';
import Budgets from './Budgets';
import AuditLogView from './AuditLogView';
import EmployeeActivity from './EmployeeActivity';
import ProfileManagement from './ProfileManagement';
import ProblemManagement from './ProblemManagement';
import InvoiceGeneration from './InvoiceGeneration';
import Payroll from './Payroll';
import InvoicesHistory from './InvoicesHistory';
import TrialBanner from './TrialBanner';
import SubscriptionManagement from './SubscriptionManagement';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  cars: Car[];
  onAddCar: (newCarData: Omit<Car, 'id' | 'status' | 'currentStage' | 'stageDetails' | 'workLog' | 'accumulatedCost'>) => void;
  onUpdateCar: (updatedCar: Car) => void;
  onRevertCarStage: (carId: string) => void;
  onResolveProblem: (carId: string, workLogId: string) => void;
  stock: StockItem[];
  stockMovements: StockMovement[];
  onAddStockItem: (newItem: Omit<StockItem, 'id'>) => void;
  onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
  onUpdateStockItem: (updatedItem: StockItem) => void;
  onRemoveStockItem: (itemId: string) => void;
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onRemoveEmployee: (employeeId: string) => void;
  auditLog: AuditLogEntry[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  workshopProfile: WorkshopProfile;
  onUpdateWorkshopProfile: (newProfile: WorkshopProfile) => void;
  budgets: Budget[];
  onAddBudget: (newBudget: Omit<Budget, 'id' | 'creationDate'> & { status: BudgetStatus }) => void;
  onUpdateBudget: (budgetId: string, newStatus: BudgetStatus) => void;
  onUpdateBudgetDetails: (updatedBudget: Budget) => void;
  onConvertBudgetToCar: (budget: Budget) => void;
  fixedExpenses: FixedExpense[];
  onAddFixedExpense: (newExpense: Omit<FixedExpense, 'id'>) => void;
  generalProblems: GeneralProblem[];
  onResolveGeneralProblem: (problemId: string) => void;
  paymentRecords: PaymentRecord[];
  onAddPaymentRecord: (newPayment: Omit<PaymentRecord, 'id' | 'date'>) => PaymentRecord;
  issuedInvoices: IssuedInvoice[];
  onIssueInvoice: (invoiceData: Omit<IssuedInvoice, 'id' | 'dateIssued'>) => void;
  theme: string;
  setTheme: (theme: string) => void;
  onSubscribe: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badgeCount?: number;
  isCollapsed: boolean;
}> = ({ icon, children, active, onClick, badgeCount = 0, isCollapsed }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? String(children) : undefined}
    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 relative ${
      active
        ? 'bg-cyan-500/10 text-[var(--color-text-accent)]'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary-hover)] hover:text-[var(--color-text-primary)]'
    } ${isCollapsed ? 'justify-center' : ''}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {!isCollapsed && <span className="ml-3 flex-1">{children}</span>}
    {badgeCount > 0 && (
       <span className={`h-5 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${isCollapsed ? 'absolute -top-1 -right-1 w-5 bg-red-600 text-white' : 'w-5 bg-red-500 text-white'}`}>
        {badgeCount}
      </span>
    )}
  </button>
);

const menuItemsConfig = [
    { id: 'Resumo', name: 'Resumo Geral', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg> },
    { id: 'Fluxo', name: 'Fluxo de Veículos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 14.707a1 1 0 001.414 0L14 10.828V12a1 1 0 102 0V8a1 1 0 00-1-1h-4a1 1 0 100 2h1.172l-3.879 3.879a1 1 0 000 1.414zM6 6a1 1 0 100 2h4a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
    { id: 'Gastos', name: 'Visão de Gastos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> },
    { id: 'Problemas', name: 'Problemas', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>, badgeCount: 0 },
    { id: 'Estoque', name: 'Estoque de Produtos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /><path d="M10 12a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>, badgeCount: 0 },
    { id: 'Orcamentos', name: 'Orçamentos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg> },
    { id: 'Funcionarios', name: 'Funcionários', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg> },
    { id: 'Pagamento', name: 'Pagamentos de Funcionários', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.168-.217c-1.25 0-2.25.932-2.25 2.125 0 1.193 1 2.125 2.25 2.125 1.25 0 2.25-.932 2.25-2.125 0-.17-.02-.336-.057-.495a1 1 0 011.956-.354c.04.16.061.328.061.5.001 1.838-1.562 3.32-3.46 3.32-1.897 0-3.459-1.482-3.459-3.32 0-1.838 1.562-3.32 3.46-3.32.342 0 .674.05.985.142V6.954a1 1 0 01-.567-.267L6.433 4.818a1 1 0 010-1.636l2-1.333a1 1 0 011.134 0l2 1.333a1 1 0 010 1.636l-2 1.333z" /><path d="M12.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.168-.217c-1.25 0-2.25.932-2.25 2.125 0 1.193 1 2.125 2.25 2.125 1.25 0 2.25-.932 2.25-2.125 0-.17-.02-.336-.057-.495a1 1 0 011.956-.354c.04.16.061.328.061.5.001 1.838-1.562 3.32-3.46 3.32-1.897 0-3.459-1.482-3.459-3.32 0-1.838 1.562-3.32 3.46-3.32.342 0 .674.05.985.142V6.954a1 1 0 01-.567-.267l-2-1.333a1 1 0 010-1.636l2-1.333a1 1 0 011.134 0l2 1.333a1 1 0 010 1.636l-2 1.333z" /></svg> },
    { id: 'NotaFiscal', name: 'Emitir Nota Fiscal', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg> },
    { id: 'HistoricoNotas', name: 'Histórico de Notas Fiscais', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg> },
    { id: 'Auditoria', name: 'Auditoria', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>},
    { id: 'Assinatura', name: 'Assinatura', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a3 3 0 013-3h8a3 3 0 013 3v8a3 3 0 01-3 3h-5l-3 3v-3H8a3 3 0 01-3-3V5zm3 0a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg> },
    { id: 'Perfil', name: 'Perfil / Configurações', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg> },
];

const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  menuItems: typeof menuItemsConfig;
}> = ({ isOpen, onClose, activeView, setActiveView, menuItems }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 md:hidden" onClick={onClose}>
      <div className="fixed inset-y-0 left-0 w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)] p-4" onClick={(e) => e.stopPropagation()}>
        <nav className="flex-grow space-y-2">
          {menuItems.map(item => (
            <NavItem 
              key={item.id} 
              icon={item.icon} 
              active={activeView === item.id}
              onClick={() => { setActiveView(item.id); onClose(); }}
              badgeCount={item.badgeCount}
              isCollapsed={false}
            >
              {item.name}
            </NavItem>
          ))}
        </nav>
      </div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = (props) => {
  const { user, onLogout, cars, onAddCar, onUpdateCar, onRevertCarStage, onResolveProblem, stock, stockMovements, onAddStockItem, onAddStockMovement, onUpdateStockItem, onRemoveStockItem, employees, onAddEmployee, onUpdateEmployee, onRemoveEmployee, auditLog, addNotification, workshopProfile, onUpdateWorkshopProfile, budgets, onAddBudget, onUpdateBudget, onUpdateBudgetDetails, onConvertBudgetToCar, fixedExpenses, onAddFixedExpense, generalProblems, onResolveGeneralProblem, paymentRecords, onAddPaymentRecord, issuedInvoices, onIssueInvoice, theme, setTheme, onSubscribe } = props;
  const [activeView, setActiveView] = useState('Resumo');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const menuItems = useMemo(() => {
    const lowStockCount = stock.filter(item => item.currentQuantity <= item.minimumQuantity).length;
    const pendingProblemsCount = cars.reduce((count, car) => {
      return count + car.workLog.filter(log => log.notes?.startsWith('PROBLEMA:') && !log.resolved).length;
    }, 0) + generalProblems.filter(p => !p.resolved).length;

    return menuItemsConfig.map(item => {
        if (item.id === 'Estoque') return { ...item, badgeCount: lowStockCount };
        if (item.id === 'Problemas') return { ...item, badgeCount: pendingProblemsCount };
        return item;
    });
  }, [stock, cars, generalProblems]);


  const renderContent = () => {
    switch (activeView) {
      case 'Resumo':
        return <TotalSummary 
                    cars={cars} 
                    stock={stock} 
                    fixedExpenses={fixedExpenses} 
                    paymentRecords={paymentRecords}
                    stockMovements={stockMovements}
                    theme={theme}
                    setTheme={setTheme}
                />;
      case 'Fluxo':
        return <CarFlow cars={cars} onAddCar={onAddCar} onUpdateCar={onUpdateCar} onRevertCarStage={onRevertCarStage} />;
      case 'Problemas':
        return <ProblemManagement 
                    cars={cars} 
                    onResolveProblem={onResolveProblem}
                    generalProblems={generalProblems}
                    onResolveGeneralProblem={onResolveGeneralProblem}
                />;
      case 'Estoque':
        return <StockManagement 
                    stock={stock}
                    stockMovements={stockMovements}
                    onAddStockItem={onAddStockItem}
                    onAddStockMovement={onAddStockMovement}
                    onUpdateStockItem={onUpdateStockItem}
                    onRemoveStockItem={onRemoveStockItem}
                />;
      case 'Gastos':
        return <ExpensesSummary 
                    fixedExpenses={fixedExpenses} 
                    stock={stock} 
                    onAddExpense={onAddFixedExpense} 
                    stockMovements={stockMovements} 
                    onAddStockItem={onAddStockItem}
                    onAddStockMovement={onAddStockMovement}
                    paymentRecords={paymentRecords}
                />;
      case 'Orcamentos':
        return <Budgets 
                    budgets={budgets} 
                    onAddBudget={onAddBudget} 
                    workshopProfile={workshopProfile} 
                    onUpdateBudget={onUpdateBudget}
                    onUpdateBudgetDetails={onUpdateBudgetDetails}
                    onConvertBudgetToCar={onConvertBudgetToCar}
                />;
       case 'Funcionarios':
        return <EmployeeActivity 
                  employees={employees} 
                  cars={cars} 
                  auditLog={auditLog}
                  onAddEmployee={onAddEmployee}
                  onUpdateEmployee={onUpdateEmployee}
                  onRemoveEmployee={onRemoveEmployee}
                />;
      case 'Auditoria':
        return <AuditLogView auditLog={auditLog} employees={employees} />;
      case 'Perfil':
        return <ProfileManagement profile={workshopProfile} onUpdateProfile={onUpdateWorkshopProfile} />;
      case 'NotaFiscal':
        return <InvoiceGeneration cars={cars} workshopProfile={workshopProfile} onIssueInvoice={onIssueInvoice} />;
      case 'Pagamento':
        return <Payroll 
                  employees={employees}
                  paymentRecords={paymentRecords}
                  onAddPaymentRecord={onAddPaymentRecord}
                  workshopProfile={workshopProfile}
                />;
      case 'HistoricoNotas':
        return <InvoicesHistory 
                  issuedInvoices={issuedInvoices}
                  paymentRecords={paymentRecords}
                  fixedExpenses={fixedExpenses}
                  stockMovements={stockMovements}
                  stock={stock}
                />;
       case 'Assinatura':
        return <SubscriptionManagement user={user} onSubscribe={onSubscribe} />;
      default:
        return (
          <div className="mt-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl p-8 text-center text-[var(--color-text-secondary)]">
            <p>A área de conteúdo para <span className="font-bold text-[var(--color-text-accent)]">{menuItems.find(item => item.id === activeView)?.name}</span> será exibida aqui.</p>
          </div>
        );
    }
  };


  return (
    <div className="min-h-screen w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex font-sans">
      {/* Mobile Nav */}
      <MobileNav 
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        menuItems={menuItems}
      />

      {/* Sidebar - Hidden on mobile */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <header className="p-4 mb-6 flex items-center gap-3" style={{ height: '68px' }}>
            {workshopProfile.logo ? (
                <img src={workshopProfile.logo} alt="Logo da Oficina" className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-md object-cover`} />
            ) : (
                isSidebarCollapsed && <div className="w-10 h-10 rounded-md bg-cyan-500/20 flex items-center justify-center font-bold text-[var(--color-text-accent)] text-xl">{workshopProfile.name.substring(0, 2).toUpperCase()}</div>
            )}
            {!isSidebarCollapsed && (
                <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 truncate">
                    {workshopProfile.name}
                </h1>
            )}
        </header>
        
        <nav className="flex-grow space-y-2 px-4">
           {menuItems.map(item => (
            <NavItem 
              key={item.id} 
              icon={item.icon} 
              active={activeView === item.id}
              onClick={() => setActiveView(item.id)}
              badgeCount={item.badgeCount}
              isCollapsed={isSidebarCollapsed}
            >
              {item.name}
            </NavItem>
          ))}
        </nav>

        <div className="px-4 mt-auto pt-4 border-t border-[var(--color-border-primary)]">
           <div className="pb-4">
                <NavItem
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    icon={isSidebarCollapsed 
                      ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L6.414 9H16a1 1 0 110 2H6.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    }
                    active={false}
                    isCollapsed={isSidebarCollapsed}
                >
                    {isSidebarCollapsed ? "Expandir" : "Recolher"}
                </NavItem>
           </div>
          <div className={`flex items-center mb-4 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-[var(--color-text-accent)] flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">{user.userType}</p>
                </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center bg-red-600/20 hover:bg-red-600/40 text-red-300 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                Sair
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center mb-6">
          <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 truncate">
              {menuItems.find(i => i.id === activeView)?.name || workshopProfile.name}
          </h1>
          <button onClick={() => setIsMobileNavOpen(true)} className="p-2 rounded-md hover:bg-[var(--color-bg-tertiary-hover)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </header>
        
        {user.subscriptionStatus === SubscriptionStatus.TRIAL && user.trialEndDate && (
            <TrialBanner trialEndDate={user.trialEndDate} onSubscribe={onSubscribe} />
        )}

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;