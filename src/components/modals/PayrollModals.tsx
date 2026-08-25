import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, PayrollEntry, Deduction } from '../../types';
import { todayISO, fmtDate, fmtNum } from '../../utils/formatters';

/* ---------------- REGISTER / EDIT EMPLOYEE MODAL ---------------- */
export const RegisterEmployeeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Employee | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { saveEmployee, showToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [joinedDate, setJoinedDate] = useState(todayISO());
  const [workType, setWorkType] = useState('');
  const [department, setDepartment] = useState<'Rice Mill' | 'Flour Mill' | 'Sales Team'>('Rice Mill');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPhone(initialData.phone || '');
        setJoinedDate(initialData.joinedDate);
        setWorkType(initialData.workType || '');
        setDepartment(initialData.department);
      } else {
        setName('');
        setPhone('');
        setJoinedDate(todayISO());
        setWorkType('');
        setDepartment('Rice Mill');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter the employee name');
      return;
    }
    saveEmployee(
      {
        id: initialData ? initialData.id : '',
        name: name.trim(),
        phone: phone.trim(),
        joinedDate,
        workType: workType.trim(),
        department,
      },
      !!initialData
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[620px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? 'Edit Employee' : 'Register Employee'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. K. Sunil" required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Telephone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Joined Date</label>
              <input type="date" value={joinedDate} onChange={(e) => setJoinedDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Type of Work</label>
              <input type="text" value={workType} onChange={(e) => setWorkType(e.target.value)} placeholder="e.g. Mill Operator" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">
                Department <span className="text-[11px] text-[#9AA69C] font-normal">(default)</span>
              </label>
              <select value={department} onChange={(e) => setDepartment(e.target.value as any)}>
                <option value="Rice Mill">Rice Mill</option>
                <option value="Flour Mill">Flour Mill</option>
                <option value="Sales Team">Sales Team</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------- VIEW EMPLOYEES MODAL ---------------- */
export const ViewEmployeesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onEditEmployee: (emp: Employee) => void;
}> = ({ isOpen, onClose, onOpenRegister, onEditEmployee }) => {
  const { employees, deleteEmployee } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">Registered Employees</h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="p-[22px_24px]">
          <div className="mb-[14px]">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
            >
              ＋ Register New Employee
            </button>
          </div>

          <div className="table-wrap border border-[#DEDACB] rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
                  <th className="p-[12px_16px] font-semibold">Name</th>
                  <th className="p-[12px_16px] font-semibold">Phone</th>
                  <th className="p-[12px_16px] font-semibold">Joined</th>
                  <th className="p-[12px_16px] font-semibold">Type of Work</th>
                  <th className="p-[12px_16px] font-semibold">Department</th>
                  <th className="p-[12px_16px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-[30px] text-[#4B564E] text-[13px]">
                      No employees registered yet.
                    </td>
                  </tr>
                ) : (
                  employees.map((e) => (
                    <tr key={e.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5]">
                      <td className="p-[12px_16px] text-[13.5px] font-medium">{e.name}</td>
                      <td className="p-[12px_16px] text-[13.5px]">{e.phone || '—'}</td>
                      <td className="p-[12px_16px] text-[13.5px] font-mono">{fmtDate(e.joinedDate)}</td>
                      <td className="p-[12px_16px] text-[13.5px]">{e.workType || '—'}</td>
                      <td className="p-[12px_16px] text-[13.5px]">
                        <span className="pay-chip cash">{e.department}</span>
                      </td>
                      <td className="p-[12px_16px] text-[13.5px]">
                        <div className="flex gap-[6px]">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              onClose();
                              onEditEmployee(e);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Delete "${e.name}"?`)) deleteEmployee(e.id);
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end p-[16px_24px] border-t border-[#DEDACB]">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- ADD / EDIT PAYROLL ENTRY MODAL ---------------- */
export const AddPayrollModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: PayrollEntry | null;
}> = ({ isOpen, onClose, initialData }) => {
  const { payrollWeek, payrollDept, employees, savePayrollEntry, showToast } = useApp();
  const [week, setWeek] = useState(payrollWeek);
  const [dept, setDept] = useState<'Rice Mill' | 'Flour Mill' | 'Sales Team'>(payrollDept);
  const [employeeId, setEmployeeId] = useState('');
  const [grossPay, setGrossPay] = useState<number | ''>('');
  const [deductions, setDeductions] = useState<Deduction[]>([]);

  const deptEmployees = employees.filter((e) => e.department === dept);
  const availableEmployees = deptEmployees.length > 0 ? deptEmployees : employees;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setWeek(initialData.weekEnding);
        setDept(initialData.department);
        setEmployeeId(initialData.employeeId);
        setGrossPay(initialData.grossPay);
        setDeductions(initialData.deductions.map((d) => ({ ...d })));
      } else {
        setWeek(payrollWeek);
        setDept(payrollDept);
        setEmployeeId(availableEmployees[0]?.id || '');
        setGrossPay('');
        setDeductions([]);
      }
    }
  }, [isOpen, initialData, payrollWeek, payrollDept, availableEmployees]);

  if (!isOpen) return null;

  const handleAddDeduction = () => {
    setDeductions([...deductions, { reason: '', amount: 0 }]);
  };

  const handleDeductionChange = (index: number, field: keyof Deduction, val: any) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: val };
    setDeductions(updated);
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const gPay = Number(grossPay) || 0;
  const dedTotal = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const netPay = gPay - dedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      showToast('Please select an employee');
      return;
    }
    if (gPay <= 0) {
      showToast('Enter the gross pay');
      return;
    }

    const validDeductions = deductions.filter((d) => d.amount > 0);

    savePayrollEntry(
      {
        id: initialData ? initialData.id : 0,
        weekEnding: week,
        department: dept,
        employeeId,
        grossPay: gPay,
        deductions: validDeductions,
        netPay,
      },
      !!initialData
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(27,36,32,0.5)] z-[100] flex items-center justify-center p-[24px]">
      <div className="bg-white rounded-[14px] w-full max-w-[760px] max-h-[88vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between p-[18px_24px] border-b border-[#DEDACB] sticky top-0 bg-white z-2">
          <h3 className="m-0 text-[18px] font-semibold text-[#1B2420]">
            {initialData ? 'Edit Payroll Entry' : 'Add Payroll Entry'}
          </h3>
          <button type="button" className="text-[20px] text-[#4B564E] hover:text-[#1B2420] border-none bg-transparent cursor-pointer leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-[22px_24px] grid grid-cols-1 md:grid-cols-2 gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Week Ending (Saturday)</label>
              <input type="date" value={week} onChange={(e) => setWeek(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Department</label>
              <select
                value={dept}
                onChange={(e) => {
                  const newDept = e.target.value as any;
                  setDept(newDept);
                  const filtered = employees.filter((emp) => emp.department === newDept);
                  if (filtered.length > 0) setEmployeeId(filtered[0].id);
                }}
              >
                <option value="Rice Mill">Rice Mill</option>
                <option value="Flour Mill">Flour Mill</option>
                <option value="Sales Team">Sales Team</option>
              </select>
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Employee</label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.workType || emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-full flex flex-col gap-[6px]">
              <label className="text-[12px] font-semibold text-[#4B564E]">Gross Pay (LKR)</label>
              <input
                type="number"
                value={grossPay}
                onChange={(e) => setGrossPay(Number(e.target.value) || '')}
                placeholder="e.g. 18000"
                min="1"
                required
              />
            </div>

            <div className="col-span-full mt-[4px]">
              <label className="text-[12px] font-semibold text-[#4B564E] block mb-[8px]">
                Deductions <span className="text-[11px] text-[#9AA69C] font-normal">(loans, advances, etc. — optional)</span>
              </label>
              <div className="variety-rows">
                <div className="vr-head grid-cols-[1.6fr_1fr_32px]">
                  <div>Reason</div>
                  <div>Amount</div>
                  <div></div>
                </div>
                {deductions.map((ded, idx) => (
                  <div key={idx} className="vr-row grid-cols-[1.6fr_1fr_32px]">
                    <input
                      type="text"
                      value={ded.reason}
                      onChange={(e) => handleDeductionChange(idx, 'reason', e.target.value)}
                      placeholder="e.g. Loan Repayment"
                    />
                    <input
                      type="number"
                      value={ded.amount || ''}
                      onChange={(e) => handleDeductionChange(idx, 'amount', Number(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                    <button type="button" className="vr-remove" onClick={() => handleRemoveDeduction(idx)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <span className="add-variety-link mt-[4px]" onClick={handleAddDeduction}>
                + Add another deduction
              </span>
            </div>

            <div className="col-span-full totals-strip">
              <div>
                Net Pay: <b className="mono text-[#1E3E2E]">LKR {fmtNum(netPay)}</b>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-[10px] p-[16px_24px] border-t border-[#DEDACB]">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Payroll Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
