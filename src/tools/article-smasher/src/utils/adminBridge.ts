/**
 * Admin Bridge - Connects ArticleSmasherV2 with the unified admin interface
 * 
 * This utility provides functions to bridge the gap between ArticleSmasherV2
 * and the unified admin interface. It handles exposing the admin context
 * to ArticleSmasherV2 and provides utilities for interacting with the
 * admin interface.
 */

import { PromptTemplate } from '../types';

// Define interface for the admin context
export interface AdminContext {
  prompts: PromptTemplate[];
  activePrompt: PromptTemplate | null;
  setActivePrompt: (prompt: PromptTemplate | null) => void;
  addPrompt: (prompt: any) => Promise<void>;
  updatePrompt: (id: string, prompt: Partial<PromptTemplate>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
}

// Extend the Window interface
declare global {
  interface Window {
    adminContext?: AdminContext;
  }
}

/**
 * Initialize the admin bridge
 * This function should be called when ArticleSmasherV2 is loaded
 */
export const initAdminBridge = (): void => {
  // Check if we're running in the main application
  if (window.parent !== window) {
    try {
      // Try to get the admin context from the parent window
      if (window.parent.adminContext) {
        window.adminContext = window.parent.adminContext;
        console.log('Admin context successfully bridged from parent window');
      }
    } catch (error) {
      console.warn('Failed to bridge admin context from parent window:', error);
    }
  }

  // If we're running in the main application directly
  if (typeof window.adminContext === 'undefined') {
    // Check if there's an adminContext in the global scope
    const globalAdminContext = (window as any).adminContext;
    if (globalAdminContext) {
      window.adminContext = globalAdminContext;
      console.log('Admin context successfully bridged from global scope');
    } else {
      console.log('No admin context found, ArticleSmasherV2 will use local storage');
    }
  }
};

/**
 * Check if the admin context is available
 */
export const isAdminContextAvailable = (): boolean => {
  return typeof window.adminContext !== 'undefined';
};

/**
 * Get prompts from the admin context or return null if not available
 */
export const getPromptsFromAdmin = (): PromptTemplate[] | null => {
  if (isAdminContextAvailable() && Array.isArray(window.adminContext?.prompts)) {
    return window.adminContext!.prompts;
  }
  return null;
};

/**
 * Get a prompt by ID from the admin context or return null if not found
 */
export const getPromptByIdFromAdmin = (id: string): PromptTemplate | null => {
  const prompts = getPromptsFromAdmin();
  if (prompts) {
    return prompts.find(p => p.id === id) || null;
  }
  return null;
};

/**
 * Add a prompt to the admin context
 */
export const addPromptToAdmin = async (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  if (isAdminContextAvailable() && window.adminContext?.addPrompt) {
    try {
      await window.adminContext.addPrompt(prompt);
      return true;
    } catch (error) {
      console.error('Failed to add prompt to admin context:', error);
      return false;
    }
  }
  return false;
};

/**
 * Update a prompt in the admin context
 */
export const updatePromptInAdmin = async (id: string, promptUpdate: Partial<PromptTemplate>): Promise<boolean> => {
  if (isAdminContextAvailable() && window.adminContext?.updatePrompt) {
    try {
      await window.adminContext.updatePrompt(id, promptUpdate);
      return true;
    } catch (error) {
      console.error('Failed to update prompt in admin context:', error);
      return false;
    }
  }
  return false;
};

/**
 * Delete a prompt from the admin context
 */
export const deletePromptFromAdmin = async (id: string): Promise<boolean> => {
  if (isAdminContextAvailable() && window.adminContext?.deletePrompt) {
    try {
      await window.adminContext.deletePrompt(id);
      return true;
    } catch (error) {
      console.error('Failed to delete prompt from admin context:', error);
      return false;
    }
  }
  return false;
};

export default {
  initAdminBridge,
  isAdminContextAvailable,
  getPromptsFromAdmin,
  getPromptByIdFromAdmin,
  addPromptToAdmin,
  updatePromptInAdmin,
  deletePromptFromAdmin
};