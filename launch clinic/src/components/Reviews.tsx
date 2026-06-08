/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, Plus, CheckCircle2 } from "lucide-react";
import { Review, Language } from "../types";
import { translations, initialReviews } from "../data";
import { subscribeToReviews, addReview } from "../lib/firebase";

interface ReviewsProps {
  language: Language;
}

export const Reviews: React.FC<ReviewsProps> = ({ language }) => {
  const isAr = language === "ar";
  const t = translations[language];

  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New review form fields
  const [patientName, setPatientName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Load reviews on mount
  useEffect(() => {
    const unsubscribe = subscribeToReviews((reviews) => {
      if (reviews.length === 0) {
        setReviewsList(initialReviews);
      } else {
        setReviewsList(reviews);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !comment) return;

    try {
      await addReview({
        patientName,
        rating,
        commentEn: isAr ? "" : comment,
        commentAr: isAr ? comment : "",
        date: new Date().toISOString().split("T")[0]
      });

      // Form reset
      setPatientName("");
      setRating(5);
      setComment("");
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowAddForm(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  };

  // Calculate stats
  const averageRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
    : "5.0";

  return (
    <div className="space-y-8" id="reviews-section-wrapper">
      
      {/* Header and Rating Overview Row */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h3 className={`text-3xl font-bold text-slate-800 dark:text-slate-100 ${isAr ? 'font-arabic text-right' : 'font-sans text-left'}`}>
            {t.reviewsTitle}
          </h3>
          <p className={`mt-2 text-slate-500 dark:text-slate-400 max-w-xl text-sm ${isAr ? 'font-arabic text-right' : 'font-sans text-left'}`}>
            {t.reviewsSubtitle}
          </p>
        </div>

        {/* Rating Card Overview */}
        <div className={`flex items-center gap-4 p-4 bg-teal-50/50 dark:bg-slate-900 border border-teal-100/40 rounded-2xl ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="text-center">
            <span className="block text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
              {averageRating}
            </span>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 fill-current ${
                    s <= Math.round(Number(averageRating)) ? "text-amber-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className={`text-[10px] text-slate-400 block mt-1 ${isAr ? 'font-arabic' : 'font-sans'}`}>
              {reviewsList.length} {isAr ? "تقييم حقيقي" : "Total Reviews"}
            </span>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Add review btn */}
          <button
            id="btn-toggle-add-review-form"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-xs border border-teal-500/30 cursor-pointer ${isAr ? 'font-arabic flex-row-reverse' : 'font-sans'}`}
          >
            <Plus className="h-4 w-4" />
            <span>{t.addReviewBtn}</span>
          </button>
        </div>
      </div>

      {/* Write a Review Drawer/Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            id="add-review-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-inner"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-teal-500 mb-2" />
                <p className={`font-bold text-slate-700 dark:text-slate-200 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                  {t.reviewSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-dashed border-slate-200 dark:border-slate-800 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
                  <h4 className={`text-md font-bold text-slate-800 dark:text-slate-100 ${isAr ? 'font-arabic text-right' : 'font-sans text-left'}`}>
                    {isAr ? "تعبئة استمارة التقييم الطبي" : "Patient Satisfaction Form"}
                  </h4>
                  
                  {/* Interactive Star Selector */}
                  <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-xs text-slate-500 ${isAr ? 'font-arabic' : 'font-sans'}`}>
                      {t.ratingText}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          id={`star-btn-${starVal}`}
                          key={starVal}
                          type="button"
                          onClick={() => setRating(prev => (prev === starVal ? starVal - 1 : starVal))}
                          className="p-0.5 text-amber-400 transition hover:scale-125 hover:text-amber-500 cursor-pointer"
                        >
                          <Star className={`h-5 w-5 ${starVal <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 fill-none"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1 space-y-1.5">
                    <label className={`block text-xs font-semibold text-slate-500 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                      {isAr ? "اسم المريض للتأكيد" : "Patient Name (En/Ar)*"}
                    </label>
                    <input
                      id="input-review-name"
                      type="text"
                      required
                      placeholder={isAr ? "مثال: مريم الفهد" : "eg. Mary Parker"}
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className={`block text-xs font-semibold text-slate-500 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}>
                      {isAr ? t.commentTextAr : t.commentTextEn}
                    </label>
                    <input
                      id="input-review-comment"
                      type="text"
                      required
                      placeholder={isAr ? "رأيك في تعامل د. أحمد والنظافة..." : "Excellent dental care..."}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 ${isAr ? 'text-right font-arabic' : 'text-left font-sans'}`}
                    />
                  </div>
                </div>

                <div className={`flex justify-end pt-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                  <button
                    id="btn-submit-review"
                    type="submit"
                    className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center justify-center cursor-pointer ${isAr ? 'font-arabic' : 'font-sans'}`}
                  >
                    {t.submitReview}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of reviews */}
      <div className="grid gap-6 md:grid-cols-3">
        {reviewsList.map((review, i) => {
          const commentToShow = isAr 
            ? (review.commentAr || review.commentEn) 
            : (review.commentEn || review.commentAr);

          const isCustom = review.id.startsWith("rev_");

          return (
            <motion.div
              id={`review-card-${review.id}`}
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
            >
              <div>
                {/* Rating display */}
                <div className={`flex items-center justify-between mb-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 fill-current ${
                          star <= review.rating ? "text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {isCustom && (
                    <span className="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-sm dark:bg-teal-950/20 dark:text-teal-400">
                      {isAr ? "مستخدم حقيقي" : "Verified Patient"}
                    </span>
                  )}
                </div>

                {/* Comment quote */}
                <p className={`text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed ${isAr ? 'font-arabic text-right' : 'font-sans text-left'}`}>
                  "{commentToShow}"
                </p>
              </div>

              {/* Patient signature footer */}
              <div className={`mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center gap-3 justify-between ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <div>
                  <h5 className={`font-bold text-slate-800 dark:text-slate-200 text-xs ${isAr ? 'font-arabic' : 'font-sans'}`}>
                    {review.patientName}
                  </h5>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {review.date}
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs dark:bg-slate-800 dark:text-slate-400 uppercase">
                  {review.patientName.charAt(0)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
