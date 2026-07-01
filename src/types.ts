export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface UserProfile {
  id: string; // 8-digit number string
  name: string;
  email: string;
  role: UserRole;
  telegramHandle?: string;
  position?: string;
  invitedBy?: string; // ID of the inviting user
  referralCode: string; // strictly Latin, lowercase
  bonusesEarned: number;
  invitedUsersCount: number;
}

export interface CompanyInfo {
  name: string;
  productDescription: string;
  workSystemDescription: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string; // ID of the manager
  employeeIds: string[]; // IDs of employees assigned to this department
  telegramChatId: string; // Chat or group ID where reports are posted
  parentId: string | null; // For hierarchical tree connections
}

export type ReportType = 'PLAN_DAY' | 'FACT_DAY' | 'WEEKLY' | 'MONTHLY';

export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'voice' | 'number' | 'checkbox';
  required: boolean;
}

export interface ReportTemplate {
  id: string;
  departmentId: string;
  title: string;
  type: ReportType;
  fields: ReportField[];
  employeeIds: string[]; // assigned employees who must fill it
  managerId: string; // manager who receives it
}

export interface SubmittedReport {
  id: string;
  templateId: string;
  templateTitle: string;
  type: ReportType;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  timestamp: string; // ISO String
  answers: Record<string, string | boolean>;
  aiRecommendations: string; // USP AI recommendations for employee
  qualityScore: number; // calculated quality score (1-100)
  voiceInputUsed: boolean;
  aiSummary?: string;
  managerComment?: string;
  managerTask?: string;
  managerReaction?: string;
  fieldComments?: Record<string, string>;
}

export type ScheduleTemplate = '5_2' | '2_2' | '6_1' | 'SHIFTS';
export type ShiftType = 'DAY' | 'NIGHT' | '24H' | 'OFF';

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  isHoliday?: boolean;
}

export interface EmployeeSchedule {
  employeeId: string;
  employeeName: string;
  template: ScheduleTemplate;
  schedules: Record<string, ShiftType>; // date -> shift type
}

export interface TariffState {
  activeEmployeesCount: number;
  expiresAt: string; // YYYY-MM-DD
  balance: number; // in rubles
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'TOPUP' | 'SPENT' | 'REFERRAL';
  date: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'REMINDER' | 'RECOMMENDATION' | 'SYSTEM';
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
