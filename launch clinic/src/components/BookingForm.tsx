/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, User, Phone, FileText, CheckCircle2, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { DentalService, Language, Appointment } from "../types";
import { translations, timeSlots } from "../data";
import { subscribeToAppointments, addAppointment, deleteAppointment, updateAppointment, isFirebaseConfigured } from "../lib/firebase";

interface BookingFormProps {
  services: DentalService[];
  language: Language;
  selectedServiceId: string;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  services,
  language,
  selectedServiceId,
  onSuccess
}) => {
  const isAr = language === "ar";
  const t = translations[language];

  // State values
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(selectedServiceId || "cosmetic");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  // Update selected service if parent props change
  useEffect(() => {
    if (selectedServiceId) {
      setServiceId(selectedServiceId);
    }
  }, [selectedServiceId]);

  // Load existing appointments and subscribe to real-time events for appointment changes
  useEffect(() => {
    let rawAppointments: Appointment[] = [];

    const applyFilterAndSet = (list: Appointment[]) => {
      rawAppointments = list;
      if (isFirebaseConfigured()) {
        const mySavedIds: string[] = JSON.parse(localStorage.getItem("dr_ahmed_my_appointment_ids") || "[]");
        setMyAppointments(list.filter(apt => mySavedIds.includes(apt.id)));
      } else {
        setMyAppointments(list);
      }
    };

    const unsubscribe = subscribeToAppointments((appointmentsList) => {
      applyFilterAndSet(appointmentsList);
    });

    const handleLocalTrigger = () => {
      applyFilterAndSet(rawAppointments);
    };

    window.addEventListener("appointments-updated", handleLocalTrigger);
    window.addEventListener("storage", handleLocalTrigger);

    return () => {
      unsubscribe();
      window.removeEventListener("appointments-updated", handleLocalTrigger);
      window.removeEventListener("storage", handleLocalTrigger);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!patientName || !phone || !date || !selectedSlot) {
      setErrorMessage(isAr ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdId = await addAppointment({
        patientName,
        phone,
        serviceId,
        date,
        timeSlot: selectedSlot,
        notes,
        status: "pending",
      });

      // Save configuration ID to local list of patient's personal appointment IDs
      const mySavedIds: string[] = JSON.parse(localStorage.getItem("dr_ahmed_my_appointment_ids") || "[]");
      if (createdId && !mySavedIds.includes(createdId)) {
        mySavedIds.push(createdId);
        localStorage.setItem("dr_ahmed_my_appointment_ids", JSON.stringify(mySavedIds));
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      onSuccess();

      // Trigger synchronization
      window.dispatchEvent(new Event("appointments-updated"));

      // Reset form fields
      setPatientName("");
      setPhone("");
      setNotes("");
      setSelectedSlot("");
    } catch (error) { 
      console.error("Booking submission error:", error);
      setErrorMessage(isAr ? "حدث خطأ أثناء إرسال الموعد للطبيب. يرجى المحاولة مرة أخرى." : "An error occurred while sending the appointment to the doctor. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      if (isFirebaseConfigured()) {
        // Under Firebase, soft-cancel status update (authorized for original patient client)
        await updateAppointment(id, { status: "cancelled" });
      } else {
        // Non-Firebase fallback uses standard direct local removal
        await deleteAppointment(id);
      }

      // Remove from my list of persistent personal reference IDs so it also disappears instantly from patient's private view
      const mySavedIds: string[] = JSON.parse(localStorage.getItem("dr_ahmed_my_appointment_ids") || "[]");
      const updatedIds = mySavedIds.filter(savedId => savedId !== id);
      localStorage.setItem("dr_ahmed_my_appointment_ids", JSON.stringify(updatedIds));

      // Dispatch update notification so state filters sync instantly
      window.dispatchEvent(new Event("appointments-updated"));
    } catch (error) {
      console.error("Failed to delete/cancel appointment:", error);
    }
  };

  return (
    <div id="booking-container-block" className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8">
      
      {/* Tab bar header to toggle between form & scheduled list */}
      <div className={`flex items-center justify-between border-b border-slate-100 pb-5 mb-6 dark:border-slate-800 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        <div>
          <h3 className={`text-2xl font-bold text-slate-800 dark:text-slate-100 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
            {t.bookTitle}
          </h3>
          <p className={`text-sm text-slate-400 mt-1 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
            {t.bookSubtitle}
          </p>
        </div>
        
        <button
          id="btn-view-appointments-history"
          type="button"
          onClick={() => setShowAppointmentsModal(true)}
          className={`flex items-center gap-1.5 rounded-xl bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-400 cursor-pointer ${isAr ? 'font-arabic' : 'font-sans'}`}
        >
          <span>{t.viewAppointments}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
            {myAppointments.length}
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            id="booking-success-block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <div className="mb-4 rounded-full bg-teal-50 p-4 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            
            <h4 className={`text-2xl font-bold text-slate-800 dark:text-slate-100 ${isAr ? 'font-arabic' : 'font-sans'}`}>
              {t.formSuccess}
            </h4>
            
            <p className={`mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400 ${isAr ? 'font-arabic' : 'font-sans'}`}>
              <span className="block mb-2 font-bold text-teal-600 dark:text-teal-400">
                {isAr ? "تم إرسال الموعد بنجاح وهو الآن لدى طبيبك." : "Your appointment is sent to the doctor successfully."}
              </span>
              {t.formSuccessSub}
            </p>

            <button
              id="btn-back-to-booking"
              onClick={() => setShowSuccess(false)}
              className={`mt-8 flex items-center gap-2 rounded-xl bg-slate-100 py-2.5 px-6 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer ${isAr ? 'font-arabic flex-row-reverse' : 'flex-row'}`}
            >
              {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              <span>{isAr ? "احجز موعداً آخر" : "Schedule Another Appointment"}</span>
            </button>
          </motion.div>
        ) : (
          <motion.form
            id="appointment-scheduler-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Treatment Selector */}
            <div className="space-y-2">
              <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                {t.formService}
              </label>
              <div className="relative">
                <select
                  id="select-treatment"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:focus:border-teal-500 cursor-pointer ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {isAr ? srv.titleAr : srv.titleEn} — ({isAr ? srv.priceAr : srv.priceEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Patient Name */}
              <div className="space-y-2">
                <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                  {t.formName}
                </label>
                <div className="relative">
                  <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isAr ? 'left-4' : 'right-4'}`}>
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="input-patient-name"
                    type="text"
                    required
                    placeholder={isAr ? "عبد الله العتيبي" : "eg. Sarah Smith"}
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:focus:border-teal-500 ${isAr ? 'text-right font-arabic pl-11 pr-4' : 'text-left font-sans pr-11 pl-4'}`}
                  />
                </div>
              </div>

              {/* Patient Phone */}
              <div className="space-y-2">
                <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                  {t.formPhone}
                </label>
                <div className="relative">
                  <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isAr ? 'left-4' : 'right-4'}`}>
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    id="input-patient-phone"
                    type="tel"
                    required
                    placeholder={isAr ? "05xxxxxxxx" : "05xxxxxxxx"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:focus:border-teal-500 ${isAr ? 'text-right font-arabic pl-11 pr-4' : 'text-left font-sans pr-11 pl-4'}`}
                  />
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                {t.formDate}
              </label>
              <div className="relative">
                <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isAr ? 'left-4' : 'right-4'}`}>
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  id="input-booking-date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:focus:border-teal-500 cursor-pointer ${isAr ? 'text-right font-arabic pl-11 pr-4' : 'text-left font-sans pr-11 pl-4'}`}
                />
              </div>
            </div>

            {/* Time Slot Selection Grid */}
            <div className="space-y-2">
              <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                {t.formTime}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      id={`time-slot-${slot.replace(/\s+/g, "-")}`}
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl py-2.5 px-3 text-xs font-medium border transition-all duration-200 cursor-pointer text-center
                        ${isSelected
                          ? "bg-teal-600 text-white border-teal-600 shadow-md"
                          : "border-slate-100 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-900"
                        }
                      `}
                    >
                      <span className="block font-mono">{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Area */}
            <div className="space-y-2">
              <label className={`block text-xs font-semibold text-slate-600 dark:text-slate-400 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                {t.formNotes}
              </label>
              <div className="relative">
                <span className={`absolute top-3 text-slate-400 pointer-events-none ${isAr ? 'left-4' : 'right-4'}`}>
                  <FileText className="h-4 w-4" />
                </span>
                <textarea
                  id="textarea-booking-notes"
                  placeholder={isAr ? "مثال: حساسية أو خوف من الإبر، مراجعة دورية، ألم في الضواحك..." : "eg. I have wisdom teeth pain, please advise."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:focus:border-teal-500 ${isAr ? 'text-right font-arabic pl-11 pr-4' : 'text-left font-sans pr-11 pl-4'}`}
                />
              </div>
            </div>

            {errorMessage && (
              <div className={`p-4 rounded-xl text-sm font-semibold border ${isAr ? 'text-right' : 'text-left'} bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`}>
                {errorMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              id="btn-submit-appointment"
              type="submit"
              disabled={isSubmitting || !selectedSlot}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                ${!selectedSlot 
                  ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 shadow-none" 
                  : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 hover:shadow-teal-100 dark:hover:shadow-none"
                }
                ${isAr ? 'font-arabic flex-row-reverse' : 'font-sans flex-row'}
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t.formSubmitting}</span>
                </>
              ) : (
                <>
                  <Clock className="h-4.5 w-4.5" />
                  <span>{t.formSubmit}</span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Slide-over or modal for viewing Patient Appoints history */}
      <AnimatePresence>
        {showAppointmentsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              id="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAppointmentsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              id="appointments-history-modal"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 z-10"
            >
              <div className={`flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-800 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <h4 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                  {t.viewAppointments}
                </h4>
                <button
                  id="btn-close-appointments-modal"
                  onClick={() => setShowAppointmentsModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {myAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Calendar className="mx-auto h-12 w-12 mb-2 text-slate-300" />
                  <p className={`text-sm ${isAr ? 'font-arabic' : 'font-sans'}`}>{t.noAppointments}</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                  {myAppointments.map((item) => {
                    const srv = services.find((s) => s.id === item.serviceId);
                    return (
                      <div
                        id={`patient-appointment-record-${item.id}`}
                        key={item.id}
                        className={`flex justify-between items-start p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 ${isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                            ID: {item.id}
                          </p>
                          <h5 className={`font-bold text-slate-800 dark:text-white text-sm ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {isAr ? srv?.titleAr : srv?.titleEn}
                          </h5>
                          <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={isAr ? 'font-arabic' : 'font-sans'}>
                              <strong>{t.patientName}:</strong> {item.patientName}
                            </span>
                            <span className="font-mono">
                              <strong>{t.formDate}:</strong> {item.date}
                            </span>
                            <span className="font-mono">
                              <strong>{t.formTime}:</strong> {item.timeSlot}
                            </span>
                          </div>
                          {item.notes && (
                            <p className={`text-xs text-slate-400 mt-1 italic ${isAr ? 'font-arabic' : 'font-sans'}`}>
                              "{item.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3 justify-between h-full">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border uppercase
                            ${item.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                              : item.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 animate-pulse"
                            }
                          `}>
                            {item.status === "confirmed"
                              ? (isAr ? "مؤكد للوصول" : "Confirmed Arrival")
                              : item.status === "cancelled"
                              ? (isAr ? "ملغي" : "Cancelled")
                              : (isAr ? "بانتظار موافقة الدكتور" : "Pending Dr Approval")
                            }
                          </span>
                          
                          <button
                            id={`btn-cancel-appt-${item.id}`}
                            onClick={() => handleDeleteAppointment(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                            title="Cancel Appointment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
