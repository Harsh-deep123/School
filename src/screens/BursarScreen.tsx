import { useMemo, useState } from 'react';
import { Check, Download, Mail, Search } from 'lucide-react';
import { BursarInvoice, InvoiceStatus } from '../data/academicData';
import { CustomCheckbox } from '../components/CustomCheckbox';
import { StatusIndicator } from '../components/StatusIndicator';
import { ParallaxReveal } from '../components/ParallaxLayer';

interface BursarScreenProps {
  invoices: BursarInvoice[];
  onMarkInvoicesPaid: (invoiceIds: string[]) => void;
  onSendReminders: (invoiceIds: string[]) => void;
}

type InvoiceFilter = 'All' | InvoiceStatus;

export function BursarScreen({
  invoices,
  onMarkInvoicesPaid,
  onSendReminders,
}: BursarScreenProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceFilter>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const totals = useMemo(() => {
    const gross = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = invoices
      .filter((inv) => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pending = invoices
      .filter((inv) => inv.status === 'Pending')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const unpaid = invoices
      .filter((inv) => inv.status === 'Unpaid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { gross, paid, pending, unpaid };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesStatus =
        statusFilter === 'All' || inv.status === statusFilter;
      const matchesQuery =
        !q ||
        inv.studentName.toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q) ||
        inv.description.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [invoices, query, statusFilter]);

  const allVisibleSelected =
    filteredInvoices.length > 0 &&
    filteredInvoices.every((inv) => selectedIds.includes(inv.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((inv) => inv.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice ID',
      'Student ID',
      'Student Name',
      'Division',
      'Term',
      'Description',
      'Due Date',
      'Amount USD',
      'Status',
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.id,
      inv.studentId,
      `"${inv.studentName}"`,
      `"${inv.division}"`,
      inv.term,
      `"${inv.description}"`,
      inv.dueDate,
      inv.amount.toString(),
      inv.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'academic-intelligence-bursar-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: 'Gross Term Billed',
      amount: totals.gross,
      note: `${invoices.length} active ledger entries`,
      accent: 'text-[#0b1c30]',
    },
    {
      label: 'Cleared Payments',
      amount: totals.paid,
      note: `${Math.round((totals.paid / Math.max(1, totals.gross)) * 100)}% collected`,
      accent: 'text-[#047857]',
    },
    {
      label: 'Pending Disbursements',
      amount: totals.pending,
      note: 'Scheduled installment plans',
      accent: 'text-[#b45309]',
    },
    {
      label: 'Overdue Balances',
      amount: totals.unpaid,
      note: 'Requires bursar follow-up',
      accent: 'text-[#be123c]',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <ParallaxReveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight">
              Bursar &amp; Tuition Ledger
            </h1>
            <p className="text-sm text-[#434655] mt-1">
              Institutional fee assessments, payment clearances, and delinquency tracking for Fall 2026.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-4 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-[#1e293b] hover:bg-[#f8fafc] hover:border-[#cbd5e1] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </ParallaxReveal>

      {/* Fiscal Summary Strip */}
      <ParallaxReveal delay={0.04}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {summaryCards.map((card) => (
            <div key={card.label} className="card-level-1 rounded-2xl p-5">
              <span className="text-xs font-semibold text-[#434655]">
                {card.label}
              </span>
              <div
                className={`font-display text-2xl md:text-3xl font-bold tabular-nums mt-2 ${card.accent}`}
              >
                ${card.amount.toLocaleString()}
              </div>
              <p className="text-xs text-[#737686] mt-1">{card.note}</p>
            </div>
          ))}
        </div>
      </ParallaxReveal>

      {/* Filter & Bulk Action Toolbar */}
      <ParallaxReveal delay={0.08}>
        <div className="card-level-1 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoice ID, student, or fee..."
                aria-label="Search bursar invoices"
                className="input-academic w-full pl-9 pr-3 text-sm text-[#0b1c30] placeholder:text-[#94a3b8]"
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 pl-2 border-l border-[#e2e8f0]">
                <span className="text-xs font-semibold text-[#0b1c30] tabular-nums">
                  {selectedIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onMarkInvoicesPaid(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="h-9 px-3 rounded-lg bg-[#2563eb] text-xs font-semibold text-white hover:bg-[#1d4ed8] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Paid</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSendReminders(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="h-9 px-3 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-[#0b1c30] hover:bg-[#f8fafc] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Notice</span>
                </button>
              </div>
            )}
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#eff4ff] self-start lg:self-auto"
            role="tablist"
            aria-label="Filter invoices by status"
          >
            {(['All', 'Paid', 'Pending', 'Unpaid'] as InvoiceFilter[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === status
                      ? 'bg-white text-[#0b1c30] shadow-xs'
                      : 'text-[#434655] hover:text-[#0b1c30]'
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>
      </ParallaxReveal>

      {/* Ledger Table */}
      <ParallaxReveal delay={0.12}>
        <div className="card-level-1 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-3 w-10">
                    <CustomCheckbox
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      ariaLabel="Select all visible invoices"
                    />
                  </th>
                  <th className="py-3.5 px-4">Invoice &amp; Student</th>
                  <th className="py-3.5 px-4">Assessment Description</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-sm">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#eff4ff]/70' : 'hover:bg-[#f8fafc]'
                      }`}
                    >
                      <td className="py-3.5 pl-6 pr-3">
                        <CustomCheckbox
                          checked={isSelected}
                          onChange={() => toggleSelectOne(inv.id)}
                          ariaLabel={`Select invoice ${inv.id}`}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0b1c30]">
                          {inv.studentName}
                        </div>
                        <div className="font-mono text-xs text-[#737686] tabular-nums">
                          {inv.id} · {inv.studentId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#0b1c30]">{inv.description}</div>
                        <div className="text-xs text-[#434655]">
                          {inv.division} · {inv.term}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#434655] tabular-nums">
                        {inv.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0b1c30] tabular-nums">
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusIndicator status={inv.status} />
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {inv.status !== 'Paid' ? (
                          <button
                            type="button"
                            onClick={() => onMarkInvoicesPaid([inv.id])}
                            className="h-8 px-3 rounded-md bg-[#eff4ff] text-xs font-semibold text-[#004ac6] hover:bg-[#dce9ff] transition-colors whitespace-nowrap"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-[#737686]">
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ParallaxReveal>
    </div>
  );
}
