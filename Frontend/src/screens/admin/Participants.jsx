import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  AlertTriangle,
  Download,
  Filter,
  XCircle,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const STATUS_CONFIG = {
  Confirmed: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  Pending: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  Cancelled: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/60",
    dot: "bg-rose-500",
  },
};

export default function Participants() {
  const { auth } = useAuthContext();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}/participations`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setParticipants(res.data || []);
      } catch (err) {
        console.error("Fetch participants error:", err);
        toast.error("Failed to load attendees");
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchParticipants();
  }, [auth]);

  const filteredList = useMemo(() => {
    let list = [...participants];

    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q) ||
          p.event?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (typeof aVal === "string") {
        return sortAsc
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [participants, statusFilter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  const stats = useMemo(() => {
    const total = participants.length;
    const confirmed = participants.filter((p) => p.status === "Confirmed").length;
    const pending = participants.filter((p) => p.status === "Pending").length;
    const cancelled = participants.filter((p) => p.status === "Cancelled").length;
    return { total, confirmed, pending, cancelled };
  }, [participants]);

  const handleExportCSV = () => {
    if (!filteredList.length) {
      toast.error("No participant data to export");
      return;
    }
    const headers = ["Name,Email,Phone,Event,Status,Date"];
    const rows = filteredList.map((p) =>
      `"${p.name || ""}","${p.email || ""}","${p.phone || ""}","${p.event || ""}","${p.status || ""}","${p.date || ""}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendee list exported to CSV!");
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <DashboardLayout
      searchPlaceholder="Search attendees by name, email, or event..."
      onSearch={(q) => {
        setSearchQuery(q);
        setCurrentPage(1);
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Users size={14} />
            <span>Audience & Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Attendee Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage registrations, track attendance statuses, and export participant directories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.confirmed}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1.5">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1.5">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "Confirmed", "Pending", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {status === "ALL" ? "All Attendees" : status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter list..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Modern SaaS Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Attendee</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("event")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Registered Event</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th
                  onClick={() => toggleSort("status")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("date")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                [...Array(6)].map((_, idx) => (
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
                    <td className="py-4 px-4">
                      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No participants found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different keyword or resetting filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((p, idx) => {
                  const statusConf = STATUS_CONFIG[p.status] || STATUS_CONFIG.Cancelled;

                  return (
                    <tr
                      key={p._id || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {p.event || "General Event"}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          {p.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone size={11} className="text-slate-400" /> {p.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Mail size={11} className="text-slate-400" /> {p.email}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <span className={`size-1.5 rounded-full ${statusConf.dot}`} />
                          {p.status || "Confirmed"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {p.date ? new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong>{filteredList.length ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
            <strong>{Math.min(currentPage * pageSize, filteredList.length)}</strong> of{" "}
            <strong>{filteredList.length}</strong> attendees
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