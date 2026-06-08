/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Sparkles, Activity, Sun, ShieldCheck, Smile, Droplets, Clock, Coins } from "lucide-react";
import { DentalService, Language } from "../types";

interface ServiceCardProps {
  service: DentalService;
  language: Language;
  onBook: (serviceId: string) => void;
  index: number;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Activity,
  Sun,
  ShieldCheck,
  Smile,
  Droplets
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, language, onBook, index }) => {
  const IconComponent = iconMap[service.icon] || Sparkles;
  const isAr = language === "ar";

  const title = isAr ? service.titleAr : service.titleEn;
  const description = isAr ? service.descriptionAr : service.descriptionEn;
  const price = isAr ? service.priceAr : service.priceEn;
  const duration = isAr ? service.durationAr : service.durationEn;

  return (
    <motion.div
      id={`service-card-${service.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-teal-150 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Decorative gradient background pulse on hover */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-teal-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-teal-950/20" />
      
      <div>
        {/* Animated Icon Ring */}
        <div className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/40 dark:text-teal-400">
          <IconComponent className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
        </div>

        <h3 className={`text-xl font-bold text-slate-800 transition-colors duration-200 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
          {title}
        </h3>

        <p className={`mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 ${isAr ? 'font-arabic text-right' : 'font-sans'}`}>
          {description}
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className={`flex items-center justify-between gap-2 text-xs text-slate-400 mb-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-teal-500" />
            <span className={isAr ? 'font-arabic' : 'font-sans'}>
              {isAr ? "السعر:" : "Price:"} <strong className="text-slate-700 dark:text-slate-200">{price}</strong>
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span className={isAr ? 'font-arabic' : 'font-sans'}>
              {duration}
            </span>
          </span>
        </div>

        <button
          id={`btn-book-service-${service.id}`}
          onClick={() => onBook(service.id)}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs transition-all duration-300 border-2 cursor-pointer
            ${isAr ? 'font-arabic' : 'font-sans'}
            border-teal-600 bg-teal-600 text-white hover:bg-white hover:text-teal-700 dark:hover:bg-slate-900`}
        >
          {isAr ? "احجز هذا الإجراء الآن" : "Book Treatment Now"}
        </button>
      </div>
    </motion.div>
  );
};
