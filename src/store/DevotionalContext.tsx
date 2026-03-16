import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDevotions, getTrashDevotions, saveDevotion, deleteDevotion, restoreDevotion, permanentlyDeleteDevotion, emptyTrash, generateDevotionId } from '../services/devotional';
import type { Devotion, VerseRef } from '../types/devotional';

const PENDING_VERSES_KEY = '@pending_verses_for_devotion';

interface DevotionalContextType {
  devotions: Devotion[];
  trash: Devotion[];
  isLoading: boolean;
  pendingVerses: VerseRef[];
  createDevotion: (title: string, content: string, verseRefs: VerseRef[]) => Promise<boolean>;
  updateDevotion: (id: string, title: string, content: string, verseRefs: VerseRef[], createdAt?: string) => Promise<boolean>;
  deleteDevotion: (id: string) => Promise<boolean>;
  restoreDevotion: (id: string) => Promise<boolean>;
  permanentlyDeleteDevotion: (id: string) => Promise<boolean>;
  emptyTrash: () => Promise<boolean>;
  refreshDevotions: () => Promise<void>;
  setPendingVerses: (verses: VerseRef[]) => Promise<void>;
  clearPendingVerses: () => Promise<void>;
}

const DevotionalContext = createContext<DevotionalContextType | undefined>(undefined);

export function DevotionalProvider({ children }: { children: ReactNode }) {
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [trash, setTrash] = useState<Devotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerses, setPendingVersesState] = useState<VerseRef[]>([]);

  useEffect(() => {
    refreshDevotions();
    loadPendingVerses();
  }, []);

  const loadPendingVerses = async () => {
    try {
      const stored = await AsyncStorage.getItem(PENDING_VERSES_KEY);
      if (stored) {
        setPendingVersesState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending verses:', error);
    }
  };

  const setPendingVerses = async (verses: VerseRef[]) => {
    try {
      await AsyncStorage.setItem(PENDING_VERSES_KEY, JSON.stringify(verses));
      setPendingVersesState(verses);
    } catch (error) {
      console.error('Error saving pending verses:', error);
    }
  };

  const clearPendingVerses = async () => {
    try {
      await AsyncStorage.removeItem(PENDING_VERSES_KEY);
      setPendingVersesState([]);
    } catch (error) {
      console.error('Error clearing pending verses:', error);
    }
  };

  const refreshDevotions = async () => {
    setIsLoading(true);
    try {
      const [devotionsData, trashData] = await Promise.all([
        getDevotions(),
        getTrashDevotions(),
      ]);
      setDevotions(devotionsData);
      setTrash(trashData);
    } catch (error) {
      console.error('Error refreshing devotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDevotion = async (title: string, content: string, verseRefs: VerseRef[]): Promise<boolean> => {
    const now = new Date().toISOString();
    const newDevotion: Devotion = {
      id: generateDevotionId(),
      title,
      content,
      verseRefs,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    
    const success = await saveDevotion(newDevotion);
    if (success) {
      await refreshDevotions();
    }
    return success;
  };

  const updateDevotion = async (id: string, title: string, content: string, verseRefs: VerseRef[], createdAt?: string): Promise<boolean> => {
    const existing = devotions.find(d => d.id === id);
    if (!existing) return false;
    
    const updated: Devotion = {
      ...existing,
      title,
      content,
      verseRefs,
      createdAt: createdAt || existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    const success = await saveDevotion(updated);
    if (success) {
      await refreshDevotions();
    }
    return success;
  };

  const deleteDevotionHandler = async (id: string): Promise<boolean> => {
    const success = await deleteDevotion(id);
    if (success) {
      await refreshDevotions();
    }
    return success;
  };

  const restoreDevotionHandler = async (id: string): Promise<boolean> => {
    const success = await restoreDevotion(id);
    if (success) {
      await refreshDevotions();
    }
    return success;
  };

  const permanentlyDeleteDevotionHandler = async (id: string): Promise<boolean> => {
    const success = await permanentlyDeleteDevotion(id);
    if (success) {
      await refreshDevotions();
    }
    return success;
  };

  const emptyTrashHandler = async (): Promise<boolean> => {
    const success = await emptyTrash();
    if (success) {
      await refreshDevotions();
    }
    return success;
  };

  return (
    <DevotionalContext.Provider
      value={{
        devotions,
        trash,
        isLoading,
        pendingVerses,
        createDevotion,
        updateDevotion,
        deleteDevotion: deleteDevotionHandler,
        restoreDevotion: restoreDevotionHandler,
        permanentlyDeleteDevotion: permanentlyDeleteDevotionHandler,
        emptyTrash: emptyTrashHandler,
        refreshDevotions,
        setPendingVerses,
        clearPendingVerses,
      }}
    >
      {children}
    </DevotionalContext.Provider>
  );
}

export function useDevotional() {
  const context = useContext(DevotionalContext);
  if (context === undefined) {
    throw new Error('useDevotional must be used within a DevotionalProvider');
  }
  return context;
}
