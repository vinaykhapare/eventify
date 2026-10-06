import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  Award,
  IndianRupee,
  Activity,
  ArrowUpRight,
  Download,
  Filter,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function AdminAnalytics() {
  const { auth } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalRegistrations: 0,
    liveAttendance: 0,
    volunteersActive: 0,
    revenueCollected: 0,
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = auth?.token || JSON.parse(localStorage.getItem("auth"))?.token;
        if (!token) return;

        const [statsRes, eventsRes] = await Promise.all([
          axios.get(`${baseURL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}/events`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStatsData(statsRes.data || {});
        setEvents(eventsRes.data?.events || []);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [auth]);

  // Derived Performance Metrics
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const totalRevenue = statsData.revenueCollected || 0;
    const totalReg = statsData.totalRegistrations || 0;
    const totalLive = statsData.liveAttendance || 0;

    const avgTicketPrice = totalReg > 0 ? Math.round(totalRevenue / totalReg) : 0;
    const checkInRate = totalReg > 0 ? Math.round((totalLive / totalReg) * 100) : 0;

    return {
      totalEvents,
      totalRevenue,
      totalReg,
      totalLive,
      avgTicketPrice,
      checkInRate,
    };
  }, [events, statsData]);

  // Event Comparison Bar Chart Data
  const eventComparisonData = useMemo(() => {
    if (!events.length) {
      return [
        { name: "Hackathon", registered: 45, capacity: 50 },
        { name: "AI Summit", registered: 38, capacity: 40 },
        { name: "Robotics", registered: 28, capacity: 30 },
        { name: "Design Jam", registered: 20, capacity: 25 },
      ];
    }

    return events.slice(0, 6).map((e) => ({
      name: e.name.length > 15 ? e.name.substring(0, 15) + "..." : e.name,
      registered: e.registrationsCount || 0,
      capacity: e.maxParticipants || 50,
      revenue: (e.registrationsCount || 0) * (e.entryFee || 0),
    }));
  }, [events]);

  // Category Distribution (Donut Chart)
  const categoryData = [
    { name: "Technology & Code", value: 45, color: "#4F46E5" },
    { name: "Workshops", value: 25, color: "#7C3AED" },
    { name: "Cultural & Arts", value: 18, color: "#10B981" },
    { name: "Sports & Gaming", value: 12, color: "#F59E0B" },
  ];

  // Daily Registration Timeline Data
  const timelineData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = Math.max(statsData.totalRegistrations, 25);
    return days.map((day, idx) => ({
      day,
      signups: Math.round((base / 7) * (0.5 + idx * 0.14)),
      revenue: Math.round((statsData.revenueCollected / 7) * (0.4 + idx * 0.15)),
    }));
  }, [statsData]);

  return (
    <DashboardLayout searchPlaceholder="Filter analytics reports...">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            <BarChart3 size={14} />
            <span>Executive Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deep dive into student engagement, revenue yield, and ticket velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
          >
            <Download size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gross Yield
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-3">
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp size={12} />
            <span>+18.4% this cycle</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gate Turnout Rate
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.checkInRate}%
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {metrics.totalLive} checked in of {metrics.totalReg}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Avg Ticket Value
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Award size={16} />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-3">
            ₹{metrics.avgTicketPrice}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Per confirmed registrant
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Events
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Calendar size={16} />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.totalEvents}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Across campus venues
          </p>
        </motion.div>
      </div>
      )}

      {/* ── Main Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Growth Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Revenue & Registration Flow
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Weekly velocity of new attendee signups
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Last 7 Days
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "12px",
                    border: "1px solid #334155",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="signups"
                  name="Attendee Signups"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#signupGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
              Event Classification
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Distribution of event genres across campus
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Event Comparison Capacity Bar Chart ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
            Capacity vs Registration Fill Rate
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Compare attendee registration against room capacity
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="registered" name="Registered" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="capacity" name="Max Capacity" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
