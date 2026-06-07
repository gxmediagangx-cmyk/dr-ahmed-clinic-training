import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, Auth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocFromServer,
  Firestore
} from "firebase/firestore";
import { Appointment, Review } from "../types";
import firebaseConfig from "./firebase-applet-config.json";

// Detect if custom credentials have been specified (rather than the default placeholders)
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.apiKey.trim() !== "" &&
    firebaseConfig.projectId.trim() !== ""
  );
}

// Global Firebase service holdouts
let app;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase Initialization Failed:", error);
  }
}

export { db, auth };

// Conformance to the System Skill Schema requirement for Diagnostic Error Catching
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const currentAuth = auth;

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error("Firestore Security/Quota Failure details: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// SECURE DATA ACCESS WRAPPERS (WITH STANDALONE FALLS-BACK)
// -------------------------------------------------------------

// Validate Firestore connection on boot up if configured
if (isFirebaseConfigured() && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db!, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("offline")) {
        console.warn("Firebase test connection indicates client is offline. Verify network rules.");
      }
    }
  };
  testConnection();
}

/**
 * APPOINTMENTS MODULE
 */
export function subscribeToAppointments(callback: (appointments: Appointment[]) => void): () => void {
  const fallbackKey = "dr_ahmed_appointments";

  if (!isFirebaseConfigured() || !db) {
    // Falls back seamlessly to LocalStorage subscription and local storage events
    const loadLocal = () => {
      const stored = localStorage.getItem(fallbackKey);
      callback(stored ? JSON.parse(stored) : []);
    };
    loadLocal();
    window.addEventListener("storage", loadLocal);
    window.addEventListener("appointments-updated", loadLocal);
    
    return () => {
      window.removeEventListener("storage", loadLocal);
      window.removeEventListener("appointments-updated", loadLocal);
    };
  }

  // Real-time Firestore Sync with custom error mapping
  const appointmentsCol = collection(db, "appointments");
  const q = query(appointmentsCol, orderBy("date", "desc"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          patientName: data.patientName || "",
          phone: data.phone || "",
          serviceId: data.serviceId || "",
          date: data.date || "",
          timeSlot: data.timeSlot || "",
          notes: data.notes || "",
          status: data.status || "pending",
        });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, "appointments");
    }
  );
}

export async function addAppointment(appointment: Omit<Appointment, "id"> & { id?: string }): Promise<string> {
  const fallbackKey = "dr_ahmed_appointments";
  const idStr = appointment.id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullItem: Appointment = { ...appointment, id: idStr };

  if (!isFirebaseConfigured() || !db) {
    // Safe LocalStorage creation
    const stored = localStorage.getItem(fallbackKey);
    const existingList: Appointment[] = stored ? JSON.parse(stored) : [];
    existingList.push(fullItem);
    localStorage.setItem(fallbackKey, JSON.stringify(existingList));
    // Trigger update notification
    window.dispatchEvent(new Event("appointments-updated"));
    return idStr;
  }

  // Firestore creation
  const appointmentsCol = collection(db, "appointments");
  try {
    const docRef = await addDoc(appointmentsCol, {
      patientName: fullItem.patientName,
      phone: fullItem.phone,
      serviceId: fullItem.serviceId,
      date: fullItem.date,
      timeSlot: fullItem.timeSlot,
      notes: fullItem.notes || "",
      status: fullItem.status || "pending",
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "appointments");
  }
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
  const fallbackKey = "dr_ahmed_appointments";

  if (!isFirebaseConfigured() || !db) {
    // Safe LocalStorage update
    const stored = localStorage.getItem(fallbackKey);
    if (stored) {
      const existingList: Appointment[] = JSON.parse(stored);
      const updatedList = existingList.map((apt) => 
        apt.id === id ? { ...apt, ...updates } : apt
      );
      localStorage.setItem(fallbackKey, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("appointments-updated"));
    }
    return;
  }

  // Firestore update
  const docRef = doc(db, "appointments", id);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const fallbackKey = "dr_ahmed_appointments";

  if (!isFirebaseConfigured() || !db) {
    // Safe LocalStorage deletion
    const stored = localStorage.getItem(fallbackKey);
    if (stored) {
      const existingList: Appointment[] = JSON.parse(stored);
      const filteredList = existingList.filter((apt) => apt.id !== id);
      localStorage.setItem(fallbackKey, JSON.stringify(filteredList));
      window.dispatchEvent(new Event("appointments-updated"));
    }
    return;
  }

  // Firestore deletion
  const docRef = doc(db, "appointments", id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
  }
}

/**
 * REVIEWS MODULE
 */
export function subscribeToReviews(callback: (reviews: Review[]) => void): () => void {
  const fallbackKey = "dr_ahmed_reviews";

  if (!isFirebaseConfigured() || !db) {
    const loadLocalReviews = () => {
      const stored = localStorage.getItem(fallbackKey);
      if (stored) {
        callback(JSON.parse(stored));
      } else {
        // Initial clinic reviews from real data.ts in case local storage is blank
        callback([]);
      }
    };
    loadLocalReviews();
    window.addEventListener("storage", loadLocalReviews);
    window.addEventListener("reviews-updated", loadLocalReviews);

    return () => {
      window.removeEventListener("storage", loadLocalReviews);
      window.removeEventListener("reviews-updated", loadLocalReviews);
    };
  }

  // Real-time Firestore Reviews Sync
  const reviewsCol = collection(db, "reviews");
  const q = query(reviewsCol, orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          patientName: data.patientName || "",
          rating: Number(data.rating) || 5,
          commentEn: data.commentEn || "",
          commentAr: data.commentAr || "",
          date: data.date || "",
        });
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, "reviews");
    }
  );
}

export async function addReview(review: Omit<Review, "id"> & { id?: string }): Promise<string> {
  const fallbackKey = "dr_ahmed_reviews";
  const idStr = review.id || `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullReview: Review = { ...review, id: idStr };

  if (!isFirebaseConfigured() || !db) {
    const stored = localStorage.getItem(fallbackKey);
    const existingList: Review[] = stored ? JSON.parse(stored) : [];
    existingList.push(fullReview);
    localStorage.setItem(fallbackKey, JSON.stringify(existingList));
    window.dispatchEvent(new Event("reviews-updated"));
    return idStr;
  }

  const reviewsCol = collection(db, "reviews");
  try {
    const docRef = await addDoc(reviewsCol, {
      patientName: fullReview.patientName,
      rating: Number(fullReview.rating),
      commentEn: fullReview.commentEn,
      commentAr: fullReview.commentAr,
      date: fullReview.date,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "reviews");
  }
}
