/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Unlock, 
  Users, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Edit3, 
  Save, 
  Phone, 
  FileText, 
  Trash2, 
  LogOut, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Search,
  CheckCircle,
  FileCheck,
  CheckCircle2,
  CalendarCheck
} from "lucide-react";
import { Appointment, DentalService, Language } from "../types";
import { timeSlots } from "../data";
import { subscribeToAppointments, updateAppointment, deleteAppointment } from "../lib/firebase";

interface AdminDashboardProps {
  language: Language;
  services: DentalService[];
  onAppointmentsChange?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  services,
  onAppointmentsChange
}) => {
  const isAr = language === "ar";
  
  // Auth state
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("dr_ahmed_admin_auth") === "true";
  });
  const [authError, setAuthError] = useState("");
  
  // Dashboard state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  
  // Editing state for changing client time & date
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTimeSlot, setEditTimeSlot] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Custom confirmation modal state for sandboxed preview environments
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "reset";
    targetId?: string;
    titleAr: string;
    titleEn: string;
    messageAr: string;
    messageEn: string;
    onConfirm: () => void;
  } | null>(null);

  // Seed default clinical demo appointments if none exist
  const getInitialAppointments = (): Appointment[] => {
    return [];
  };

  // Synchronize appointments in real-time with automatic custom event triggers
  useEffect(() => {
    const unsubscribe = subscribeToAppointments((appointmentsList) => {
      setAppointments(appointmentsList);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Clinical secure doctor password
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "1234";
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("dr_ahmed_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError(isAr ? "كلمة المرور غير صحيحة. الرجاء المحاولة مرة أخرى." : "Invalid professional password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dr_ahmed_admin_auth");
    setPassword("");
  };

  // 1. Confirm Request Action (Prevents spam confirmation)
  const handleConfirmRequest = async (id: string) => {
    try {
      await updateAppointment(id, { status: "confirmed" });
      if (onAppointmentsChange) {
        onAppointmentsChange();
      }
    } catch (e) {
      console.error("Failed to confirm appointment:", e);
    }
  };

  // 2. Cancel/Decline Action
  const handleCancelRequest = async (id: string) => {
    try {
      await updateAppointment(id, { status: "cancelled" });
      if (onAppointmentsChange) {
        onAppointmentsChange();
      }
    } catch (e) {
      console.error("Failed to cancel appointment:", e);
    }
  };

  // 3. Delete Request Permanent
  const handleDeleteRequest = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      targetId: id,
      titleAr: "حذف سجل المريض",
      titleEn: "Delete Patient Record",
      messageAr: "هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً من النظام؟ لا يمكن التراجع عن هذه الخطوة.",
      messageEn: "Are you sure you want to permanently delete this patient record? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteAppointment(id);
          if (onAppointmentsChange) {
            onAppointmentsChange();
          }
        } catch (e) {
          console.error("Failed to delete appointment:", e);
        }
        setConfirmModal(null);
      }
    });
  };

  // 4. Edit Date/Time & Arrival Info
  const handleStartEditing = (apt: Appointment) => {
    setEditingId(apt.id);
    setEditDate(apt.date);
    setEditTimeSlot(apt.timeSlot);
    setEditNotes(apt.notes || "");
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateAppointment(id, {
        date: editDate,
        timeSlot: editTimeSlot,
        notes: editNotes,
        status: "confirmed"
      });
      if (onAppointmentsChange) {
        onAppointmentsChange();
      }
      setEditingId(null);
    } catch (e) {
      console.error("Failed to update appointment:", e);
    }
  };

  // Reset to demo data for easy testing
  const handleResetDemoData = () => {
     setConfirmModal({
      isOpen: true,
      type: "reset",
      titleAr: "إعادة تعيين البيانات للتدريب",
      titleEn: "Restore Demo Data",
      messageAr: "هل تريد حقاً مسح كل السجلات الحالية والبدء من جديد بقائمة فارغة مجهزة للاختبار؟",
      messageEn: "Do you want to restore blank initial clinical records? All current entries will be reset.",
      onConfirm: async () => {
        for (const apt of appointments) {
          try {
            await deleteAppointment(apt.id);
          } catch (e) {
            console.error("Failed to delete appointment during reset:", e);
          }
        }
        if (onAppointmentsChange) {
          onAppointmentsChange();
        }
        setConfirmModal(null);
      }
    });
  };

  // Filter logic
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      (apt.notes && apt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate doctor statistics
  const countPending = appointments.filter(a => a.status === "pending").length;
  const countConfirmed = appointments.filter(a => a.status === "confirmed").length;
  const countTotal = appointments.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {!isAuthenticated ? (
        /* Password Lock Portal Screen */
        <div className="max-w-md mx-auto my-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
          >
            {/* Top clinical teal background stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500" />
            
            <div className="mx-auto h-16 w-16 bg-teal-50 dark:bg-teal-950/40 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6">
              <Lock className="h-8 w-8 stroke-[2]" />
            </div>

            <h2 className={`text-2xl font-black text-slate-850 dark:text-white leading-tight ${isAr ? 'font-arabic' : 'font-sans'}`}>
              {isAr ? "بوابة الأطباء المعتمدة" : "Professional Doctor Portal"}
            </h2>
            <p className={`text-sm text-slate-400 mt-2 ${isAr ? 'font-arabic' : 'font-sans'}`}>
              {isAr 
                ? "من فضلك أدخل الرمز السري للوصول لطلبات الإجراءات الطبية وجدولة مواعيد المرضى." 
                : "Secure clinical access authentication. Please enter credential password."}
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div className="relative">
                <input
                  id="admin-passwd-input"
                  type="password"
                  required
                  placeholder={isAr ? "أدخل كلمة المرور (الافتراضية: 1234)" : "Enter password (Try: 1234)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-center text-sm font-semibold tracking-wide text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-teal-500 transition-all"
                />
              </div>

              {authError && (
                <div className={`flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs text-right border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className={isAr ? 'font-arabic' : 'font-sans'}>{authError}</span>
                </div>
              )}

              <button
                id="btn-login-submit"
                type="submit"
                className={`w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-teal-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 ${isAr ? 'font-arabic' : 'font-sans'}`}
              >
                <Unlock className="h-4 w-4" />
                <span>{isAr ? "تحقق ودخول الغرفة الطبية" : "Unlock Portal Dashboard"}</span>
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/60 text-[11px] text-slate-400 space-y-1">
              <p>{isAr ? "ملاحظة أمنية: يمكنك استخدام الكلمة السريعة:" : "For verification, please use developer master-key:"}</p>
              <code className="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded font-mono text-teal-600 dark:text-teal-400 text-xs font-bold">1234</code>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard Panel */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header Strip */}
          <div className={`flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs gap-4 ${isAr ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className={`text-2xl font-extrabold text-slate-900 dark:text-white ${isAr ? 'font-arabic' : 'font-sans'}`}>
                  {isAr ? "لوحة تحكم عيادة الدكتور أحمد" : "Dr. Ahmed's Clinical Console"}
                </h1>
              </div>
              <p className={`text-xs text-slate-400 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                {isAr 
                  ? "مراجعة استمارات وتأكيد حجوزات المرضى وتنظيم مواعيد حضورهم المقررة على الموقع الإلكتروني." 
                  : "Review patient registrations, confirm appointments to block spam, and assign exact arrival time schedules."}
              </p>
            </div>
            
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                id="btn-trigger-demo-reset"
                onClick={handleResetDemoData}
                title="Reset Clinic Demo Records"
                className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 dark:text-slate-400 transition cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                id="btn-admin-logout"
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition dark:border-rose-900/60 dark:hover:bg-rose-950 cursor-pointer ${isAr ? 'flex-row-reverse font-arabic' : 'flex-row font-sans'}`}
              >
                <LogOut className="h-4 w-4" />
                <span>{isAr ? "تسجيل الخروج" : "Lock Console"}</span>
              </button>
            </div>
          </div>

          {/* Quick Info Clinical Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {/* Total */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className={`block text-xs font-semibold text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left'}`}>
                  {isAr ? "إجمالي الطلبات" : "Total Applications"}
                </span>
                <span className="block text-2xl font-black text-slate-850 dark:text-white font-mono">{countTotal}</span>
              </div>
            </div>

            {/* Pending Requests - Safety Lock against Spam */}
            <div className="p-5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/40 rounded-2xl flex items-center gap-4 shadow-2xs animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <span className={`block text-xs font-semibold text-amber-600 dark:text-amber-400 ${isAr ? 'text-right font-arabic' : 'text-left'}`}>
                  {isAr ? "طلبات معلقة بانتظار التأكيد" : "Pending Spam Shield Info"}
                </span>
                <span className="block text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                  {countPending} {isAr ? "معلق" : "Unverified"}
                </span>
              </div>
            </div>

            {/* Confirmed / Custom Time Schedule Assigned */}
            <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/40 rounded-2xl flex items-center gap-4 shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <div>
                <span className={`block text-xs font-semibold text-emerald-600 dark:text-emerald-400 ${isAr ? 'text-right font-arabic' : 'text-left'}`}>
                  {isAr ? "مواعيد صحيحة مؤكدة" : "Arrivals Scheduled"}
                </span>
                <span className="block text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {countConfirmed} {isAr ? "مؤكد" : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Filtering and Query Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
            <div className={`flex flex-col md:flex-row gap-4 items-center justify-between ${isAr ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
              
              {/* Search Bar query input */}
              <div className="relative w-full md:max-w-md">
                <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isAr ? 'left-4' : 'right-4'}`}>
                  <Search className="h-4.5 w-4.5" />
                </span>
                <input
                  id="admin-search-appointments"
                  type="text"
                  placeholder={isAr ? "البحث باسم المريض، الجوال، أو الإعراض..." : "Query by patient name, phone, notes..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs font-medium focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-teal-500 ${isAr ? 'pl-11 pr-4 text-right font-arabic' : 'pr-11 pl-4 text-left font-sans'}`}
                />
              </div>

              {/* Status Pill filters */}
              <div className={`flex flex-wrap gap-2 items-center w-full md:w-auto ${isAr ? 'justify-start md:justify-end' : 'justify-start'}`}>
                <span className={`text-xs font-bold text-slate-400 mr-2 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                  {isAr ? "تصفية حسب الحالة:" : "Filter:"}
                </span>

                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${statusFilter === "all" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${statusFilter === "pending" ? "bg-amber-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                >
                  {isAr ? "طلبات معلقة" : "Pending Spam Review"}
                </button>
                <button
                  onClick={() => setStatusFilter("confirmed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${statusFilter === "confirmed" ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                >
                  {isAr ? "مؤكدة" : "Confirmed"}
                </button>
                <button
                  onClick={() => setStatusFilter("cancelled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${statusFilter === "cancelled" ? "bg-rose-650 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                >
                  {isAr ? "ملغية" : "Cancelled"}
                </button>
              </div>

            </div>
          </div>

          {/* List of client applications */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-16 text-center text-slate-400">
              <Users className="mx-auto h-16 w-16 text-slate-200 mb-4 stroke-[1.5]" />
              <h4 className={`text-lg font-bold text-slate-700 dark:text-slate-350 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                {isAr ? "لم يتم العثور على أي مرضى في قائمة الانتظار" : "No patient records matched this filter query"}
              </h4>
              <p className={`text-xs text-slate-400 mt-1 max-w-sm mx-auto ${isAr ? 'font-arabic' : 'font-sans'}`}>
                {isAr 
                  ? "تأكد من كتابة الاسم بصورة صحيحة، أو قم بإعادة تعيين بيانات التدريب لسهولة وسرعة الاختبار والتقييم." 
                  : "Try clearing search term or adding a dummy registration demo patient from the booking page."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => {
                const isEditing = editingId === apt.id;
                const srv = services.find((s) => s.id === apt.serviceId);

                return (
                  <div
                    id={`admin-apt-card-${apt.id}`}
                    key={apt.id}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md
                      ${apt.status === "confirmed" 
                        ? "border-emerald-100 dark:border-emerald-950/40" 
                        : apt.status === "cancelled"
                        ? "border-rose-100 dark:border-rose-950/40 opacity-70"
                        : "border-slate-150 border-dashed dark:border-slate-800"
                      }
                    `}
                  >
                    
                    <div className={`flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center ${isAr ? 'lg:flex-row-reverse text-right' : 'text-left'}`}>
                      
                      {/* Left: Patient and Appointment specifications */}
                      <div className="space-y-3 flex-grow w-full">
                        
                        {/* ID & Badge row */}
                        <div className={`flex flex-wrap items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="font-mono text-[10px] font-extrabold tracking-wide uppercase bg-slate-100 dark:bg-slate-950 text-slate-500 py-1 px-2.5 rounded-md">
                            ID: {apt.id}
                          </span>
                          
                          <span className={`px-2.5 py-1 rounded-sm text-[10px] font-black tracking-wide border uppercase
                            ${apt.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                              : apt.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 animate-pulse"
                            }
                          `}>
                            {apt.status === "confirmed" 
                              ? (isAr ? "مقبول ومؤكد للزيارة" : "Confirmed Arrival") 
                              : apt.status === "cancelled"
                              ? (isAr ? "مرفوض / ملغي" : "Cancelled / Rejected")
                              : (isAr ? "معلق - بانتظار الدكتور" : "SPAM SHIELD: Click to Confirm")
                            }
                          </span>

                          {/* Treatment Tag */}
                          <span className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-teal-50/50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100/40">
                            {isAr ? srv?.titleAr : srv?.titleEn}
                          </span>
                        </div>

                        {/* Patient Core metrics */}
                        <div className={`flex flex-col sm:flex-row gap-x-6 gap-y-1.5 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                          <h3 className={`text-base font-extrabold text-slate-850 dark:text-white ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {apt.patientName}
                          </h3>
                          
                          <div className={`flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ${isAr ? 'flex-row-reverse font-mono' : 'flex-row font-mono'}`}>
                            <Phone className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                            <a href={`tel:${apt.phone}`} className="hover:underline font-bold text-slate-600 dark:text-slate-300">
                              {apt.phone}
                            </a>
                          </div>
                        </div>

                        {/* Interactive Scheduler Block / Custom Arrival times */}
                        {isEditing ? (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-3 mt-3"
                          >
                            <h4 className={`text-xs font-bold text-teal-600 dark:text-teal-400 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                              {isAr ? "تحديد أو تغيير موعد حضور المريض للتخلص من العشوائية:" : "Block Spam Appointment: Give exact custom schedule on the website"}
                            </h4>
                            
                            <div className="grid gap-3 sm:grid-cols-2">
                              {/* Date set */}
                              <div className="space-y-1">
                                <label className={`block text-[10px] font-bold text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                                  {isAr ? "التاريخ المقرّر" : "Assigned Date"}
                                </label>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="w-full text-xs font-medium py-2 px-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                                />
                              </div>

                              {/* Time set */}
                              <div className="space-y-1">
                                <label className={`block text-[10px] font-bold text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                                  {isAr ? "ساعة الحضور الدقيقة" : "Exact Arrival Time Frame"}
                                </label>
                                <select
                                  value={editTimeSlot}
                                  onChange={(e) => setEditTimeSlot(e.target.value)}
                                  className="w-full text-xs font-medium py-2 px-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:border-teal-500 cursor-pointer"
                                >
                                  {timeSlots.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Custom clinical instruction notes */}
                            <div className="space-y-1">
                              <label className={`block text-[10px] font-bold text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left'}`}>
                                {isAr ? "إرشادات طبية مخصصة للمريض (ستظهر له فوراً على الموقع):" : "Add Direct Doctor Clinical Instruction:"}
                              </label>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder={isAr ? "مثال: يرجى الحضور قبل الموعد بـ ١٠ دقائق وصيام ٤ ساعات..." : "eg. Please arrive 10 min early. Fast 3 hours beforehand."}
                                className={`w-full text-xs py-2 px-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-lg focus:outline-none focus:border-teal-500 ${isAr ? 'text-right font-arabic' : 'text-left'}`}
                              />
                            </div>

                            <div className={`flex gap-2 justify-end pt-1 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
                              >
                                {isAr ? "إلغاء التعديل" : "Cancel"}
                              </button>
                              <button
                                onClick={() => handleSaveEdit(apt.id)}
                                className="px-4 py-1.5 rounded-lg text-xs bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1.5 cursor-pointer font-bold"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>{isAr ? "حفظ الموعد وتأكيده للعميل" : "Confirm & Save Custom Timing"}</span>
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className={`flex flex-col sm:flex-row gap-x-6 gap-y-2 py-1.5 text-xs ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Schedule Label */}
                            <div className={`flex items-center gap-1.5 text-slate-600 dark:text-slate-350 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                              <Calendar className="h-3.5 w-3.5 text-teal-600" />
                              <span className="font-semibold text-slate-400 mr-0.5">{isAr ? "التاريخ المقرّر:" : "Scheduled Date:"}</span>
                              <strong className="font-mono text-slate-700 dark:text-slate-200">{apt.date}</strong>
                            </div>

                            <div className={`flex items-center gap-1.5 text-slate-600 dark:text-slate-350 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                              <Clock className="h-3.5 w-3.5 text-teal-600" />
                              <span className="font-semibold text-slate-400 mr-0.5">{isAr ? "موعد الحضور الدقيق:" : "Specific Timing:"}</span>
                              <strong className="font-mono text-slate-700 dark:text-slate-200">{apt.timeSlot}</strong>
                            </div>
                          </div>
                        )}

                        {/* Patient original notes of symptoms */}
                        {!isEditing && apt.notes && (
                          <div className={`p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 text-xs italic text-slate-500 dark:text-slate-450 leading-relaxed ${isAr ? 'text-right font-arabic' : 'text-left'}`}>
                            <span className="font-bold text-teal-600 not-italic mr-1">"{isAr ? "الملاحظات الطبية أو الأعراض" : "Patient symptoms summary"}:" </span>
                            {apt.notes}
                          </div>
                        )}

                      </div>

                      {/* Right side: Urgent Clinical Doctor Operations */}
                      <div className={`flex flex-row lg:flex-col gap-2 items-center lg:items-end w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-850 ${isAr ? 'justify-start lg:justify-end' : 'justify-end'}`}>
                        
                        {!isEditing && (
                          <div className="flex gap-1.5 w-full lg:w-auto">
                            {/* Spam Control: If pending, click to Confirm */}
                            {apt.status === "pending" ? (
                              <button
                                onClick={() => handleConfirmRequest(apt.id)}
                                className={`flex-grow lg:flex-grow-0 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition cursor-pointer shadow-xs ${isAr ? 'font-arabic' : 'font-sans'}`}
                              >
                                <Check className="h-4 w-4" />
                                <span>{isAr ? "تأكيد الطلب الطبي" : "Confirm Booking"}</span>
                              </button>
                            ) : null}

                            {/* Edit arrival schedule button */}
                            <button
                              onClick={() => handleStartEditing(apt)}
                              className={`flex-grow lg:flex-grow-0 flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 font-bold py-2 px-3.5 rounded-xl text-xs transition cursor-pointer ${isAr ? 'font-arabic' : 'font-sans'}`}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>{isAr ? "تحديد / تعديل وقت الحضور" : "Give Arrival Time"}</span>
                            </button>

                            {/* Decline / Cancel if confirmed */}
                            {apt.status === "confirmed" ? (
                              <button
                                onClick={() => handleCancelRequest(apt.id)}
                                title="Set to Cancelled status"
                                className="p-2 border border-slate-200 hover:border-rose-300 hover:text-rose-600 rounded-xl dark:border-slate-800 transition cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            ) : null}

                            {/* Permanent delete client record */}
                            <button
                              onClick={() => handleDeleteRequest(apt.id)}
                              title="Delete Patient Record permanently"
                              className="p-2 border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded-xl dark:border-slate-800 transition cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Tips for Dr Ahmed */}
          <div className="rounded-2xl bg-teal-50/40 border border-teal-100/50 dark:bg-teal-950/20 dark:border-teal-900/40 p-5 flex items-start gap-4">
            <div className="p-2 bg-white dark:bg-teal-950 rounded-lg text-teal-600 flex-shrink-0 shadow-3xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className={`space-y-1 text-xs text-slate-500 dark:text-slate-450 ${isAr ? 'text-right' : 'text-left'}`}>
              <h5 className="font-extrabold text-slate-850 dark:text-slate-200">{isAr ? "الحماية ضد الرسائل والمواعيد الوهمية (Anti-Spam Protocol)" : "Spam-Filtering Protocol Active"}</h5>
              <p className={isAr ? 'font-arabic' : 'font-sans'}>
                {isAr 
                  ? "جميع الطلبات المرسلة من المرضى على الموقع تبدأ بحالة 'معلق'. يمكنك تأكيدها فورياً وتحديد تاريخ الحضور أو اختيار الوقت الدقيق للجلسة، وبمجرد حفظ الموعد هنا، سيظهر للمريض في متصفحه التوقيت الطبي المحدد له لمغادرة منزله والقدوم للعيادة العليا الرياض."
                  : "All client registrations start as 'Pending' automatically. By clicking 'Give Arrival Time', you assign them a specific calendar spot & precision instructions which immediately sync back in real-time to the patient's device."}
              </p>
            </div>
          </div>

        </motion.div>
      )}

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop slide */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            {/* Modal Card content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative w-full max-w-sm overflow-hidden z-10"
            >
              <div className={`absolute top-0 inset-x-0 h-1.5 ${
                confirmModal.type === 'delete' 
                  ? 'bg-rose-500' 
                  : 'bg-teal-500'
              }`} />
              
              <div className="flex flex-col items-center text-center">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${
                  confirmModal.type === 'delete' 
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' 
                    : 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
                }`}>
                   {confirmModal.type === 'delete' ? (
                     <Trash2 className="h-5 w-5" />
                   ) : (
                     <RefreshCw className="h-5 w-5" />
                   )}
                </div>
                
                <h3 className={`text-base font-extrabold text-slate-850 dark:text-white ${isAr ? 'font-arabic' : 'font-sans'}`}>
                  {isAr ? confirmModal.titleAr : confirmModal.titleEn}
                </h3>
                <p className={`text-xs text-slate-400 dark:text-slate-400 mt-2 leading-relaxed ${isAr ? 'font-arabic' : 'font-sans'}`}>
                  {isAr ? confirmModal.messageAr : confirmModal.messageEn}
                </p>
                
                <div className="flex gap-3 justify-center w-full mt-6">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className={`flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition cursor-pointer ${isAr ? 'font-arabic' : 'font-sans'}`}
                  >
                    {isAr ? "إلغاء التراجع" : "Cancel"}
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white transition cursor-pointer ${
                      confirmModal.type === 'delete'
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/10'
                        : 'bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-500/10'
                    } ${isAr ? 'font-arabic' : 'font-sans'}`}
                  >
                    {isAr ? "تأكيد الإجراء" : "Confirm"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
