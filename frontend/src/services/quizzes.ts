import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface QuizRecord {
  id: string;
  title: string;
  posts: any[];
  questions: any[];
  creatorId?: string;
  creatorName?: string;
  creatorStripeAccountId?: string;
  createdAt?: string;
  answerPrice?: number | null;
  isOnboarding?: boolean;
  creatorTaken?: boolean;
}

export type QuizInput = Omit<QuizRecord, 'id' | 'createdAt'> & {
  createdAt?: string;
};

interface QuizDocument {
  title?: string;
  posts?: any[];
  questions?: any[];
  creatorId?: string;
  creatorName?: string;
  creatorStripeAccountId?: string;
  createdAt?: Timestamp | string;
  answerPrice?: number | null;
  isOnboarding?: boolean;
  creatorTaken?: boolean;
}

const quizzesCollection = collection(db, 'quizzes');

const toIsoString = (value?: Timestamp | string) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.toDate().toISOString();
};

const normalizeQuiz = (id: string, data: QuizDocument): QuizRecord => ({
  id,
  title: data.title || 'Untitled Quiz',
  posts: Array.isArray(data.posts) ? data.posts : [],
  questions: Array.isArray(data.questions) ? data.questions : [],
  creatorId: data.creatorId,
  creatorName: data.creatorName,
  creatorStripeAccountId: data.creatorStripeAccountId,
  createdAt: toIsoString(data.createdAt),
  answerPrice: data.answerPrice ?? null,
  isOnboarding: data.isOnboarding,
  creatorTaken: data.creatorTaken,
});

export const createQuiz = async (quiz: QuizInput): Promise<string> => {
  const docRef = await addDoc(quizzesCollection, {
    ...quiz,
    createdAt: quiz.createdAt || serverTimestamp(),
  });
  return docRef.id;
};

export const getQuizzesByCreator = async (creatorId: string): Promise<QuizRecord[]> => {
  const q = query(quizzesCollection, where('creatorId', '==', creatorId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => normalizeQuiz(docSnap.id, docSnap.data() as QuizDocument));
};

export const getAllQuizzes = async (): Promise<QuizRecord[]> => {
  const snapshot = await getDocs(quizzesCollection);
  return snapshot.docs.map((docSnap) => normalizeQuiz(docSnap.id, docSnap.data() as QuizDocument));
};

export const getQuizById = async (quizId: string): Promise<QuizRecord | null> => {
  const snapshot = await getDoc(doc(db, 'quizzes', quizId));
  if (!snapshot.exists()) return null;
  return normalizeQuiz(snapshot.id, snapshot.data() as QuizDocument);
};

export const deleteQuizById = async (quizId: string): Promise<void> => {
  await deleteDoc(doc(db, 'quizzes', quizId));
};

export const markQuizCreatorTaken = async (quizId: string): Promise<void> => {
  await updateDoc(doc(db, 'quizzes', quizId), { creatorTaken: true });
};
