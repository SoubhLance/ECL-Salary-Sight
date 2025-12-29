import { createContext, useContext, useState, ReactNode } from 'react';

export interface EmployeeRecord {
  code: string;
  name: string;
  department: string;
  collieryArea: string;
  month: string;
  gross: string;
  net: string;
}

export const defaultEmployeeData: EmployeeRecord[] = [
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Jan 2024', gross: '₹1,35,000', net: '₹92,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Feb 2024', gross: '₹1,36,000', net: '₹93,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Mar 2024', gross: '₹1,37,000', net: '₹94,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Apr 2024', gross: '₹1,38,000', net: '₹94,500' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'May 2024', gross: '₹1,38,500', net: '₹95,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Jun 2024', gross: '₹1,39,000', net: '₹95,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Jan 2024', gross: '₹92,000', net: '₹75,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Feb 2024', gross: '₹93,000', net: '₹76,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Mar 2024', gross: '₹93,500', net: '₹77,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Apr 2024', gross: '₹94,000', net: '₹77,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'May 2024', gross: '₹94,500', net: '₹78,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Jun 2024', gross: '₹95,000', net: '₹78,500' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Jan 2024', gross: '₹1,45,000', net: '₹1,10,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Feb 2024', gross: '₹1,46,000', net: '₹1,11,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Mar 2024', gross: '₹1,47,000', net: '₹1,12,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Apr 2024', gross: '₹1,48,000', net: '₹1,13,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'May 2024', gross: '₹1,49,000', net: '₹1,14,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Jun 2024', gross: '₹1,50,000', net: '₹1,15,060' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', collieryArea: 'Sripur', month: 'Jan 2024', gross: '₹90,000', net: '₹80,000' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', collieryArea: 'Sripur', month: 'Feb 2024', gross: '₹91,000', net: '₹81,000' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', collieryArea: 'Sripur', month: 'Mar 2024', gross: '₹92,000', net: '₹82,000' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', collieryArea: 'Sripur', month: 'Apr 2024', gross: '₹93,000', net: '₹83,000' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', collieryArea: 'Sripur', month: 'May 2024', gross: '₹94,000', net: '₹84,000' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', collieryArea: 'Sripur', month: 'Jun 2024', gross: '₹95,000', net: '₹85,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', collieryArea: 'Rajmahal', month: 'Jan 2024', gross: '₹80,000', net: '₹70,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', collieryArea: 'Rajmahal', month: 'Feb 2024', gross: '₹81,000', net: '₹71,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', collieryArea: 'Rajmahal', month: 'Mar 2024', gross: '₹82,000', net: '₹72,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', collieryArea: 'Rajmahal', month: 'Apr 2024', gross: '₹83,000', net: '₹73,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', collieryArea: 'Rajmahal', month: 'May 2024', gross: '₹84,000', net: '₹74,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', collieryArea: 'Rajmahal', month: 'Jun 2024', gross: '₹85,000', net: '₹75,000' },
  { code: 'ECL006', name: 'Sanjay Verma', department: 'Mining', collieryArea: 'Kajora', month: 'Jan 2024', gross: '₹1,20,000', net: '₹88,000' },
  { code: 'ECL006', name: 'Sanjay Verma', department: 'Mining', collieryArea: 'Kajora', month: 'Feb 2024', gross: '₹1,21,000', net: '₹89,000' },
  { code: 'ECL006', name: 'Sanjay Verma', department: 'Mining', collieryArea: 'Kajora', month: 'Mar 2024', gross: '₹1,22,000', net: '₹90,000' },
  { code: 'ECL006', name: 'Sanjay Verma', department: 'Mining', collieryArea: 'Kajora', month: 'Apr 2024', gross: '₹1,23,000', net: '₹91,000' },
  { code: 'ECL006', name: 'Sanjay Verma', department: 'Mining', collieryArea: 'Kajora', month: 'May 2024', gross: '₹1,24,000', net: '₹92,000' },
  { code: 'ECL006', name: 'Sanjay Verma', department: 'Mining', collieryArea: 'Kajora', month: 'Jun 2024', gross: '₹1,25,000', net: '₹93,000' },
];

interface EmployeeDataContextType {
  employeeData: EmployeeRecord[];
  setEmployeeData: (data: EmployeeRecord[]) => void;
}

const EmployeeDataContext = createContext<EmployeeDataContextType | undefined>(undefined);

export const EmployeeDataProvider = ({ children }: { children: ReactNode }) => {
  const [employeeData, setEmployeeData] = useState<EmployeeRecord[]>(defaultEmployeeData);

  return (
    <EmployeeDataContext.Provider value={{ employeeData, setEmployeeData }}>
      {children}
    </EmployeeDataContext.Provider>
  );
};

export const useEmployeeData = () => {
  const context = useContext(EmployeeDataContext);
  if (!context) {
    throw new Error('useEmployeeData must be used within an EmployeeDataProvider');
  }
  return context;
};
