import { describe, it, expect, beforeEach } from 'vitest';
import { useGraphicsStore, resetGraphicsStore } from './graphicsStore';

describe('graphicsStore', () => {
  beforeEach(() => {
    resetGraphicsStore();
  });

  it('creates a document with a background layer', () => {
    const createDocument = useGraphicsStore.getState().createDocument;
    const documentId = createDocument({ name: 'Test Doc', width: 800, height: 600 });
    const document = useGraphicsStore.getState().documents.find((doc) => doc.id === documentId);

    expect(document).toBeDefined();
    expect(document?.layers).toHaveLength(1);
    expect(document?.layers[0].name).toBe('Background');
  });

  it('adds adjustment layers non-destructively', () => {
    const { createDocument, addLayer } = useGraphicsStore.getState();
    const documentId = createDocument({ name: 'Adjust Doc' });
    addLayer(documentId, { name: 'Curves', kind: 'adjustment', metadata: { adjustment: 'curves' } });

    const document = useGraphicsStore.getState().documents.find((doc) => doc.id === documentId);
    expect(document?.layers).toHaveLength(2);
    expect(document?.layers[1].kind).toBe('adjustment');
    expect(document?.history.past.length).toBeGreaterThanOrEqual(1);
  });
});
