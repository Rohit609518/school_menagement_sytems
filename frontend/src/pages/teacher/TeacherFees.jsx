import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getAllFees } from "../../services/feesService";

function TeacherFees() {
  const [feesList, setFeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllFees();
      setFeesList(res.fees || []);
    } catch (err) {
      console.error("TEACHER FEES FETCH ERROR:", err);
      setError("Failed to load student fee status records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const stats = useMemo(() => {
    let paidCount = 0;
    let pendingCount = 0;
    let partialCount = 0;
    let totalCollected = 0;

    feesList.forEach((f) => {
      const s = (f.status || "").toLowerCase();
      if (s === "paid") paidCount++;
      else if (s === "partial") partialCount++;
      else pendingCount++;

      totalCollected += Number(f.paidAmount || 0);
    });

    return { paidCount, pendingCount, partialCount, totalCollected };
  }, [feesList]);

  const filteredFees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return feesList;
    return feesList.filter(
      (f) =>
        (f.student?.name || "").toLowerCase().includes(q) ||
        (f.student?.email || "").toLowerCase().includes(q) ||
        (f.paymentMethod || "").toLowerCase().includes(q) ||
        (f.status || "").toLowerCase().includes(q)
    );
  }, [feesList, searchQuery]);

  return (
    <TeacherLayout
      title="Student Fees Status (Read-Only)"
      subtitle="View institutional fee status for enrolled students in your classes"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-emerald-600" size={26} />
            <span>Class Fees Status Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Faculty view of student fee clearance, tuition standing, and payment completion status
          </p>
        </div>

        <button
          onClick={fetchFees}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition self-start sm:self-center"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Records
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {feesList.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Enrolled student fees</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Paid & Cleared
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.paidCount}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Good standing
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Partial Paid
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {stats.partialCount}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
            Installment plan
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pending Clearance
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {stats.pendingCount}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
            Follow-up required
          </p>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            Student Payment Standings ({filteredFees.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or status..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Total Tuition</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Remaining Balance</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No fee records found matching query
                  </td>
                </tr>
              ) : (
                filteredFees.map((f) => {
                  const s = (f.status || "").toLowerCase();
                  const remaining = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));

                  return (
                    <tr key={f._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800">
                          {f.student?.name || "Student"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Class {f.student?.studentclass || "10th"}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        ₹{(f.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-emerald-600">
                        ₹{(f.paidAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-rose-600">
                        ₹{remaining.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px]">
                          {f.paymentMethod || "Bank"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
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
    </TeacherLayout>
  );
}

export default TeacherFees;
