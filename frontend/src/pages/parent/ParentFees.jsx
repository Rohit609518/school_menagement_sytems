import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import { getChildFees } from "../../services/feesService";

function ParentFees() {
  const [feesList, setFeesList] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getChildFees();
      setFeesList(res.fees || []);
      setChild(res.child);
    } catch (err) {
      console.error("PARENT FEES ERROR:", err);
      setError("Failed to load child's fee records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const totals = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;

    feesList.forEach((f) => {
      totalBilled += Number(f.totalAmount || 0);
      totalPaid += Number(f.paidAmount || 0);
    });

    const pending = Math.max(0, totalBilled - totalPaid);
    return { totalBilled, totalPaid, pending };
  }, [feesList]);

  return (
    <ParentLayout
      title="Child Tuition & Fees"
      subtitle={child ? `Viewing fee standing for ${child.name}` : "Fee clearance"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-amber-600" size={26} />
            <span>Child Fee Records & Standing</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review academic tuition payments, fee receipts, and pending balances (Read-Only)
          </p>
        </div>

        <button
          onClick={fetchFees}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition self-start sm:self-center"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Child Summary Pill */}
      {child && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{child.name}</p>
            <p className="text-xs text-slate-500">
              Class {child.studentclass || "10th"} • {child.email}
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Invoiced
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            ₹{totals.totalBilled.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Academic school fees</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Paid
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            ₹{totals.totalPaid.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Confirmed receipts
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Balance
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ₹{totals.pending.toLocaleString()}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
            {totals.pending === 0 ? "Clear balance" : "Payment required"}
          </p>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Fee Invoices & Receipts ({feesList.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Tuition Amount</th>
                <th className="py-3 px-3">Amount Paid</th>
                <th className="py-3 px-3">Remaining Balance</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {feesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No fee records found for this student account
                  </td>
                </tr>
              ) : (
                feesList.map((f) => {
                  const s = (f.status || "").toLowerCase();
                  const remaining = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));

                  return (
                    <tr key={f._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        ₹{(f.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-emerald-600">
                        ₹{(f.paidAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-rose-600">
                        ₹{remaining.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                          {f.paymentMethod || "Bank Transfer"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                            s === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : s === "partial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {f.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ParentLayout>
  );
}

export default ParentFees;
