// types.ts

export enum UserType {
  ADMIN = 'Administrador',
  EMPLOYEE = 'Funcionário',
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export interface User {
  name: string;
  email: string;
  userType: UserType;
  subscriptionStatus?: SubscriptionStatus;
  trialEndDate?: string; // ISO string
}

export interface WorkshopProfile {
    name: string;
    taxId: string; // CPF or CNPJ
    phone: string;
    email: string;
    address: string;
    logo?: string; // Base64 encoded logo image
}

// NOTE: StoreUser is deprecated in favor of using the full Employee object for logged-in store personnel.
export interface StoreUser {
  store: string;
  employeeId: string;
  name: string;
}

// Employee Management type
export enum EmployeeRole {
    MONTADOR = 'Montador',
    REPARADOR = 'Reparador',
    LIXADOR = 'Lixador',
    PINTOR = 'Pintor',
    POLIDOR = 'Polidor',
    LAVADOR = 'Lavador',
    GERENTE = 'Gerente de Loja',
}

export interface Employee {
    id: string;
    name: string;
    role: EmployeeRole;
    phone?: string;
    employeeId?: string;
    password?: string;
    salary?: number; // New field for monthly salary
}

// Car Flow feature types
export enum ServiceStage {
  DISASSEMBLY = 'Desmontagem',
  REPAIR = 'Reparo e Primer',
  SANDING = 'Lixamento',
  PAINTING = 'Pintura',
  POLISHING = 'Polimento',
  WASHING = 'Lavagem',
}

export enum CarStatus {
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  HISTORY = 'Histórico',
}

export type CarPart = {
  id: string;
  name: string;
  selected: boolean;
};

export type StageDetail = {
  photos: File[];
  expenses: number;
  details?: Record<string, any>;
};

export interface WorkLog {
    id: string;
    timestamp: string;
    stage: ServiceStage;
    employeeName: string;
    notes?: string;
    photos?: File[];
    materialsUsed?: { name: string; quantity: number | string }[];
    cost?: number;
    resolved?: boolean; // New field for tracking problem resolution
}

export interface Car {
  id: string;
  model: string;
  year: number;
  brand: string;
  vin: string;
  plate: string;
  customer: string;
  images: File[];
  deliveryDate: string;
  exitDate: string;
  description: string;
  parts: CarPart[];
  status: CarStatus;
  currentStage: ServiceStage;
  stageDetails: Record<ServiceStage, StageDetail>;
  serviceValue: number;
  accumulatedCost: number; // New field to track material costs
  workLog: WorkLog[];
  hasUnreadUpdate?: boolean; // For green dot notification
  hasProblemReport?: boolean; // For red dot notification
}

// Materials Management feature type - DEPRECATED in favor of StockItem
export interface Material {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  carId?: string;
  carPlate?: string;
}

// Stock Management feature types
export enum StockItemCategory {
    LIXA = 'Lixa',
    TINTA = 'Tinta',
    MASSA = 'Massa',
    VERNIZ = 'Verniz',
    FERRAMENTA = 'Ferramenta',
    OUTROS = 'Outros',
}

export enum UnitOfMeasure {
    UNIDADES = 'unidades',
    GRAMAS = 'gramas',
    ML = 'ml',
    LITROS = 'litros',
    FOLHAS = 'folhas',
}

export interface StockItem {
    id: string;
    name: string;
    category: StockItemCategory;
    unitOfMeasure: UnitOfMeasure;
    currentQuantity: number;
    minimumQuantity: number;
    unitPrice: number;
    supplier?: string;
    expiryDate?: string;
}

export interface StockMovement {
    id: string;
    stockItemId: string;
    stockItemName: string; // denormalized for easier display
    type: 'entrada' | 'saída';
    quantity: number;
    reason: 'Compra' | 'Ajuste' | 'Perda' | 'Consumo em serviço' | 'Consumo não vinculado';
    timestamp: string;
    relatedCarPlate?: string;
    relatedStage?: ServiceStage;
}


// Fixed Expenses feature type
export interface FixedExpense {
  id: string;
  name: string;
  monthlyCost: number;
  employeeId?: string; // Link expense to an employee
  isOneTimePurchase?: boolean; // To distinguish from recurring costs
  purchaseDate?: string; // Date for one-time purchases
  invoiceImage?: string; // Base64 encoded invoice image
}

// Budgets feature types
export enum BudgetStatus {
    PENDING = 'Pendente',
    APPROVED = 'Aprovado',
    REJECTED = 'Rejeitado',
    IN_SERVICE = 'Em Serviço',
}

export interface BudgetService {
    id: string;
    description: string;
    value: number;
}

export interface Budget {
    id: string;
    creationDate: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleBrand: string;
    vehiclePlate: string;
    services: BudgetService[];
    totalValue: number;
    status: BudgetStatus;
    images?: string[]; // Array of Base64 encoded images
}

// Audit Log feature type
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorName: string;
    actorId: string;
    action: 'CAR_ADDED' | 'STAGE_COMPLETED' | 'STAGE_REVERTED' | 'MATERIAL_ADDED' | 'EMPLOYEE_ADDED' | 'EMPLOYEE_UPDATED' | 'EMPLOYEE_REMOVED' | 'PROBLEM_REPORTED' | 'GENERAL_PROBLEM_REPORTED' | 'STOCK_ITEM_ADDED' | 'STOCK_MOVEMENT' | 'STOCK_ITEM_UPDATED' | 'STOCK_ITEM_REMOVED' | 'PROFILE_UPDATED' | 'PAYMENT_MADE' | 'INVOICE_ISSUED';
    details: string;
    targetId?: string; // e.g., car.id or employee.id
}

// General Problem type (not tied to a car)
export interface GeneralProblem {
    id: string;
    timestamp: string;
    reporterName: string;
    description: string;
    resolved: boolean;
}


// UI Notification type
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

// Payroll feature type
export interface PaymentRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    type: 'Salário' | 'Vale'; // Salary or Advance
    amount: number;
    notes?: string;
}

// Invoice History feature type
export interface IssuedInvoice {
    id: string;
    dateIssued: string;
    carId: string;
    carPlate: string;
    customerName: string;
    totalValue: number;
    type: 'income';
    invoiceImage?: string; // Base64 encoded invoice image
}