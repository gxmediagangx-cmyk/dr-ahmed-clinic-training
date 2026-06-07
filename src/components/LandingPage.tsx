/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Phone, 
  MapPin, 
  Activity, 
  Award, 
  Star,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Language, ActivePage } from "../types";
import { translations } from "../data";

interface LandingPageProps {
  language: Language;
  isOpenNow: boolean;
  onNavigate: (page: ActivePage) => void;
  clinicHeroImg: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  isOpenNow,
  onNavigate,
  clinicHeroImg
}) => {
  const t = translations[language];
  const isAr = language === "ar";

  return (
    <div id="home-view-wrapper">
      {/* Hero section */}
      <section id="hero-banner-section" className="relative bg-white dark:bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] pointer-events-none bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:py-20">
          <div className={`grid gap-12 lg:grid-cols-12 items-center ${isAr ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Brand marketing column */}
            <div className={`lg:col-span-7 space-y-6 ${isAr ? "text-right" : "text-left"}`}>
              
              {/* Dynamic Clinical status banner indicator */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold 
                ${isOpenNow 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950" 
                  : "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950"
                } ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{isOpenNow ? t.openNow : t.closedNow}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>{isAr ? "السبت-الخميس: ١٠ ص - ٩ م" : "Sat-Thu: 10 AM - 9 PM"}</span>
              </div>

              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight ${isAr ? 'font-arabic' : 'font-sans'}`}>
                {isAr ? (
                  <>
                    ابتسامة صحية وواثقة بدقة <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">طبيـة فائقـة</span>
                  </>
                ) : (
                  <>
                    Your Journey to a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Perfect Smile</span> Starts Here
                  </>
                )}
              </h1>

              <p className={`text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                {t.heroSubtitle}
              </p>

              {/* Direct Clinical quick action triggers */}
              <div className={`flex flex-col sm:flex-row gap-4 pt-2 ${isAr ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
                <button
                  id="btn-hero-booking-trigger"
                  onClick={() => onNavigate("book")}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/10 transition-all cursor-pointer text-sm"
                >
                  {t.heroCTA}
                </button>

                <div className={`flex items-center gap-3 p-1.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 dark:bg-teal-950/40">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className={isAr ? 'text-right' : 'text-left'}>
                    <span className="block text-[10px] text-slate-400 font-semibold">{t.heroCall}</span>
                    <a href="tel:+966555123456" className="block text-sm font-bold text-slate-700 hover:text-teal-600 dark:text-slate-350 font-mono">
                      +966 55 512 3456
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Right decoration photo column */}
            <div className={`lg:col-span-5 relative`}>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-500 opacity-20 blur-xl pointer-events-none" />
              <div className="relative rounded-3xl border-4 border-white bg-slate-100 shadow-2xl dark:border-white/5 overflow-hidden aspect-[4/3] sm:aspect-[16/11]">
                <img 
                  src={clinicHeroImg} 
                  alt="Dr. Ahmed Dental Clinic Lobby" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover select-none"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Multi-page Bento Navigation Guides */}
      <section id="bento-navigation-section" className="py-12 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {isAr ? "تصفح العيادة بضغطة زر" : "Quick Interactive Entrance"}
            </span>
            <h2 className={`text-2xl font-extrabold text-slate-900 dark:text-white ${isAr ? 'font-arabic' : 'font-sans'}`}>
              {isAr ? "اختر وجهتك الطبية الآن" : "What category are you searching for?"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Bento 1: Services */}
            <motion.div 
              whileHover={{ y: -6 }}
              onClick={() => onNavigate("services")}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-56"
            >
              <div>
                <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-650 dark:bg-teal-950/50 dark:text-teal-400 flex items-center justify-center mb-4">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className={`font-bold text-lg text-slate-850 dark:text-white ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr ? "قائمة الإجراءات والأسعار" : "Treatments & Prices"}
                </h3>
                <p className={`text-xs text-slate-400 dark:text-slate-400 mt-2 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr 
                    ? "شاهد الحلول التجميلية، زراعة الأسنان، الليزر، وتبييض الأسنان وأسعارها وتجوال الجلسات." 
                    : "Review clear custom pricings, specialized laser packages, and estimated treatment times."}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold text-teal-650 dark:text-teal-400 transition-colors ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span>{isAr ? "افتح العيادات" : "Explore Services"}</span>
                {isAr ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            </motion.div>

            {/* Bento 2: Doctor */}
            <motion.div 
              whileHover={{ y: -6 }}
              onClick={() => onNavigate("doctor")}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-56"
            >
              <div>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className={`font-bold text-lg text-slate-850 dark:text-white ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr ? "الملف المهني للدكتور" : "Meet Dr. Ahmed"}
                </h3>
                <p className={`text-xs text-slate-400 dark:text-slate-400 mt-2 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr 
                    ? "تعرف على استشاري زراعة وتجميل الأسنان الحاصل على الزمالات الدولية وخبرته في التقويم." 
                    : "12+ Master's degree specialist on computer-guided zero-anxiety immediate implants."}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-450 transition-colors ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span>{isAr ? "الملف الأكاديمي" : "Read Bio"}</span>
                {isAr ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            </motion.div>

            {/* Bento 3: Reviews */}
            <motion.div 
              whileHover={{ y: -6 }}
              onClick={() => onNavigate("reviews")}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-56"
            >
              <div>
                <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Star className="h-5 w-5 fill-amber-550 text-amber-550" />
                </div>
                <h3 className={`font-bold text-lg text-slate-850 dark:text-white ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr ? "قصص نجاح الابتسامة" : "Verified Patient Stories"}
                </h3>
                <p className={`text-xs text-slate-400 dark:text-slate-400 mt-2 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr 
                    ? "اقرأ مراجعات شركائنا الموثقين بالرياض، وصحّح لثتك وتخلص من الخوف الطفولي." 
                    : "Over 10,000 happy smiles. Read verified reviews or give us your medical experience."}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-450 transition-colors ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span>{isAr ? "تجارب المرضى" : "Read Testimonials"}</span>
                {isAr ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            </motion.div>

            {/* Bento 4: Location & Work Time */}
            <motion.div 
              whileHover={{ y: -6 }}
              onClick={() => onNavigate("contact")}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-56"
            >
              <div>
                <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-450 flex items-center justify-center mb-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className={`font-bold text-lg text-slate-850 dark:text-white ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr ? "العنوان وساعات العمل" : "Riyadh Address & Map"}
                </h3>
                <p className={`text-xs text-slate-400 dark:text-slate-400 mt-2 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
                  {isAr 
                    ? "شارع العليا العام، الرياض. ساعات العمل وسهولة ركن السيارات وخرائط قوقل التفاعلية." 
                    : "Find us in Olaya Street. Open Saturday to Thursday. Direct phone center access."}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold text-rose-650 dark:text-rose-450 transition-colors ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <span>{isAr ? "احصل على الاتجاهات" : "View Hours & Map"}</span>
                {isAr ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            </motion.div>

          </div>

          {/* Simple clinical commitment banner */}
          <div className="mt-12 p-6 rounded-2xl bg-teal-50/40 border border-teal-100/50 dark:bg-teal-950/20 dark:border-teal-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="h-9 w-9 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
              <p className={`text-xs text-slate-600 dark:text-slate-350 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                {isAr 
                  ? "جميع الإجراءات تتم باستخدام تقنيات التعقيم الفيدرالية الأعلى وبلا أي مسببات خوف أو قلق." 
                  : "All procedures are validated with the highest clinical sterilization practices for maximum safety."}
              </p>
            </div>
            <button
              onClick={() => onNavigate("book")}
              className={`text-slate-50 transition border border-teal-600 bg-teal-600 py-1.5 px-4 rounded-xl text-xs font-bold hover:bg-white hover:text-teal-700 cursor-pointer ${isAr ? 'font-arabic' : 'font-sans'}`}
            >
              {isAr ? "مباشرة حجز الحضور" : "Schedule Consultation"}
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};
