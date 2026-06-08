/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = "en" | "ar";
export type ActivePage = "home" | "services" | "doctor" | "reviews" | "book" | "contact" | "admin";

export interface DentalService {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceEn: string;
  priceAr: string;
  icon: string; // Lucide icon name
  durationEn: string;
  durationAr: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  commentEn: string;
  commentAr: string;
  date: string;
}

export interface ClinicStats {
  rating: number;
  patientsCount: number;
  yearsExperience: number;
  happyFaces: string;
}
