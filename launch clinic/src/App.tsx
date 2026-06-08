/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Star, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  Menu, 
  X, 
  Award, 
  Languages, 
  Heart,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon
} from "lucide-react";

import { Language, ActivePage } from "./types";
import { dentalServices, translations } from "./data";
import { ServiceCard } from "./components/ServiceCard";
import { BookingForm } from "./components/BookingForm";
import { Reviews } from "./components/Reviews";
import { AdminDashboard } from "./components/AdminDashboard";
import { LandingPage } from "./components/LandingPage";

import clinicHeroImg from "./assets/images/clinic_hero_1780763027362.png";
import drAhmedImg from "./assets/images/dr_ahmed_1780763042875.png";

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("dr_ahmed_lang");
    return (saved as Language) || "ar";
  });

  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const saved = localStorage.getItem("dr_ahmed_active_page");
    return (saved as ActivePage) || "home";
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("dr_ahmed_theme");
    return (saved as "light" | "dark") || "light";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("cosmetic");
  const [isOpenNow, setIsOpenNow] = useState(true);

  // Synchronize dark class list in document header
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("dr_ahmed_theme", theme);
  }, [theme]);

  // Update HTML direction & lang attribute dynamically
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("dr_ahmed_lang", language);
  }, [language]);

  // Sync active page in storage
  useEffect(() => {
    localStorage.setItem("dr_ahmed_active_page", activePage);
  }, [activePage]);

  // Dynamic Open/Closed clinical status indicator based on actual local time and Saudi timezone (UTC+3)
  useEffect(() => {
    const checkClinicalHours = () => {
      const now = new Date();
      // Adjust to UTC+3 for Saudi local clinic scheduling
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const saudiTime = new Date(utc + (3600000 * 3));
      
      const day = saudiTime.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      const hours = saudiTime.getHours();

      // Clinic is closed on Fridays (5)
      if (day === 5) {
        setIsOpenNow(false);
        return;
      }

      // Clinic is open 10:00 AM to 9:00 PM (10:00 to 21:00)
      if (hours >= 10 && hours < 21) {
        setIsOpenNow(true);
      } else {
        setIsOpenNow(false);
      }
    };

    checkClinicalHours();
    const interval = setInterval(checkClinicalHours, 60000);
    return () => clearInterval(interval);
  }, []);

  const t = translations[language];
  const isAr = language === "ar";

  const handleBookService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActivePage("book");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-800 dark:bg-slate-950 dark:text-slate-200 flex flex-col justify-between ${isAr ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Clinically Designed Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-100 shadow-xs backdrop-blur-md dark:bg-slate-950/95 dark:border-slate-900 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo with clinical Icon */}
            <div 
              onClick={() => handleNavigate("home")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10 flex-shrink-0">
                <Heart className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <span className="block text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                  {t.clinicName}
                </span>
                <span className="block text-[11px] font-medium text-teal-600 dark:text-teal-400">
                  {t.clinicSub}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-3 lg:gap-5">
              <button 
                onClick={() => handleNavigate("home")}
                className={`text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer py-1 px-2.5 rounded-lg
                  ${activePage === "home" 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" 
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
                  }`}
              >
                {t.navHome}
              </button>
              <button 
                onClick={() => handleNavigate("services")}
                className={`text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer py-1 px-2.5 rounded-lg
                  ${activePage === "services" 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" 
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
                  }`}
              >
                {t.navServices}
              </button>
              <button 
                onClick={() => handleNavigate("doctor")}
                className={`text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer py-1 px-2.5 rounded-lg
                  ${activePage === "doctor" 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" 
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
                  }`}
              >
                {t.navDoctor}
              </button>
              <button 
                onClick={() => handleNavigate("reviews")}
                className={`text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer py-1 px-2.5 rounded-lg
                  ${activePage === "reviews" 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" 
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
                  }`}
              >
                {t.navReviews}
              </button>
              <button 
                onClick={() => handleNavigate("contact")}
                className={`text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer py-1 px-2.5 rounded-lg
                  ${activePage === "contact" 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" 
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
                  }`}
              >
                {isAr ? "اتصل بنا" : "Contact"}
              </button>
              <button 
                onClick={() => handleNavigate("admin")}
                className={`text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer py-1 px-2.5 rounded-lg flex items-center gap-1.5
                  ${activePage === "admin" 
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" 
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
                  }`}
              >
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>{isAr ? "بوابة الأطباء" : "Doctor Portal"}</span>
              </button>
            </nav>

            {/* Direct Phone Call & Language trigger */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* Language toggle element */}
              <button
                id="btn-lang-switcher"
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition cursor-pointer dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <Languages className="h-4 w-4 text-teal-600" />
                <span>{isAr ? "English" : "العربية"}</span>
              </button>

              {/* Theme switcher */}
              <button
                id="btn-theme-switcher"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                title={isAr ? "تغيير المظهر" : "Toggle theme"}
              >
                {theme === "light" ? (
                  <Moon className="h-4.5 w-4.5 text-slate-600" />
                ) : (
                  <Sun className="h-4.5 w-4.5 text-amber-400 font-bold" />
                )}
              </button>

              {/* Instant Book clinical tab dispatcher */}
              <button
                id="btn-header-booking"
                onClick={() => handleNavigate("book")}
                className={`font-bold text-xs py-2.5 px-4 lg:px-5 rounded-xl shadow-md transition-all cursor-pointer
                  ${activePage === "book"
                    ? "bg-teal-700 text-white shadow-teal-500/10"
                    : "bg-teal-600 hover:bg-teal-700 text-white hover:scale-101"
                  }`}
              >
                {t.navBook}
              </button>
            </div>

            {/* Mobile Actions panel */}
            <div className="flex md:hidden items-center gap-3">
              {/* Language switch button */}
              <button
                id="btn-lang-switcher-mobile"
                onClick={toggleLanguage}
                className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
              >
                <Languages className="h-5 w-5 text-teal-600" />
              </button>

              {/* Mobile theme switch button */}
              <button
                id="btn-theme-switcher-mobile"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-305 dark:hover:bg-slate-900 cursor-pointer"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-slate-650" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
              </button>

              {/* Mobile hamburger menu */}
              <button
                id="mobile-menu-trigger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu with page redirect handlers */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation-dropdown"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-900 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4 flex flex-col">
                <button
                  onClick={() => handleNavigate("home")}
                  className={`text-sm font-semibold py-2 border-b border-slate-50 hover:text-teal-600 dark:border-slate-900 dark:text-slate-400 ${isAr ? 'text-right' : 'text-left'} ${activePage === "home" ? "text-teal-600 font-bold" : "text-slate-600"}`}
                >
                  {t.navHome}
                </button>
                <button
                  onClick={() => handleNavigate("services")}
                  className={`text-sm font-semibold py-2 border-b border-slate-50 hover:text-teal-600 dark:border-slate-900 dark:text-slate-400 ${isAr ? 'text-right' : 'text-left'} ${activePage === "services" ? "text-teal-600 font-bold" : "text-slate-600"}`}
                >
                  {t.navServices}
                </button>
                <button
                  onClick={() => handleNavigate("doctor")}
                  className={`text-sm font-semibold py-2 border-b border-slate-50 hover:text-teal-600 dark:border-slate-900 dark:text-slate-400 ${isAr ? 'text-right' : 'text-left'} ${activePage === "doctor" ? "text-teal-600 font-bold" : "text-slate-600"}`}
                >
                  {t.navDoctor}
                </button>
                <button
                  onClick={() => handleNavigate("reviews")}
                  className={`text-sm font-semibold py-2 border-b border-slate-50 hover:text-teal-600 dark:border-slate-900 dark:text-slate-400 ${isAr ? 'text-right' : 'text-left'} ${activePage === "reviews" ? "text-teal-600 font-bold" : "text-slate-600"}`}
                >
                  {t.navReviews}
                </button>
                <button
                  onClick={() => handleNavigate("contact")}
                  className={`text-sm font-semibold py-2 border-b border-slate-50 hover:text-teal-600 dark:border-slate-900 dark:text-slate-400 ${isAr ? 'text-right' : 'text-left'} ${activePage === "contact" ? "text-teal-600 font-bold" : "text-slate-600"}`}
                >
                  {isAr ? "الموقع وساعات العمل" : "Location & Hours"}
                </button>
                <button
                  onClick={() => handleNavigate("admin")}
                  className={`text-sm font-semibold py-2 border-b border-slate-50 hover:text-teal-600 dark:border-slate-900 dark:text-slate-400 ${isAr ? 'text-right' : 'text-left'} ${activePage === "admin" ? "text-teal-600 font-bold" : "text-slate-600"}`}
                >
                  {isAr ? "بوابة الأطباء (مدير)" : "Doctor Admin Portal"}
                </button>
                
                <button
                  onClick={() => handleNavigate("book")}
                  className="w-full bg-teal-600 py-3 text-center text-white font-bold rounded-xl text-sm shadow-md"
                >
                  {t.navBook}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Single Page Tab Shell with dynamic frame transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {/* Page 1: Home View with Hero and Bento CTA Widgets */}
            {activePage === "home" && (
              <LandingPage 
                language={language}
                isOpenNow={isOpenNow}
                onNavigate={handleNavigate}
                clinicHeroImg={clinicHeroImg}
              />
            )}

            {/* Page 2: Services & Treatments List view */}
            {activePage === "services" && (
              <section id="services-page-view" className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Title */}
                  <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 px-3 py-1 rounded-sm">
                      {isAr ? "خياراتكم العلاجية الرقمية" : "Standard Professional Treatments"}
                    </span>
                    <h1 className={`text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight ${isAr ? 'font-arabic' : 'font-sans'}`}>
                      {t.servicesTitle}
                    </h1>
                    <p className={`text-slate-500 dark:text-slate-400 text-sm leading-relaxed ${isAr ? 'font-arabic' : 'font-sans'}`}>
                      {t.servicesSubtitle}
                    </p>
                  </div>

                  {/* Services Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {dentalServices.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        language={language}
                        onBook={handleBookService}
                        index={index}
                      />
                    ))}
                  </div>

                </div>
              </section>
            )}

            {/* Page 3: About Lead Doctor view */}
            {activePage === "doctor" && (
              <section id="doctor-page-view" className="py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className={`grid gap-12 lg:grid-cols-12 items-center ${isAr ? 'lg:flex-row-reverse' : ''}`}>
                    
                    {/* Dr. Ahmed Portrait Frame */}
                    <div className="lg:col-span-5 relative text-center">
                      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl" />
                      <div className="relative rounded-3xl border-4 border-white bg-slate-100 shadow-2xl dark:border-slate-900 overflow-hidden aspect-square max-w-sm mx-auto">
                        <img 
                          src={drAhmedImg} 
                          alt="Dr. Ahmed DDS" 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-top select-none"
                        />
                      </div>
                    </div>

                    {/* Bio details */}
                    <div className={`lg:col-span-7 space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-sm">
                          {isAr ? "رائد جراحة وزواية الأسنان بالرياض" : "Meet Lead Surgeon & Implant Specialist"}
                        </span>
                        <h1 className={`text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight ${isAr ? 'font-arabic' : 'font-sans'}`}>
                          {t.drTitle}
                        </h1>
                        <p className="text-teal-600 dark:text-teal-400 font-semibold text-md">
                          {t.drSubtitle}
                        </p>
                      </div>

                      <div className="space-y-4 text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                        <p className={isAr ? 'font-arabic' : 'font-sans'}>{t.drBio1}</p>
                        <p className={isAr ? 'font-arabic' : 'font-sans'}>{t.drBio2}</p>
                      </div>

                      {/* Credentials list */}
                      <div className={`grid gap-3 sm:grid-cols-2 pt-4 ${isAr ? 'text-right' : 'text-left'}`}>
                        {[t.drCred1, t.drCred2, t.drCred3, t.drCred4].map((cred, i) => (
                          <div 
                            key={i} 
                            className={`flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <span className="mt-0.5 rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/40 p-1 flex-shrink-0">
                              <Award className="h-3.5 w-3.5" />
                            </span>
                            <span className={isAr ? 'font-arabic' : 'font-sans'}>{cred}</span>
                          </div>
                        ))}
                      </div>

                      <div className={`pt-6 ${isAr ? 'text-right' : 'text-left'}`}>
                        <button
                          onClick={() => handleNavigate("book")}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-xs cursor-pointer shadow-md transition"
                        >
                          {isAr ? "احجز استشارتك مع د. أحمد" : "Schedule Clinical Session with Dr. Ahmed"}
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              </section>
            )}

            {/* Page 4: Reviews & Testimonials view */}
            {activePage === "reviews" && (
              <section id="reviews-page-view" className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Reviews language={language} />
                </div>
              </section>
            )}

            {/* Page 5: Scheduling Appointment booking form view */}
            {activePage === "book" && (
              <section id="book-page-view" className="py-12 md:py-16 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                  <BookingForm 
                    services={dentalServices} 
                    language={language}
                    selectedServiceId={selectedServiceId}
                    onSuccess={() => {}}
                  />
                </div>
              </section>
            )}

            {/* Page 6: Contact hours and street location map view */}
            {activePage === "contact" && (
              <section id="contact-page-view" className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className={`grid gap-12 lg:grid-cols-12 items-stretch ${isAr ? 'lg:flex-row-reverse' : ''}`}>
                    
                    {/* Operating timetable info column */}
                    <div className={`lg:col-span-5 flex flex-col justify-between space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-sm">
                          {isAr ? "الوصول اللطيف والسريع" : "Clinical Timings & Location"}
                        </span>
                        <h1 className={`text-3xl font-extrabold text-slate-900 dark:text-white mt-3 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                          {t.contactTitle}
                        </h1>
                      </div>

                      {/* Timetable widget */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                        <div className={`flex items-center justify-between py-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {t.operatingDays}
                          </span>
                          <span className="text-sm font-bold text-teal-600 dark:text-teal-400 font-mono">
                            {t.operatingHours}
                          </span>
                        </div>
                        <div className={`flex items-center justify-between py-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {t.operatingFriday}
                          </span>
                          <span className="text-sm font-bold text-slate-400 font-mono">
                            {t.operatingFridayHours}
                          </span>
                        </div>
                      </div>

                      {/* Physical Address description */}
                      <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm flex items-start gap-4 ${isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 flex-shrink-0">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className={`font-bold text-slate-850 dark:text-slate-200 text-sm ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {t.locationLabel}
                          </h4>
                          <p className={`text-xs text-slate-500 dark:text-slate-400 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {t.address}
                          </p>
                          
                          <a
                            id="btn-external-directions-tab"
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:underline pt-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <span>{t.getDirections}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Phone Center access */}
                      <div className={`p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-900 border border-teal-100/40 ${isAr ? 'text-right' : 'text-left'}`}>
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? "اتصال هاتفي مباشر بالمنسق:" : "Coordinator Hotline:"}</span>
                        <a href="tel:+966555123456" className="text-lg font-extrabold text-teal-700 dark:text-teal-400 block font-mono mt-1 hover:underline">
                          +966 55 512 3456
                        </a>
                      </div>
                    </div>

                    {/* Schematic map */}
                    <div className="lg:col-span-7">
                      <div className="relative h-full min-h-[350px] border border-slate-150 dark:border-slate-850 rounded-3xl bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
                        <div className="absolute inset-0 bg-teal-50/20 dark:bg-slate-900 opacity-60 pointer-events-none" />
                        <div className="absolute inset-x-0 top-1/3 h-10 bg-slate-200/50 dark:bg-slate-800 rotate-12" />
                        <div className="absolute inset-y-0 left-1/2 w-12 bg-slate-200/50 dark:bg-slate-800 -rotate-45" />
                        
                        <div className="relative flex flex-col items-center z-10 p-5 text-center">
                          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl">
                            <span className="absolute -inset-2 rounded-full border-2 border-teal-500 animate-ping opacity-45" />
                            <Heart className="h-6 w-6" strokeWidth={2.5} />
                          </div>
                          <h4 className={`font-extrabold text-slate-900 dark:text-white text-md ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {t.clinicName}
                          </h4>
                          <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs ${isAr ? 'font-arabic' : 'font-sans'}`}>
                            {t.address}
                          </p>
                          <a
                            id="btn-open-real-maps-tab"
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 py-2.5 px-5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition cursor-pointer ${isAr ? 'font-arabic' : 'font-sans'}`}
                          >
                            <span>{isAr ? "افتح الموقع في قوقل ماب" : "Open Google Maps Directly"}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            )}

            {activePage === "admin" && (
              <section id="admin-dashboard-view" className="py-12 bg-slate-50/50 dark:bg-slate-950/20 min-h-[500px]">
                <AdminDashboard 
                  language={language} 
                  services={dentalServices} 
                />
              </section>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Unified professional clinic footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            
            {/* Left brand description column */}
            <div className="md:col-span-5 space-y-4">
              <div 
                onClick={() => handleNavigate("home")}
                className={`flex items-center gap-2 cursor-pointer ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  <Heart className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-black text-white text-sm">{t.clinicName}</h4>
              </div>
              <p className={`text-xs leading-relaxed max-w-sm ${isAr ? 'font-arabic text-right' : 'font-sans text-left'}`}>
                {isAr 
                  ? "الرعاية الأحدث وبدون قلق بتصميم تجميلي رقمي متكامل يصاحبك على مدار العام." 
                  : "State-of-the-art modern dentistry, pain-free treatments, and continuous oral hygiene follow-ups."}
              </p>
              
              <div className={`flex items-center gap-2 text-[10px] ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <Clock className="h-3.5 w-3.5 text-teal-500" />
                <span className="font-mono">Saudi Arabia (Riyadh UTC+3) Standard Zone</span>
              </div>
            </div>

            {/* Quick Links Column redirection triggers */}
            <div className={`md:col-span-3 space-y-3 ${isAr ? 'text-right' : 'text-left'}`}>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">{t.quickLinks}</h5>
              <div className="flex flex-col gap-2 text-xs">
                <button onClick={() => handleNavigate("home")} className={`hover:text-teal-400 transition cursor-pointer w-full select-none ${isAr ? 'text-right' : 'text-left'}`}>
                  {t.navHome}
                </button>
                <button onClick={() => handleNavigate("services")} className={`hover:text-teal-400 transition cursor-pointer w-full select-none ${isAr ? 'text-right' : 'text-left'}`}>
                  {t.navServices}
                </button>
                <button onClick={() => handleNavigate("doctor")} className={`hover:text-teal-400 transition cursor-pointer w-full select-none ${isAr ? 'text-right' : 'text-left'}`}>
                  {t.navDoctor}
                </button>
                <button onClick={() => handleNavigate("reviews")} className={`hover:text-teal-400 transition cursor-pointer w-full select-none ${isAr ? 'text-right' : 'text-left'}`}>
                  {t.navReviews}
                </button>
                <button onClick={() => handleNavigate("contact")} className={`hover:text-teal-400 transition cursor-pointer w-full select-none ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? "الموقع وساعات العمل" : "Location & Timetable"}
                </button>
              </div>
            </div>

            {/* Direct call center support link column */}
            <div className={`md:col-span-4 space-y-3 ${isAr ? 'text-right' : 'text-left'}`}>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">{t.contactUs}</h5>
              <div className="space-y-2 text-xs">
                <p>{isAr ? "للحالات الطارئة وأوقات الإجازات:" : "For emergency out-of-hours coverage:"}</p>
                <a href="tel:+966555123456" className="block text-white font-bold text-base hover:text-teal-400 font-mono">
                  +966 55 512 3456
                </a>
                <p className="text-[11px] text-slate-500">
                  Email: info@drahmaddental.com
                </p>
              </div>
            </div>

          </div>

          {/* Copyright signature */}
          <div className="mt-12 pt-8 border-t border-slate-800/60 text-center text-[10px] text-slate-500">
            <p className={isAr ? 'font-arabic' : 'font-sans'}>{t.footerText}</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
