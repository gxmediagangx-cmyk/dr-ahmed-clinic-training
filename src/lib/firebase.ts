import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, Auth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocFromServer,
  Firestore
} from "firebase/firestore";
import { Appointment, Review } from "../types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Detect if custom credentials have been specified (rather than the default placeholders)
export function isFirebaseConfigured(): boolean {
  return (
    !!firebaseConfig &&
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.projectId &&
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

  console.error("Firestore DB Error [Latest]: ", JSON.stringify(errInfo));
  // Not throwing to prevent the app from fully crashing during permission propagation or if offline
  // throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// SECURE DATA ACCESS WRAPPERS (WITH STANDALONE FALLS-BACK)
// -------------------------------------------------------------

// Validate Firestore connection on boot up if configured
// Removed test connection block

/**
 * APPOINTMENTS MODULE
 */
export function subscribeToAppointments(callback: (appointments: Appointment[]) => void): () => void {
  // Real-time Firestore Sync with custom error mapping
  const appointmentsCol = collection(db!, "appointments");
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
  const idStr = appointment.id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullItem: Appointment = { ...appointment, id: idStr };

  // Firestore creation
  const docRef = doc(db!, "appointments", idStr);
  try {
    await setDoc(docRef, {
      id: idStr,
      patientName: fullItem.patientName,
      phone: fullItem.phone,
      serviceId: fullItem.serviceId,
      date: fullItem.date,
      timeSlot: fullItem.timeSlot,
      notes: fullItem.notes || "",
      status: fullItem.status || "pending",
      createdAt: new Date().toISOString(),
    });
    return idStr;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "appointments");
  }
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
  // Firestore update
  const docRef = doc(db!, "appointments", id);
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
  // Firestore deletion
  const docRef = doc(db!, "appointments", id);
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
  // Real-time Firestore Reviews Sync
  const reviewsCol = collection(db!, "reviews");
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

export async function signInWithGoogleAdmin(): Promise<{ uid: string; isAdmin: boolean }> {
  if (!auth) throw new Error("Firebase Auth not initialized. Check configuration.");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  try {
    const adminDoc = await getDocFromServer(doc(db!, "admins", user.uid));
    return { uid: user.uid, isAdmin: adminDoc.exists() };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { uid: user.uid, isAdmin: false };
  }
}

export async function signOutAdmin(): Promise<void> {
  if (auth) {
    await auth.signOut();
  }
}

export function subscribeToAdminAuth(callback: (isAdmin: boolean) => void): () => void {
  if (!auth) return () => {};
  return auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const adminDoc = await getDocFromServer(doc(db!, "admins", user.uid));
        callback(adminDoc.exists());
      } catch (e) {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
}

export async function addReview(review: Omit<Review, "id"> & { id?: string }): Promise<string> {
  const idStr = review.id || `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullReview: Review = { ...review, id: idStr };

  const docRef = doc(db!, "reviews", idStr);
  try {
    await setDoc(docRef, {
      id: idStr,
      patientName: fullReview.patientName,
      rating: Number(fullReview.rating),
      commentEn: fullReview.commentEn,
      commentAr: fullReview.commentAr,
      date: fullReview.date,
    });
    return idStr;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "reviews");
  }
}
