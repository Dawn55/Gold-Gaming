import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

export interface GameScore {
  userId: string;
  displayName: string;
  photoURL: string | null;
  gameType: 'snake' | 'pacman';
  score: number;
  timestamp: Date;
}

// Save a new game score
export const saveScore = async (scoreData: Omit<GameScore, 'timestamp'>) => {
  try {
    await addDoc(collection(db, 'scores'), {
      ...scoreData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};

// Get top scores for a specific game
export const getLeaderboard = async (gameType: 'snake' | 'pacman', limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'scores'),
      where('gameType', '==', gameType),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GameScore & { id: string }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get user's best scores
export const getUserBestScores = async (userId: string) => {
  try {
    // Get best Snake score
    const snakeQuery = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      where('gameType', '==', 'snake'),
      orderBy('score', 'desc'),
      limit(1)
    );
    
    // Get best Pacman score
    const pacmanQuery = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      where('gameType', '==', 'pacman'),
      orderBy('score', 'desc'),
      limit(1)
    );
    
    const [snakeSnapshot, pacmanSnapshot] = await Promise.all([
      getDocs(snakeQuery),
      getDocs(pacmanQuery)
    ]);
    
    return {
      snake: snakeSnapshot.docs.length > 0 ? snakeSnapshot.docs[0].data() : null,
      pacman: pacmanSnapshot.docs.length > 0 ? pacmanSnapshot.docs[0].data() : null,
    };
  } catch (error) {
    console.error('Error getting user scores:', error);
    throw error;
  }
};