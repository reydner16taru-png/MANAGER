


import React, { useState, useEffect } from 'react';
import type { User, Car, StockItem, Employee, WorkLog, AuditLogEntry, StockMovement, Notification, WorkshopProfile, Budget, FixedExpense, GeneralProblem, PaymentRecord, IssuedInvoice } from './types';
import { CarStatus, ServiceStage, EmployeeRole, StockItemCategory, UnitOfMeasure, BudgetStatus, SubscriptionStatus } from './types';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import StorePortal from './components/StorePortal';
import NotificationContainer from './components/NotificationContainer';

export type AuthInfo = {
  user: User | Employee; // Can be an admin User or a store Employee
  portal: 'dashboard' | 'store';
}

const STAGES_ORDER = [
  ServiceStage.DISASSEMBLY,
  ServiceStage.REPAIR,
  ServiceStage.SANDING,
  ServiceStage.PAINTING,
  ServiceStage.POLISHING,
  ServiceStage.WASHING,
];

// Mock data lifted to the App component to be the single source of truth
const initialCars: Car[] = [
  {
    id: '1',
    model: 'Corolla',
    year: 2022,
    brand: 'Toyota',
    vin: '123ABC456DEF789',
    plate: 'ABC-1234',
    customer: 'João Silva / (11) 98765-4321',
    images: [],
    deliveryDate: '2023-10-25',
    exitDate: '2023-10-30',
    description: 'Reparo no para-choque dianteiro e pintura.',
    parts: [{id: 'front-bumper', name: 'Para-choque Dianteiro', selected: true}],
    status: CarStatus.IN_PROGRESS,
    currentStage: ServiceStage.REPAIR,
    stageDetails: {
        [ServiceStage.DISASSEMBLY]: { photos: [], expenses: 0 },
        [ServiceStage.REPAIR]: { photos: [], expenses: 0 },
        [ServiceStage.SANDING]: { photos: [], expenses: 0 },
        [ServiceStage.PAINTING]: { photos: [], expenses: 0 },
        [ServiceStage.POLISHING]: { photos: [], expenses: 0 },
        [ServiceStage.WASHING]: { photos: [], expenses: 0 },
    },
    serviceValue: 2500,
    accumulatedCost: 55.50,
    workLog: [
      { id: 'log1', timestamp: new Date(Date.now() - 86400000).toISOString(), stage: ServiceStage.DISASSEMBLY, employeeName: 'Bruno Dias', notes: 'PROBLEMA: Parafuso do para-choque espanado.', cost: 55.50, resolved: false }
    ],
    hasProblemReport: true,
  },
  {
    id: '2',
    model: 'Civic',
    year: 2021,
    brand: 'Honda',
    vin: '987ZYX654CBA321',
    plate: 'XYZ-5678',
    customer: 'Maria Oliveira / (21) 91234-5678',
    images: [],
    deliveryDate: '2023-11-05',
    exitDate: '2023-11-10',
    description: 'Pintura completa e polimento.',
    parts: [
      { id: 'hood', name: 'Capô', selected: true },
      { id: 'roof', name: 'Teto', selected: true },
    ],
    status: CarStatus.COMPLETED,
    currentStage: ServiceStage.WASHING,
    stageDetails: {
      [ServiceStage.DISASSEMBLY]: { photos: [], expenses: 0 },
      [ServiceStage.REPAIR]: { photos: [], expenses: 0 },
      [ServiceStage.SANDING]: { photos: [], expenses: 0 },
      [ServiceStage.PAINTING]: { photos: [], expenses: 0 },
      [ServiceStage.POLISHING]: { photos: [], expenses: 0 },
      [ServiceStage.WASHING]: { photos: [], expenses: 0 },
    },
    serviceValue: 7800,
    accumulatedCost: 0,
    workLog: [],
  },
   {
    id: '3',
    model: 'Onix',
    year: 2023,
    brand: 'Chevrolet',
    vin: '456GHI789JKL123',
    plate: 'QWE-9876',
    customer: 'Carlos Souza / (31) 99999-8888',
    images: [],
    deliveryDate: '2023-11-15',
    exitDate: '2023-11-20',
    description: 'Troca e pintura do para-lama esquerdo.',
    parts: [{ id: 'left-fender', name: 'Paralama Esquerdo', selected: true }],
    status: CarStatus.IN_PROGRESS,
    currentStage: ServiceStage.DISASSEMBLY,
    stageDetails: {
        [ServiceStage.DISASSEMBLY]: { photos: [], expenses: 0 },
        [ServiceStage.REPAIR]: { photos: [], expenses: 0 },
        [ServiceStage.SANDING]: { photos: [], expenses: 0 },
        [ServiceStage.PAINTING]: { photos: [], expenses: 0 },
        [ServiceStage.POLISHING]: { photos: [], expenses: 0 },
        [ServiceStage.WASHING]: { photos: [], expenses: 0 },
    },
    serviceValue: 1800,
    accumulatedCost: 0,
    workLog: [],
    hasUnreadUpdate: true,
  },
];

