import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Search,
  UserCheck,
  UserPlus,
  UserCog,
  Phone,
  Mail,
  Zap,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function Volunteers() {
  const { auth } = useAuthContext();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/volunteering`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setVolunteers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch volunteers error:", err);
        toast.error("Failed to load volunteer roster");
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchVolunteers();
  }, [auth]);

  const filteredList = useMemo(() => {
    let list = [...volunteers];
    if (statusFilter !== "ALL") {
      list = list.filter((v) => (v.status || "Active") === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name?.toLowerCase().includes(q) ||
          v.email?.toLowerCase().includes(q) ||
          v.assignedEvent?.toLowerCase().includes(q) ||
          v.duty?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [volunteers, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  const stats = useMemo(() => {
    const total = volunteers.length;
    const active = volunteers.filter((v) => v.status === "Active" || !v.status).length;
    const assigned = volunteers.filter((v) => v.assignedEvent && v.assignedEvent !== "None").length;
    return { total, active, assigned };
  }, [volunteers]);

  const handleExportCSV = () => {
    if (!filteredList.length) {
      toast.error("No volunteer records to export");
      return;
    }
    const headers = ["Name,Email,Phone,Assigned Event,Duty,Status"];
    const rows = filteredList.map(
      (v) =>
        `"${v.name || ""}","${v.email || ""}","${v.phone || ""}","${v.assignedEvent || "None"}","${v.duty || "General Staff"}","${v.status || "Active"}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `volunteers-roster-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Volunteer roster exported!");
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "V";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <DashboardLayout
      searchPlaceholder="Search volunteers by name, duty, or event..."
      onSearch={(q) => {
        setSearchQuery(q);
        setCurrentPage(1);
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <UserCheck size={14} />
            <span>Staff & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Volunteer Crew
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate campus volunteers, assign gate shifts, and monitor check-in staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <Link
            to="/admin/assign-volunteer"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <UserCog size={14} /> Assign Shifts
          </Link>
          <Link
            to="/admin/create-volunteer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <UserPlus size={14} /> Add Volunteer
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Crew</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Staff</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.active}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">On-Duty Shifts</p>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1.5">{stats.assigned}</p>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2">
        {["ALL", "Active", "Inactive"].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === st
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {st === "ALL" ? "All Volunteers" : st}
          </button>
        ))}
      </div>

      {/* Modern SaaS Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Volunteer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Assigned Shift</th>
                <th className="py-3.5 px-4">Role / Duty</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
                          <div className="h-2.5 w-36 bg-slate-100 dark:bg-slate-700/60 rounded-md" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-md" /></td>
                    <td className="py-4 px-4"><div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                  </tr>
                ))
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <UserCheck size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No volunteers registered yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Add Volunteer" above to create volunteer credentials.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((v, idx) => (
                  <tr
                    key={v.id || v._id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* Volunteer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(v.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {v.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {v.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        {v.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={11} className="text-slate-400" /> {v.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail size={11} className="text-slate-400" /> {v.email}
                        </span>
                      </div>
                    </td>

                    {/* Shift */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {v.assignedEvent && v.assignedEvent !== "None" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                          <CalendarCheck size={12} /> {v.assignedEvent}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    {/* Duty */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        <Zap size={11} className="text-amber-500" /> {v.duty || "General Operations"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {v.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total: <strong>{filteredList.length}</strong> volunteers
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}