import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RegisterEmployeeModal,
  ViewEmployeesModal,
  AddPayrollModal,
} from '../modals/PayrollModals';
import { Employee, PayrollEntry } from '../../types';
import { fmtDate, fmtNum } from '../../utils/formatters';

export const PayrollModule: React.FC = () => {
  const {
    payrollWeek,
    setPayrollWeek,
    payrollDept,
    setPayrollDept,
    payrollEntries,
    employeeById,
    payrollSummary,
    deletePayrollEntry,
    showToast,
  } = useApp();

  // Modals
  const [isRegisterEmployeeOpen, setIsRegisterEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isViewEmployeesOpen, setIsViewEmployeesOpen] = useState(false);

  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollEntry | null>(null);

  const summary = payrollSummary();

  // Filter entries
  const filteredEntries = payrollEntries.filter(
    (e) => e.weekEnding === payrollWeek && e.department === payrollDept
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-[22px] flex-wrap gap-[10px]">
        <h1 className="text-[26px] font-semibold m-0 text-[#1B2420]">Payroll</h1>
      </div>

      {/* Week Selector & Department Switcher */}
      <div className="flex items-center gap-[14px] flex-wrap bg-white border border-[#DEDACB] rounded-[10px] p-[14px_16px] mb-[20px]">
        <div className="flex items-center gap-[8px]">
          <label className="text-[12px] font-semibold text-[#4B564E]">Week Ending (Saturday)</label>
          <input
            type="date"
            value={payrollWeek}
            onChange={(e) => setPayrollWeek(e.target.value)}
            className="font-medium"
          />
        </div>

        <div className="flex items-center gap-[6px] ml-[8px]">
          <button
            type="button"
            className={`subtab-pill ${payrollDept === 'Rice Mill' ? 'active' : ''}`}
            onClick={() => setPayrollDept('Rice Mill')}
          >
            Rice Mill
          </button>
          <button
            type="button"
            className={`subtab-pill ${payrollDept === 'Flour Mill' ? 'active' : ''}`}
            onClick={() => setPayrollDept('Flour Mill')}
          >
            Flour Mill
          </button>
          <button
            type="button"
            className={`subtab-pill ${payrollDept === 'Sales Team' ? 'active' : ''}`}
            onClick={() => setPayrollDept('Sales Team')}
          >
            Sales Team
          </button>
        </div>

        <div className="grow" />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => showToast(`Printing paysheets for week ending ${fmtDate(payrollWeek)}…`)}
        >
          🖨 Print Weekly Pay Sheets
        </button>
      </div>

      {/* Stats Summary for Department & Week */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[26px]">
        <div className="bg-[#1E3E2E] border border-[#1E3E2E] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#BFD1C4] font-medium mb-[8px]">Total Net Pay ({payrollDept})</div>
          <div className="text-[26px] font-semibold text-[#FBF7EC] font-serif">LKR {fmtNum(summary.deptNetPay)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Gross Pay ({payrollDept})</div>
          <div className="text-[26px] font-semibold text-[#1B2420] font-serif">LKR {fmtNum(summary.deptGrossPay)}</div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">Total Deductions</div>
          <div className="text-[26px] font-semibold text-[#A63D2C] font-serif">
            LKR {fmtNum(summary.deptDeductions)}
          </div>
        </div>

        <div className="bg-white border border-[#DEDACB] rounded-[10px] p-[18px_20px] shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)] relative overflow-hidden">
          <div className="text-[12px] text-[#4B564E] font-medium mb-[8px]">All Departments Net Total</div>
          <div className="text-[26px] font-semibold text-[#7A5518] font-serif">
            LKR {fmtNum(summary.allDeptsNetPay)}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-[10px] mb-[22px] flex-wrap items-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingPayroll(null);
            setIsAddPayrollOpen(true);
          }}
        >
          ＋ Add Payroll Entry
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditingEmployee(null);
            setIsRegisterEmployeeOpen(true);
          }}
        >
          ＋ Register Employee
        </button>
        <button type="button" className="btn" onClick={() => setIsViewEmployeesOpen(true)}>
          👁 View Employees
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          onClick={() => showToast('Preparing CSV export of Payroll…')}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border border-[#DEDACB] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(27,36,32,0.06),0_6px_16px_rgba(27,36,32,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-[#E7EFE9] text-left text-[11px] uppercase tracking-[0.5px] text-[#4B564E]">
              <th className="p-[12px_16px] font-semibold">Employee</th>
              <th className="p-[12px_16px] font-semibold">Role / Work Type</th>
              <th className="p-[12px_16px] font-semibold">Gross Pay</th>
              <th className="p-[12px_16px] font-semibold">Deductions</th>
              <th className="p-[12px_16px] font-semibold">Net Pay</th>
              <th className="p-[12px_16px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-[40px] text-[#4B564E] text-[13px]">
                  No payroll records for {payrollDept} in week ending {fmtDate(payrollWeek)}. Click “Add Payroll Entry” to create one.
                </td>
              </tr>
            ) : (
              filteredEntries.map((pe) => {
                const emp = employeeById(pe.employeeId);
                const totalDed = pe.deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);

                return (
                  <tr key={pe.id} className="border-b border-[#EAE7DA] hover:bg-[#FBFAF5] transition-colors">
                    <td className="p-[14px_16px] text-[13.5px] font-medium">{emp ? emp.name : '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px]">{emp?.workType || '—'}</td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold">
                      LKR {fmtNum(pe.grossPay)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      {pe.deductions.length === 0 ? (
                        <span className="text-[#9AA69C]">None</span>
                      ) : (
                        <div>
                          <span className="font-mono text-[#A63D2C]">LKR {fmtNum(totalDed)}</span>
                          <div className="text-[11px] text-[#9AA69C]">
                            {pe.deductions.map((d) => `${d.reason}: ${fmtNum(d.amount)}`).join(', ')}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px] font-mono font-semibold text-[#1E3E2E]">
                      LKR {fmtNum(pe.netPay)}
                    </td>
                    <td className="p-[14px_16px] text-[13.5px]">
                      <div className="flex gap-[6px]">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingPayroll(pe);
                            setIsAddPayrollOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete"
                          onClick={() => {
                            if (confirm('Delete this payroll entry?')) deletePayrollEntry(pe.id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        <div className="flex justify-between items-center p-[10px_16px] text-[12px] text-[#4B564E] border-t border-[#EAE7DA]">
          <span>
            {filteredEntries.length} employee{filteredEntries.length !== 1 ? 's' : ''} in {payrollDept}
          </span>
          <span>Rice Mill ERP · Weekly Payroll</span>
        </div>
      </div>

      {/* Modals */}
      <RegisterEmployeeModal
        isOpen={isRegisterEmployeeOpen}
        initialData={editingEmployee}
        onClose={() => {
          setIsRegisterEmployeeOpen(false);
          setEditingEmployee(null);
        }}
      />
      <ViewEmployeesModal
        isOpen={isViewEmployeesOpen}
        onClose={() => setIsViewEmployeesOpen(false)}
        onOpenRegister={() => {
          setEditingEmployee(null);
          setIsRegisterEmployeeOpen(true);
        }}
        onEditEmployee={(emp) => {
          setEditingEmployee(emp);
          setIsRegisterEmployeeOpen(true);
        }}
      />
      <AddPayrollModal
        isOpen={isAddPayrollOpen}
        initialData={editingPayroll}
        onClose={() => {
          setIsAddPayrollOpen(false);
          setEditingPayroll(null);
        }}
      />
    </div>
  );
};