const initialEmployees: Employee[] = [
    { id: 'emp1', name: 'Ana Costa', role: EmployeeRole.PINTOR, phone: '11988887777', employeeId: 'P-001', password: '123', salary: 4500 },
    { id: 'emp2', name: 'Bruno Dias', role: EmployeeRole.MONTADOR, phone: '21977776666', employeeId: 'M-001', password: '123', salary: 3800 },
    { id: 'emp3', name: 'Carla Gerente', role: EmployeeRole.GERENTE, phone: '11999990000', employeeId: 'G-001', password: 'admin', salary: 8000 },
    { id: 'emp4', name: 'Funcionário Teste', role: EmployeeRole.LIXADOR, phone: '00000-0000', employeeId: '001', password: '001', salary: 2500 },
];

const initialStock: StockItem[] = [
    { id: 'stk1', name: 'Lixa 80', category: StockItemCategory.LIXA, unitOfMeasure: UnitOfMeasure.UNIDADES, currentQuantity: 100, minimumQuantity: 20, unitPrice: 2.50 },
    { id: 'stk2', name: 'Lixa 320', category: StockItemCategory.LIXA, unitOfMeasure: UnitOfMeasure.UNIDADES, currentQuantity: 95, minimumQuantity: 20, unitPrice: 2.80 },
    { id: 'stk3', name: 'Massa Poliéster', category: StockItemCategory.MASSA, unitOfMeasure: UnitOfMeasure.GRAMAS, currentQuantity: 5000, minimumQuantity: 1000, unitPrice: 0.045 }, // 45.00 per 1000g can
    { id: 'stk4', name: 'Primer PU', category: StockItemCategory.VERNIZ, unitOfMeasure: UnitOfMeasure.LITROS, currentQuantity: 10, minimumQuantity: 2, unitPrice: 80.00 },
    { id: 'stk5', name: 'Tinta Metálica Azul', category: StockItemCategory.TINTA, unitOfMeasure: UnitOfMeasure.ML, currentQuantity: 3000, minimumQuantity: 500, unitPrice: 0.15 }, // 150.00 per 1000ml can
    { id: 'stk6', name: 'Verniz HS', category: StockItemCategory.VERNIZ, unitOfMeasure: UnitOfMeasure.ML, currentQuantity: 4000, minimumQuantity: 1000, unitPrice: 0.12 }, // 120.00 per 1000ml can
];

const initialBudgets: Budget[] = [
    {
        id: 'budget1',
        creationDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        customerName: 'Fernanda Lima',
        customerPhone: '(41) 98877-6655',
        customerEmail: 'fernanda.lima@example.com',
        vehicleModel: 'Renegade',
        vehicleYear: 2021,
        vehicleBrand: 'Jeep',
        vehiclePlate: 'FER-2021',
        services: [{id: 's1', description: 'Reparo e pintura do para-choque traseiro', value: 1200}],
        totalValue: 1200,
        status: BudgetStatus.PENDING,
        images: [],
    },
    {
        id: 'budget2',
        creationDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        customerName: 'Ricardo Alves',
        customerPhone: '(51) 91122-3344',
        customerEmail: 'ricardo.alves@example.com',
        vehicleModel: 'Polo',
        vehicleYear: 2020,
        vehicleBrand: 'Volkswagen',
        vehiclePlate: 'RIC-2020',
        services: [{id: 's1', description: 'Polimento completo', value: 800}],
        totalValue: 800,
        status: BudgetStatus.APPROVED,
        images: [],
    }
];

