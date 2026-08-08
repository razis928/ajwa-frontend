/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Employee,
  EmployeeRole,
  EMPLOYEE_ROLES,
  ROLE_DEPARTMENT,
} from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { formatPKR } from '../lib/currency';

type Tab = 'directory' | 'salaries';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'Waiter' as EmployeeRole,
  joinDate: new Date().toISOString().split('T')[0],
  salary: 25000,
  salaryStatus: 'Pending' as const,
  status: 'Active' as const,
};

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    markSalaryPaid,
    markAllSalariesPaid,
    searchQuery,
  } = useApp();

  const [tab, setTab] = useState<Tab>('directory');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const query = searchQuery.toLowerCase();
  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(query) ||
    e.email.toLowerCase().includes(query) ||
    e.role.toLowerCase().includes(query) ||
    e.department.toLowerCase().includes(query) ||
    e.phone.includes(searchQuery)
  );

  const payroll = useMemo(() => {
    const active = employees.filter(e => e.status === 'Active');
    return active.reduce(
      (acc, e) => {
        acc.total += e.salary;
        if (e.salaryStatus === 'Paid') acc.paid += e.salary;
        else acc.pending += e.salary;
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [employees]);

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const pendingCount = employees.filter(e => e.status === 'Active' && e.salaryStatus === 'Pending').length;

  const openAdd = () => {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      joinDate: employee.joinDate,
      salary: employee.salary,
      salaryStatus: employee.salaryStatus,
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      department: ROLE_DEPARTMENT[form.role],
      joinDate: form.joinDate,
      salary: Number(form.salary) || 0,
      salaryStatus: form.salaryStatus,
      status: form.status,
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, payload);
    } else {
      addEmployee(payload);
    }
    setShowModal(false);
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
  };

  const handleToggleStatus = (employee: Employee) => {
    updateEmployee(employee.id, {
      status: employee.status === 'Active' ? 'Inactive' : 'Active',
    });
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="page-title">Employee Management</h2>
          <p className="page-subtitle">
            Manage restaurant staff, roles, and monthly payroll in one place.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('directory')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'directory'
              ? 'bg-ajwa-forest text-ajwa-gold-light shadow-sm'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-amber-300'
          }`}
        >
          Staff Directory
        </button>
        <button
          onClick={() => setTab('salaries')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'salaries'
              ? 'bg-ajwa-forest text-ajwa-gold-light shadow-sm'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:border-amber-300'
          }`}
        >
          Salaries & Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">Headcount</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Staff</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{activeCount}</h3>
        </div>
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">August 2026</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Payroll</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{formatPKR(payroll.total)}</h3>
        </div>
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase">Settled</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Paid This Month</p>
          <h3 className="text-xl font-bold text-zinc-900 mt-1">{formatPKR(payroll.paid)}</h3>
        </div>
        <div className="card p-5">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 rounded-xl bg-yellow-50 text-yellow-700">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-yellow-700 text-[10px] font-bold uppercase">{pendingCount} pending</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outstanding</p>
          <h3 className="text-xl font-bold text-yellow-700 mt-1">{formatPKR(payroll.pending)}</h3>
        </div>
      </div>

      {tab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div
              key={employee.id}
              className={`card p-5 space-y-4 hover:border-amber-300 transition-all ${
                employee.status === 'Inactive' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-800 text-sm font-sans">{employee.name}</h3>
                  <p className="text-[11px] text-zinc-500 font-semibold">{employee.role}</p>
                  <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                    {employee.department}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(employee)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                    employee.status === 'Active'
                      ? 'badge-success'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                  }`}
                >
                  {employee.status}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                  <div className="text-amber-700 font-bold uppercase text-[9px]">Salary</div>
                  <p className="text-sm font-bold text-amber-800 mt-1 font-mono">
                    {formatPKR(employee.salary)}
                  </p>
                </div>
                <div className={`p-2 rounded-xl border ${
                  employee.salaryStatus === 'Paid'
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-yellow-50 border-yellow-100'
                }`}>
                  <div className={`font-bold uppercase text-[9px] ${
                    employee.salaryStatus === 'Paid' ? 'text-emerald-700' : 'text-yellow-700'
                  }`}>
                    Payroll
                  </div>
                  <p className={`text-sm font-bold mt-1 ${
                    employee.salaryStatus === 'Paid' ? 'text-emerald-800' : 'text-yellow-800'
                  }`}>
                    {employee.salaryStatus}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-500 pt-1 border-t border-zinc-50">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Joined: <strong className="text-zinc-600">{employee.joinDate}</strong></span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => openEdit(employee)} className="btn-danger">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(employee)} className="btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full card p-10 text-center text-sm text-zinc-400">
              No employees match your search.
            </div>
          )}
        </div>
      )}

      {tab === 'salaries' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Monthly Salary Register
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Total salary {formatPKR(payroll.total)}
              </p>
            </div>
            <button
              onClick={markAllSalariesPaid}
              className="btn-primary flex items-center gap-2 text-xs"
              disabled={pendingCount === 0}
            >
              <BadgeCheck className="w-4 h-4" />
              Pay All Pending
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50">
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3 text-right">Salary</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {filteredEmployees.map(employee => (
                    <tr
                      key={employee.id}
                      className={`hover:bg-amber-50/30 transition-colors ${
                        employee.status === 'Inactive' ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-800">{employee.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{employee.role}</td>
                      <td className="px-6 py-4 text-zinc-500">{employee.department}</td>
                      <td className="px-6 py-4 text-right font-bold font-mono text-zinc-900">{formatPKR(employee.salary)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={employee.salaryStatus === 'Paid' ? 'badge-success' : 'badge-warning'}>
                          {employee.salaryStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {employee.salaryStatus === 'Pending' && employee.status === 'Active' && (
                            <button
                              onClick={() => markSalaryPaid(employee.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button onClick={() => openEdit(employee)} className="btn-danger">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50 font-bold text-zinc-800">
                  <td className="px-6 py-4" colSpan={3}>Active payroll total</td>
                  <td className="px-6 py-4 text-right font-mono">{formatPKR(payroll.total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title={editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Employee'}
          onClose={() => { setShowModal(false); setEditingEmployee(null); }}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col">
              <label className="label-field">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label-field">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div className="flex flex-col">
                <label className="label-field">Phone</label>
                <input type="text" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label-field">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as EmployeeRole })}
                  className="input-field"
                >
                  {EMPLOYEE_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="label-field">Join Date</label>
                <input type="date" required value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="label-field">Salary (PKR)</label>
              <input type="number" min={0} required value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="label-field">Employment Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as Employee['status'] })}
                  className="input-field"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="label-field">Salary Status</label>
                <select
                  value={form.salaryStatus}
                  onChange={e => setForm({ ...form, salaryStatus: e.target.value as Employee['salaryStatus'] })}
                  className="input-field"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400">
              Department is set automatically from role: <strong className="text-zinc-600">{ROLE_DEPARTMENT[form.role]}</strong>
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{editingEmployee ? 'Save Changes' : 'Add Employee'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to remove "${deleteTarget.name}" from the staff directory? This action cannot be undone.`}
          onConfirm={() => { deleteEmployee(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
