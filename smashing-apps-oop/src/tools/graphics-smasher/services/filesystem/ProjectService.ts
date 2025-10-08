import type { DocumentState } from '../../types';

/**
 * Project file format (.gsv - Graphics Smasher Project)
 */
interface ProjectFile {
  version: string;
  document: DocumentState;
  metadata: {
    createdAt: number;
    modifiedAt: number;
    appVersion: string;
  };
}

/**
 * Service for saving and loading Graphics Smasher project files
 */
class ProjectServiceClass {
  private readonly FILE_VERSION = '1.0.0';
  private readonly APP_VERSION = '2.0.0';

  /**
   * Save project to .gsv file
   */
  async saveProject(document: DocumentState): Promise<void> {
    const projectData: ProjectFile = {
      version: this.FILE_VERSION,
      document,
      metadata: {
        createdAt: document.createdAt,
        modifiedAt: Date.now(),
        appVersion: this.APP_VERSION
      }
    };

    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.name}.gsv`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Load project from .gsv file
   */
  async loadProject(): Promise<DocumentState | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.gsv,application/json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const text = await file.text();
          const projectData: ProjectFile = JSON.parse(text);
          
          // Validate version
          if (!projectData.version || !projectData.document) {
            console.error('Invalid project file format');
            resolve(null);
            return;
          }

          // Return the document state
          resolve(projectData.document);
        } catch (error) {
          console.error('Failed to load project:', error);
          resolve(null);
        }
      };
      
      input.click();
    });
  }

  /**
   * Check if document has unsaved changes
   */
  hasUnsavedChanges(document: DocumentState): boolean {
    // Check if there are any history items (indicating changes)
    return document.history.past.length > 0;
  }

  /**
   * Prompt user to save before closing
   */
  async promptSaveBeforeClose(document: DocumentState): Promise<boolean> {
    if (!this.hasUnsavedChanges(document)) {
      return true; // No changes, safe to close
    }

    const result = confirm(
      `Do you want to save changes to "${document.name}"?\n\nYour changes will be lost if you don't save them.`
    );

    if (result) {
      await this.saveProject(document);
    }

    return true; // Allow close after save or if user chose not to save
  }
}

export const ProjectService = new ProjectServiceClass();

