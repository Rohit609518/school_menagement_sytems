import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  Receipt,
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";
import { getMyStudentProfile } from "../../services/studentservice";
import { getMyFees } from "../../services/feesService";

function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await getMyStudentProfile();
      const studentId = profile?.student?._id;

      if (!studentId) {
        throw new Error("Student profile could not be identified");
      }

      const data = await getMyFees(studentId);
      setFees(data.fees || data.fee || []);
    } catch (err) {
      console.log("FEES ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load fee information"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // Compute fee summary
  const summary = useMemo(() => {
    let total = 0;
    let paid = 0;

    fees.forEach((f) => {
      total += Number(f.totalAmount || 0);
      paid += Number(f.paidAmount || 0);
    });

    const remaining = Math.max(0, total - paid);
    let status = "All Paid";
    if (total === 0) status = "No Dues";
    else if (remaining === 0) status = "Paid";
    else if (paid > 0) status = "Partial";
    else status = "Pending";

    return { total, paid, remaining, status };
  }, [fees]);

  return (
    <StudentLayout
      title="Fee Payment Details"
      subtitle="View your tuition breakdown, payment invoices, and balance"
    >
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Total Billed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Billed
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-800">
              ₹{summary.total.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Total annual fees</p>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Paid
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              ₹{summary.paid.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Amount cleared</p>
          </div>
        </div>

        {/* Balance Remaining */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Balance Due
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-rose-600">
              ₹{summary.remaining.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Pending payment</p>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                summary.status === "Paid" || summary.status === "All Paid" || summary.status === "No Dues"
                  ? "bg-emerald-100 text-emerald-700"
                  : summary.status === "Partial"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {summary.status}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Fee clearance status</p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Fee Details
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchFees}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty View */}
      {!loading && !error && fees.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Fee Invoices Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            There are no pending or logged fee records for your profile.
          </p>
        </div>
      )}

      {/* Fee Invoices Cards */}
      {!loading && !error && fees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {fees.map((fee) => {
            const statusLower = (fee.status || "").toLowerCase();
            const total = Number(fee.totalAmount || 0);
            const paid = Number(fee.paidAmount || 0);
            const remaining = fee.remaining !== undefined
              ? Number(fee.remaining)
              : Math.max(0, total - paid);

            return (
              <div
                key={fee._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-800">
                          Tuition & Academic Fee
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Invoice ID: {fee._id ? fee._id.slice(-6).toUpperCase() : "INV-01"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        statusLower === "paid"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : statusLower === "partial"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-rose-100 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {fee.status || "Pending"}
                    </span>
                  </div>

                  {/* Financial Breakdown Table / Rows */}
                  <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Amount:</span>
                      <span className="font-bold text-slate-800">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-emerald-700">
                      <span>Paid Amount:</span>
                      <span className="font-bold">
                        ₹{paid.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-rose-700 pt-2 border-t border-slate-200/60 font-semibold">
                      <span>Balance Due:</span>
                      <span className="font-black text-sm">
                        ₹{remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    {fee.paymentDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(fee.paymentDate).toLocaleDateString()}
                      </span>
                    )}
                    {fee.paymentMethod && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 capitalize">
                        via {fee.paymentMethod}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => alert(`Receipt for ${fee._id ? fee._id.slice(-6).toUpperCase() : "Invoice"} generated.`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Download size={13} />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}

export default Fees;