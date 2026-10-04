import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  CreditCard,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { getStudents } from "../../services/adminService";
import {
  getAllFees,
  createFee,
  updateFee,
  deleteFee,
} from "../../services/feesService";

function AdminFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeFee, setActiveFee] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const initialForm = {
    student: "",
    totalAmount: "",
    paidAmount: "",
    paymentMethod: "Cash",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [feeRes, studRes] = await Promise.allSettled([
        getAllFees(),
        getStudents(),
      ]);

      if (feeRes.status === "fulfilled" && feeRes.value) {
        setFees(feeRes.value.fees || []);
      }
      if (studRes.status === "fulfilled" && studRes.value) {
        const sList = studRes.value.students || [];
        setStudents(sList);
        if (sList.length > 0 && !formData.student) {
          setFormData((prev) => ({ ...prev, student: sList[0]._id }));
        }
      }
    } catch (err) {
      console.log("FETCH FEES ERROR:", err);
      setError("Failed to load fee records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalCollected = 0;
    let pendingCount = 0;
    let clearedCount = 0;

    fees.forEach((f) => {
      const tot = Number(f.totalAmount || 0);
      const paid = Number(f.paidAmount || 0);
      totalBilled += tot;
      totalCollected += paid;

      const st = (f.status || "").toLowerCase();
      if (st === "paid") clearedCount++;
      else pendingCount++;
    });

    return {
      totalBilled,
      totalCollected,
      totalPending: Math.max(0, totalBilled - totalCollected),
      pendingCount,
      clearedCount,
    };
  }, [fees]);

  // Filtered fees
  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const st = (f.status || "pending").toLowerCase();
      const matchStatus =
        statusFilter === "All" || st === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase();
      const studentName = f.student?.name ? f.student.name.toLowerCase() : "";
      const studentEmail = f.student?.email ? f.student.email.toLowerCase() : "";
      const matchSearch =
        !searchQuery ||
        studentName.includes(q) ||
        studentEmail.includes(q) ||
        (f._id && f._id.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [fees, statusFilter, searchQuery]);

  // Create Fee
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.student) {
      setModalError("Please select an enrolled student.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      await createFee({
        student: formData.student,
        totalAmount: Number(formData.totalAmount),
        paidAmount: Number(formData.paidAmount || 0),
        paymentMethod: formData.paymentMethod,
      });

      setIsCreateOpen(false);
      setFormData(initialForm);
      setSuccessMsg("Fee record created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.log("CREATE FEE ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create fee record"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // 1-Click "Clear All Fees" (Mark as 100% Paid)
  const handleClearFee = async (fee) => {
    try {
      setLoading(true);
      await updateFee(fee._id, {
        paidAmount: fee.totalAmount,
      });
      setSuccessMsg(`All dues cleared for ${fee.student?.name || "Student"}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.log("CLEAR FEE ERROR:", err);
      alert(err.response?.data?.message || "Failed to clear fees");
      setLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (fee) => {
    setActiveFee(fee);
    setFormData({
      student: fee.student?._id || fee.student || "",
      totalAmount: fee.totalAmount || "",
      paidAmount: fee.paidAmount || "",
      paymentMethod: fee.paymentMethod || "Cash",
    });
    setModalError("");
    setIsEditOpen(true);
  };

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeFee?._id) return;

    try {
      setModalLoading(true);
      setModalError("");

      await updateFee(activeFee._id, {
        totalAmount: Number(formData.totalAmount),
        paidAmount: Number(formData.paidAmount),
        paymentMethod: formData.paymentMethod,
      });

      setIsEditOpen(false);
      setSuccessMsg("Fee record updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.log("UPDATE FEE ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update fee record"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!activeFee?._id) return;
    try {
      setModalLoading(true);
      await deleteFee(activeFee._id);
      setIsDeleteOpen(false);
      setSuccessMsg("Fee entry deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.log("DELETE FEE ERROR:", err);
      alert(err.response?.data?.message || "Failed to delete fee record");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-rose-600" size={26} />
            <span>Student Fees Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage billing, track pending ping fees, clear balances, and record payments
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              student: students[0]?._id || "",
              totalAmount: "",
              paidAmount: "",
              paymentMethod: "Cash",
            });
            setModalError("");
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-rose-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>New Fee Entry</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Billed
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            ₹{metrics.totalBilled.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Annual fee charges</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Collected
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            ₹{metrics.totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {metrics.clearedCount} fully cleared
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending "Ping" Dues
          </span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            ₹{metrics.totalPending.toLocaleString()}
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
            {metrics.pendingCount} accounts pending
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Clearance Rate
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
            {metrics.totalBilled > 0
              ? `${Math.round((metrics.totalCollected / metrics.totalBilled) * 100)}%`
              : "100%"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Overall collection</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Pending", "Partial", "Paid"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                statusFilter === st
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "Paid" ? "All Cleared" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">Error Loading Fees</h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty View */}
      {!loading && !error && filteredFees.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No Fee Records Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Click "New Fee Entry" to bill a student.
          </p>
        </div>
      )}

      {/* Fees List */}
      {!loading && !error && filteredFees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFees.map((fee) => {
            const status = (fee.status || "pending").toLowerCase();
            const total = Number(fee.totalAmount || 0);
            const paid = Number(fee.paidAmount || 0);
            const remaining = fee.remaining !== undefined ? Number(fee.remaining) : Math.max(0, total - paid);
            const isCleared = status === "paid" || remaining === 0;

            return (
              <div
                key={fee._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-800">
                        {fee.student?.name || "Student"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {fee.student?.studentclass ? `Class ${fee.student.studentclass}` : "Enrolled Student"} • {fee.student?.email}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        isCleared
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : status === "partial"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-rose-100 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isCleared ? "All Cleared" : fee.status || "Pending"}
                    </span>
                  </div>

                  {/* Financial Row */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Billed:</span>
                      <span className="font-bold">₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Amount Paid:</span>
                      <span className="font-bold">₹{paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-semibold pt-1 border-t border-slate-200/60">
                      <span>Remaining Balance:</span>
                      <span className="font-black">₹{remaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 capitalize">
                    via {fee.paymentMethod || "Cash"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* 1-Click Clear Fee Button */}
                    {!isCleared && (
                      <button
                        onClick={() => handleClearFee(fee)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition flex items-center gap-1 text-[11px]"
                        title="Mark all balance as paid"
                      >
                        <CheckCircle2 size={13} />
                        <span>All Clear</span>
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(fee)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Edit Fee"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => {
                        setActiveFee(fee);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Delete Fee Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Create Fee Invoice</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.studentclass || "Class 10th"}) - {st.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Fee Amount (₹)</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  placeholder="e.g. 20000 (leave 0 if pending)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / Card</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Bank">Bank Deposit</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {modalLoading ? "Saving..." : "Save Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Update Fee</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Fee Amount (₹)</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / Card</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Bank">Bank Deposit</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {modalLoading ? "Saving..." : "Update Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && activeFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Delete Fee Record?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove this invoice?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm disabled:opacity-60"
              >
                {modalLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminFees;