const ExpiredView: React.FC<{ onSubscribe: () => void; onLogout: () => void }> = ({ onSubscribe, onLogout }) => {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg text-center bg-[var(--color-bg-secondary)] p-12 rounded-xl border border-[var(--color-border-primary)] shadow-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 10-2 0v5a1 1 0 102 0V7zM11 7a1 1 0 011 1v5a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <h1 className="mt-6 text-3xl font-bold">Seu período de avaliação terminou</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          Para continuar gerenciando sua oficina com o Oficina Manager, por favor, escolha um plano e ative sua assinatura.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onLogout} className="py-2 px-6 rounded-lg font-medium bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)] transition">
            Sair
          </button>
          <button onClick={onSubscribe} className="py-2 px-6 rounded-lg font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] transition">
            Ativar Assinatura
          </button>
        </div>
      </div>
    </main>
  );
};


const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | Employee | null>(null);
  const [activePortal, setActivePortal] = useState<'dashboard' | 'store' | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('oficina-theme') || 'theme-dark');
  
  // State for shared data
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [generalProblems, setGeneralProblems] = useState<GeneralProblem[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [issuedInvoices, setIssuedInvoices] = useState<IssuedInvoice[]>([]);
  const [workshopProfile, setWorkshopProfile] = useState<WorkshopProfile>({
    name: 'Oficina Manager',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    logo: '',
  });
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([
        ...initialEmployees
            .filter(e => e.salary && e.salary > 0)
            .map(e => ({
                id: `salary-${e.id}`,
                name: `Salário - ${e.name}`,
                monthlyCost: e.salary!,
                employeeId: e.id,
            }))
  ]);

  useEffect(() => {
    // Apply theme class to the root element
    const root = document.documentElement;
    root.className = theme;
    // Save theme to local storage
    localStorage.setItem('oficina-theme', theme);
  }, [theme]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = new Date().toISOString() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLogEntry: AuditLogEntry = {
        ...entry,
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
    };
    setAuditLog(prev => [newLogEntry, ...prev]);
  };

  const handleLogin = (authInfo: AuthInfo) => {
    let userToLogin = { ...authInfo.user };

    // Simulate first-time login for an admin and create a trial period
    if (!('role' in userToLogin) && !userToLogin.subscriptionStatus && authInfo.portal === 'dashboard') {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
        
        userToLogin = {
            ...userToLogin,
            subscriptionStatus: SubscriptionStatus.TRIAL,
            trialEndDate: trialEndDate.toISOString(),
        };
    }
    
    setLoggedInUser(userToLogin);
    setActivePortal(authInfo.portal);
    addNotification({ message: `Bem-vindo, ${authInfo.user.name}!`, type: 'success' });
  };
  
  const handleLogout = () => {
    setLoggedInUser(null);
    setActivePortal(null);
  };
  
  const handleSubscribe = () => {
      if (loggedInUser && 'subscriptionStatus' in loggedInUser) {
          const updatedUser = {
              ...loggedInUser,
              subscriptionStatus: SubscriptionStatus.ACTIVE,
              trialEndDate: undefined, // Clear trial date
          };
          setLoggedInUser(updatedUser as User | Employee);
          addNotification({ message: 'Assinatura ativada com sucesso! Obrigado.', type: 'success' });
      }
  };

  const handleAddCar = (newCarData: Omit<Car, 'id' | 'status' | 'currentStage' | 'stageDetails' | 'workLog' | 'accumulatedCost'>) => {
    const carToAdd: Car = {
      ...newCarData,
      id: new Date().toISOString(),
      status: CarStatus.IN_PROGRESS,
      currentStage: ServiceStage.DISASSEMBLY,
      stageDetails: {
        [ServiceStage.DISASSEMBLY]: { photos: [], expenses: 0 },
        [ServiceStage.REPAIR]: { photos: [], expenses: 0 },
        [ServiceStage.SANDING]: { photos: [], expenses: 0 },
        [ServiceStage.PAINTING]: { photos: [], expenses: 0 },
        [ServiceStage.POLISHING]: { photos: [], expenses: 0 },
        [ServiceStage.WASHING]: { photos: [], expenses: 0 },
      },
      accumulatedCost: 0,
      workLog: [],
    };
    setCars(prevCars => [carToAdd, ...prevCars]);
    addAuditLog({
        actorName: (loggedInUser as User)?.name || 'Admin',
        actorId: (loggedInUser as User)?.email || 'admin',
        action: 'CAR_ADDED',
        details: `Adicionou o carro ${carToAdd.brand} ${carToAdd.model} - ${carToAdd.plate}.`,
        targetId: carToAdd.id,
    });
    addNotification({ message: `Carro ${carToAdd.plate} adicionado com sucesso!`, type: 'success' });
  };

  const handleUpdateCar = (updatedCar: Car) => {
    setCars(prevCars => prevCars.map(car => car.id === updatedCar.id ? updatedCar : car));
  };
  
  const handleAddStockMovement = (movementData: Omit<StockMovement, 'id' | 'timestamp'>) => {
      const { stockItemId, type, quantity } = movementData;
      
      setStock(prevStock => {
          return prevStock.map(item => {
              if (item.id === stockItemId) {
                  const newQuantity = type === 'entrada'
                      ? item.currentQuantity + quantity
                      : Math.max(0, item.currentQuantity - quantity);
                  return { ...item, currentQuantity: newQuantity };
              }
              return item;
          });
      });

      const newMovement: StockMovement = {
          ...movementData,
          id: new Date().toISOString() + Math.random(),
          timestamp: new Date().toISOString(),
      };
      setStockMovements(prev => [newMovement, ...prev]);
  };

  const handleStageCompletion = (updatedCar: Car, materialsToDeduct: { name: string; quantity: number; unit: string }[]) => {
    // Flag the car for a visual update on the dashboard
    const carWithNotification = { ...updatedCar, hasUnreadUpdate: true };

    // 1. Update car state
    handleUpdateCar(carWithNotification);

    // 2. Update stock and log movements
    materialsToDeduct.forEach(itemToDeduct => {
      const stockItem = stock.find(s => s.name === itemToDeduct.name);
      if (stockItem) {
          // Normalization logic: convert all usage to the base unit of the stock item
          let quantityInBaseUnit = itemToDeduct.quantity;
          if (stockItem.unitOfMeasure === UnitOfMeasure.GRAMAS && itemToDeduct.unit === 'g') {
              // already correct
          } else if (stockItem.unitOfMeasure === UnitOfMeasure.ML && itemToDeduct.unit === 'ml') {
              // already correct
          } else if (stockItem.unitOfMeasure === UnitOfMeasure.LITROS && itemToDeduct.unit === 'ml') {
              quantityInBaseUnit /= 1000;
          }
          // Add more conversion rules if needed

          handleAddStockMovement({
              stockItemId: stockItem.id,
              stockItemName: stockItem.name,
              type: 'saída',
              quantity: quantityInBaseUnit,
              reason: 'Consumo em serviço',
              relatedCarPlate: updatedCar.plate,
              relatedStage: updatedCar.currentStage,
          });
      }
    });
    
    // 3. Add to audit log
    const lastLog = updatedCar.workLog[updatedCar.workLog.length - 1];
    addAuditLog({
      actorName: lastLog.employeeName,
      actorId: (loggedInUser as Employee)?.id,
      action: 'STAGE_COMPLETED',
      details: `Concluiu a etapa '${lastLog.stage}' para o carro ${updatedCar.plate}. Custo: ${lastLog.cost?.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'}) || 'N/A'}.`,
      targetId: updatedCar.id,
    });
    addNotification({ message: `Etapa '${lastLog.stage}' do carro ${updatedCar.plate} concluída.`, type: 'success' });
  };

  const handleRevertCarStage = (carId: string) => {
    const carToRevert = cars.find(c => c.id === carId);
    if (!carToRevert) return;

    const currentStageIndex = STAGES_ORDER.indexOf(carToRevert.currentStage);
    if (currentStageIndex <= 0) {
        addNotification({ message: 'Não é possível reverter a primeira etapa.', type: 'error' });
        return;
    }

    const previousStage = STAGES_ORDER[currentStageIndex - 1];
    
    // NEW LOGIC: Keep work log and accumulated cost, just change the stage.
    // The cost was incurred and materials used, so it should remain.
    const updatedCar: Car = {
        ...carToRevert,
        currentStage: previousStage,
        status: CarStatus.IN_PROGRESS, // Ensure status is 'in progress'
        hasUnreadUpdate: false, // Clear notification flag
    };

    setCars(prevCars => prevCars.map(car => car.id === carId ? updatedCar : car));
    
    addAuditLog({
        actorName: (loggedInUser as User)?.name || 'Admin',
        actorId: (loggedInUser as User)?.email || 'admin',
        action: 'STAGE_REVERTED',
        details: `Reverteu o carro ${updatedCar.plate} da etapa '${carToRevert.currentStage}' para '${previousStage}'. Histórico e custos da etapa anterior foram mantidos.`,
        targetId: updatedCar.id,
    });

    addNotification({ message: `Carro ${updatedCar.plate} revertido. Custos e histórico foram mantidos.`, type: 'info' });
  };
  
  const handleAddStockItem = (newItemData: Omit<StockItem, 'id'>) => {
    const itemToAdd: StockItem = { ...newItemData, id: new Date().toISOString() };
    setStock(prev => [itemToAdd, ...prev]);
    addAuditLog({
      actorName: (loggedInUser as User)?.name || 'Admin',
      actorId: (loggedInUser as User)?.email || 'admin',
      action: 'STOCK_ITEM_ADDED',
      details: `Adicionou item ao estoque: ${itemToAdd.name}.`,
      targetId: itemToAdd.id,
    });
    addNotification({ message: `Item "${itemToAdd.name}" adicionado ao estoque.`, type: 'success' });
  };

  const handleUpdateStockItem = (updatedItem: StockItem) => {
    const originalItem = stock.find(item => item.id === updatedItem.id);
    setStock(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));

    if (originalItem && originalItem.unitPrice !== updatedItem.unitPrice) {
        addAuditLog({
            actorName: (loggedInUser as User)?.name || 'Admin',
            actorId: (loggedInUser as User)?.email || 'admin',
            action: 'STOCK_ITEM_UPDATED',
            details: `Atualizou o preço de '${updatedItem.name}' de ${originalItem.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${updatedItem.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
            targetId: updatedItem.id,
        });
    }
  };

  const handleRemoveStockItem = (itemId: string) => {
    const itemToRemove = stock.find(item => item.id === itemId);
    if (itemToRemove) {
      setStock(prev => prev.filter(item => item.id !== itemId));
      addAuditLog({
        actorName: (loggedInUser as User)?.name || 'Admin',
        actorId: (loggedInUser as User)?.email || 'admin',
        action: 'STOCK_ITEM_REMOVED',
        details: `Removeu o item '${itemToRemove.name}' do estoque.`,
        targetId: itemToRemove.id,
      });
      addNotification({ message: `Item "${itemToRemove.name}" removido.`, type: 'info' });
    }
  };

  const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id'>) => {
      const employeeToAdd: Employee = { ...newEmployeeData, id: new Date().toISOString() };
      setEmployees(prev => [employeeToAdd, ...prev]);

      // Also add their salary as a fixed expense if it exists
      if (employeeToAdd.salary && employeeToAdd.salary > 0) {
        const salaryExpense: FixedExpense = {
          id: `salary-${employeeToAdd.id}`,
          name: `Salário - ${employeeToAdd.name}`,
          monthlyCost: employeeToAdd.salary,
          employeeId: employeeToAdd.id,
        };
        setFixedExpenses(prev => [...prev, salaryExpense]);
      }

      addAuditLog({
        actorName: (loggedInUser as Employee | User)?.name || 'Admin',
        actorId: (loggedInUser as Employee)?.id || (loggedInUser as User)?.email,
        action: 'EMPLOYEE_ADDED',
        details: `Registrou novo funcionário: ${employeeToAdd.name} (${employeeToAdd.role}).`,
        targetId: employeeToAdd.id,
    });
    addNotification({ message: `Funcionário ${employeeToAdd.name} registrado.`, type: 'success' });
  };
  
  const handleUpdateEmployee = (updatedEmployee: Employee) => {
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));

      // Update or add/remove the associated fixed expense for salary
      setFixedExpenses(prev => {
        const existingExpense = prev.find(exp => exp.employeeId === updatedEmployee.id);
        // If salary is defined and positive
        if (updatedEmployee.salary && updatedEmployee.salary > 0) {
          if (existingExpense) {
            // Update existing expense
            return prev.map(exp => exp.id === existingExpense.id ? { ...exp, monthlyCost: updatedEmployee.salary, name: `Salário - ${updatedEmployee.name}` } : exp);
          } else {
            // Add new expense
            return [...prev, { id: `salary-${updatedEmployee.id}`, name: `Salário - ${updatedEmployee.name}`, monthlyCost: updatedEmployee.salary, employeeId: updatedEmployee.id }];
          }
        } else {
          // If salary is zero or undefined, remove the expense
          return prev.filter(exp => exp.employeeId !== updatedEmployee.id);
        }
      });

      addAuditLog({
        actorName: (loggedInUser as Employee | User)?.name || 'Admin',
        actorId: (loggedInUser as Employee)?.id || (loggedInUser as User)?.email,
        action: 'EMPLOYEE_UPDATED',
        details: `Atualizou dados de ${updatedEmployee.name}.`,
        targetId: updatedEmployee.id,
    });
    addNotification({ message: `Dados de ${updatedEmployee.name} atualizados.`, type: 'info' });
  };
  
  const handleRemoveEmployee = (employeeId: string) => {
    const employeeToRemove = employees.find(e => e.id === employeeId);
    if(employeeToRemove) {
        setEmployees(prev => prev.filter(e => e.id !== employeeId));
        // Also remove their salary from fixed expenses
        setFixedExpenses(prev => prev.filter(exp => exp.employeeId !== employeeId));

        addAuditLog({
            actorName: (loggedInUser as User)?.name || 'Admin',
            actorId: (loggedInUser as User)?.email || 'admin',
            action: 'EMPLOYEE_REMOVED',
            details: `Removeu o funcionário ${employeeToRemove.name}.`,
            targetId: employeeId,
        });
        addNotification({ message: `Funcionário ${employeeToRemove.name} removido.`, type: 'info' });
    }
  };
  
  const handleAddBudget = (newBudgetData: Omit<Budget, 'id' | 'creationDate' | 'status'> & { status: BudgetStatus }) => {
      const budgetToAdd: Budget = {
          ...newBudgetData,
          id: new Date().toISOString(),
          creationDate: new Date().toISOString(),
          status: newBudgetData.status,
      };
      setBudgets(prev => [budgetToAdd, ...prev]);
      addNotification({ message: 'Novo orçamento criado com sucesso!', type: 'success' });
  };
  
  const handleUpdateBudget = (budgetId: string, newStatus: BudgetStatus) => {
    setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, status: newStatus } : b));
    addNotification({ message: `Orçamento atualizado para ${newStatus}.`, type: 'info' });
  };

  const handleUpdateBudgetDetails = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
    addNotification({ message: `Orçamento para o veículo ${updatedBudget.vehiclePlate} atualizado!`, type: 'success' });
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        // Fallback for safety, though it should always match for valid data URLs
        const blob = new Blob([]);
        return new File([blob], filename);
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleConvertBudgetToCar = (budget: Budget) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7); // Example: 1 week delivery
    const exitDate = new Date(today);
    exitDate.setDate(today.getDate() + 14); // Example: 2 week exit

    const carImages = budget.images 
        ? budget.images.map((imgDataUrl, index) => 
            dataURLtoFile(imgDataUrl, `budget-photo-${budget.vehiclePlate}-${index + 1}.jpg`)
          )
        : [];

    const carFromBudget: Omit<Car, 'id' | 'status' | 'currentStage' | 'stageDetails' | 'workLog' | 'accumulatedCost'> = {
        model: budget.vehicleModel,
        year: budget.vehicleYear,
        brand: budget.vehicleBrand,
        vin: '', // VIN not in budget
        plate: budget.vehiclePlate,
        customer: `${budget.customerName} / ${budget.customerPhone}`,
        images: carImages,
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        exitDate: exitDate.toISOString().split('T')[0],
        description: budget.services.map(s => s.description).join('; '),
        parts: [], // Parts not detailed in budget
        serviceValue: budget.totalValue,
    };
    handleAddCar(carFromBudget);
    handleUpdateBudget(budget.id, BudgetStatus.IN_SERVICE);
    addNotification({ message: `Carro ${budget.vehiclePlate} enviado para o fluxo de carros!`, type: 'success' });
  };


  const handleUpdateWorkshopProfile = (newProfile: WorkshopProfile) => {
    setWorkshopProfile(newProfile);
    addAuditLog({
      actorName: (loggedInUser as User)?.name || 'Admin',
      actorId: (loggedInUser as User)?.email || 'admin',
      action: 'PROFILE_UPDATED',
      details: 'Atualizou as informações de perfil da oficina.',
    });
    addNotification({ message: 'Perfil da oficina atualizado com sucesso!', type: 'success' });
  };

  const handleResolveProblem = (carId: string, workLogId: string) => {
    setCars(prevCars => {
        return prevCars.map(car => {
            if (car.id === carId) {
                const updatedWorkLog = car.workLog.map(log => {
                    if (log.id === workLogId) {
                        return { ...log, resolved: true };
                    }
                    return log;
                });

                // Check if any other unresolved problems exist for this car
                const hasOtherProblems = updatedWorkLog.some(log => log.notes?.startsWith('PROBLEMA:') && !log.resolved);
                
                return { ...car, workLog: updatedWorkLog, hasProblemReport: hasOtherProblems };
            }
            return car;
        });
    });
    addNotification({ message: `Problema resolvido.`, type: 'info' });
  };

  const handleAddFixedExpense = (newExpense: Omit<FixedExpense, 'id'>) => {
    const expenseToAdd: FixedExpense = {
        ...newExpense,
        id: new Date().toISOString(),
    };
    setFixedExpenses(prev => [expenseToAdd, ...prev]);
    addNotification({ message: 'Novo gasto fixo adicionado!', type: 'success' });
  };

  const handleReportStoreProblem = (reporterId: string, password: string, description: string): boolean => {
    const reporter = employees.find(e => e.id === reporterId);
    if (!reporter) {
        addNotification({ message: 'Funcionário não encontrado.', type: 'error' });
        return false;
    }

    if (reporter.password !== password) {
        // The modal will show its own error, but a general notification can also be useful.
        // Let's rely on the modal's error for now to avoid duplicate messages.
        return false;
    }

    const newProblem: GeneralProblem = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        reporterName: reporter.name,
        description: description,
        resolved: false,
    };

    setGeneralProblems(prev => [newProblem, ...prev]);

    addAuditLog({
        actorName: reporter.name,
        actorId: reporter.id,
        action: 'GENERAL_PROBLEM_REPORTED',
        details: `Relatou um problema geral: "${description}"`,
    });

    addNotification({ message: 'Problema relatado com sucesso.', type: 'success' });
    return true;
  };

  const handleResolveGeneralProblem = (problemId: string) => {
    setGeneralProblems(prev => prev.map(p => p.id === problemId ? { ...p, resolved: true } : p));
    addNotification({ message: 'Problema geral marcado como resolvido.', type: 'info' });
  };

  const handleAddPaymentRecord = (newPayment: Omit<PaymentRecord, 'id' | 'date'>) => {
    const paymentToAdd: PaymentRecord = {
        ...newPayment,
        id: new Date().toISOString(),
        date: new Date().toISOString(),
    };
    setPaymentRecords(prev => [...prev, paymentToAdd]);
    addAuditLog({
        actorName: (loggedInUser as User)?.name || 'Admin',
        actorId: (loggedInUser as User)?.email || 'admin',
        action: 'PAYMENT_MADE',
        details: `Realizou pagamento (${newPayment.type}) de ${newPayment.amount.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})} para ${newPayment.employeeName}.`,
        targetId: newPayment.employeeId,
    });
    addNotification({ message: `Pagamento para ${newPayment.employeeName} registrado.`, type: 'success' });
    return paymentToAdd;
  };

  const handleIssueInvoice = (invoiceData: Omit<IssuedInvoice, 'id' | 'dateIssued'>) => {
    const invoiceToAdd: IssuedInvoice = {
        ...invoiceData,
        id: new Date().toISOString(),
        dateIssued: new Date().toISOString(),
    };
    setIssuedInvoices(prev => [invoiceToAdd, ...prev]);
    addAuditLog({
        actorName: (loggedInUser as User)?.name || 'Admin',
        actorId: (loggedInUser as User)?.email || 'admin',
        action: 'INVOICE_ISSUED',
        details: `Emitiu nota fiscal para ${invoiceData.customerName} (Carro: ${invoiceData.carPlate}) no valor de ${invoiceData.totalValue.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}.`,
        targetId: invoiceData.carId,
    });
    addNotification({ message: `Nota fiscal para o carro ${invoiceData.carPlate} registrada.`, type: 'success' });
  };


  if (loggedInUser && activePortal === 'dashboard') {
    const userAsAdmin = loggedInUser as User;
    const isTrialExpired = userAsAdmin.subscriptionStatus === SubscriptionStatus.TRIAL && userAsAdmin.trialEndDate && new Date() > new Date(userAsAdmin.trialEndDate);

    if (userAsAdmin.subscriptionStatus === SubscriptionStatus.EXPIRED || isTrialExpired) {
       return (
         <>
           <ExpiredView onSubscribe={handleSubscribe} onLogout={handleLogout} />
           <NotificationContainer notifications={notifications} onRemove={removeNotification} />
         </>
       );
    }

    return (
      <>
        <Dashboard 
            user={userAsAdmin} 
            onLogout={handleLogout} 
            cars={cars}
            onAddCar={handleAddCar}
            onUpdateCar={handleUpdateCar}
            onRevertCarStage={handleRevertCarStage}
            onResolveProblem={handleResolveProblem}
            stock={stock}
            stockMovements={stockMovements}
            onAddStockItem={handleAddStockItem}
            onAddStockMovement={handleAddStockMovement}
            onUpdateStockItem={handleUpdateStockItem}
            onRemoveStockItem={handleRemoveStockItem}
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onRemoveEmployee={handleRemoveEmployee}
            auditLog={auditLog}
            addNotification={addNotification}
            workshopProfile={workshopProfile}
            onUpdateWorkshopProfile={handleUpdateWorkshopProfile}
            budgets={budgets}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onUpdateBudgetDetails={handleUpdateBudgetDetails}
            onConvertBudgetToCar={handleConvertBudgetToCar}
            fixedExpenses={fixedExpenses}
            onAddFixedExpense={handleAddFixedExpense}
            generalProblems={generalProblems}
            onResolveGeneralProblem={handleResolveGeneralProblem}
            paymentRecords={paymentRecords}
            onAddPaymentRecord={handleAddPaymentRecord}
            issuedInvoices={issuedInvoices}
            onIssueInvoice={handleIssueInvoice}
            theme={theme}
            setTheme={setTheme}
            onSubscribe={handleSubscribe}
          />
        <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      </>
    );
  }
  
  if (loggedInUser && activePortal === 'store') {
    return (
      <>
        <StorePortal 
            user={loggedInUser as Employee} 
            onLogout={handleLogout} 
            cars={cars}
            onUpdateCar={handleUpdateCar}
            onStageComplete={handleStageCompletion}
            employees={employees}
            stock={stock}
            addNotification={addNotification}
            onReportProblem={handleReportStoreProblem}
          />
        <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col items-center justify-center p-4 font-sans transition-all duration-500">
        <div className="w-full max-w-md">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Oficina Manager
            </h1>
          </header>
          <AuthForm onLogin={handleLogin} employees={employees} />
        </div>
      </main>
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </>
  );
};

export default App;