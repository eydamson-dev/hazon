import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Devotion } from '../types/devotional';

const DEVOTIONAL_KEYS = {
  DEVOTIONS: 'devotions_list',
};

export async function getDevotions(): Promise<Devotion[]> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    if (data) {
      const allDevotions: Devotion[] = JSON.parse(data);
      return allDevotions.filter(d => !d.isDeleted);
    }
    return [];
  } catch (error) {
    console.error('Error getting devotions:', error);
    return [];
  }
}

export async function getTrashDevotions(): Promise<Devotion[]> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    if (data) {
      const allDevotions: Devotion[] = JSON.parse(data);
      return allDevotions.filter(d => d.isDeleted);
    }
    return [];
  } catch (error) {
    console.error('Error getting trash devotions:', error);
    return [];
  }
}

export async function saveDevotion(devotion: Devotion): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    let allDevotions: Devotion[] = data ? JSON.parse(data) : [];
    
    const existingIndex = allDevotions.findIndex(d => d.id === devotion.id);
    if (existingIndex >= 0) {
      allDevotions[existingIndex] = { ...devotion, updatedAt: new Date().toISOString() };
    } else {
      allDevotions.push(devotion);
    }
    
    await AsyncStorage.setItem(DEVOTIONAL_KEYS.DEVOTIONS, JSON.stringify(allDevotions));
    return true;
  } catch (error) {
    console.error('Error saving devotion:', error);
    return false;
  }
}

export async function deleteDevotion(id: string): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    if (!data) return false;
    
    let allDevotions: Devotion[] = JSON.parse(data);
    const index = allDevotions.findIndex(d => d.id === id);
    
    if (index >= 0) {
      allDevotions[index].isDeleted = true;
      allDevotions[index].deletedAt = new Date().toISOString();
      await AsyncStorage.setItem(DEVOTIONAL_KEYS.DEVOTIONS, JSON.stringify(allDevotions));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting devotion:', error);
    return false;
  }
}

export async function restoreDevotion(id: string): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    if (!data) return false;
    
    let allDevotions: Devotion[] = JSON.parse(data);
    const index = allDevotions.findIndex(d => d.id === id);
    
    if (index >= 0) {
      allDevotions[index].isDeleted = false;
      allDevotions[index].deletedAt = undefined;
      await AsyncStorage.setItem(DEVOTIONAL_KEYS.DEVOTIONS, JSON.stringify(allDevotions));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error restoring devotion:', error);
    return false;
  }
}

export async function permanentlyDeleteDevotion(id: string): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    if (!data) return false;
    
    let allDevotions: Devotion[] = JSON.parse(data);
    allDevotions = allDevotions.filter(d => d.id !== id);
    
    await AsyncStorage.setItem(DEVOTIONAL_KEYS.DEVOTIONS, JSON.stringify(allDevotions));
    return true;
  } catch (error) {
    console.error('Error permanently deleting devotion:', error);
    return false;
  }
}

export async function emptyTrash(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(DEVOTIONAL_KEYS.DEVOTIONS);
    if (!data) return true;
    
    let allDevotions: Devotion[] = JSON.parse(data);
    allDevotions = allDevotions.filter(d => !d.isDeleted);
    
    await AsyncStorage.setItem(DEVOTIONAL_KEYS.DEVOTIONS, JSON.stringify(allDevotions));
    return true;
  } catch (error) {
    console.error('Error emptying trash:', error);
    return false;
  }
}

export function generateDevotionId(): string {
  return `devotion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
