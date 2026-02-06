import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface ContentCreator {
  id: string;
  username: string;
  email: string;
}

export const getContentCreatorsFromFirestore = async (): Promise<ContentCreator[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'Content Creator'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    const creators: ContentCreator[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      creators.push({
        id: doc.id,
        username: data.username || 'Sin nombre',
        email: data.email || '',
      });
    });
    
    return creators;
  } catch (error) {
    console.error('Error getting content creators from Firestore:', error);
    throw error;
  }
};