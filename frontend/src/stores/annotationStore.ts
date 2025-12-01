import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Annotation, Image, BBoxGeometry } from '../types';

export type Tool = 'select' | 'bbox' | 'polygon' | 'point';

interface AnnotationState {
  image: Image | null;
  imageUrl: string | null;
  annotations: Annotation[];
  selectedAnnotationId: number | null;
  currentTool: Tool;
  isDrawing: boolean;
  tempAnnotation: Partial<Annotation> | null;

  // Actions
  setImage: (image: Image, url: string) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: number, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: number) => void;
  setSelectedAnnotation: (id: number | null) => void;
  setCurrentTool: (tool: Tool) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setTempAnnotation: (annotation: Partial<Annotation> | null) => void;
  clearAll: () => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  immer((set) => ({
    image: null,
    imageUrl: null,
    annotations: [],
    selectedAnnotationId: null,
    currentTool: 'select',
    isDrawing: false,
    tempAnnotation: null,

    setImage: (image, url) =>
      set((state) => {
        state.image = image;
        state.imageUrl = url;
      }),

    setAnnotations: (annotations) =>
      set((state) => {
        state.annotations = annotations;
      }),

    addAnnotation: (annotation) =>
      set((state) => {
        state.annotations.push(annotation);
      }),

    updateAnnotation: (id, updates) =>
      set((state) => {
        const index = state.annotations.findIndex((a) => a.id === id);
        if (index !== -1) {
          state.annotations[index] = { ...state.annotations[index], ...updates };
        }
      }),

    deleteAnnotation: (id) =>
      set((state) => {
        state.annotations = state.annotations.filter((a) => a.id !== id);
        if (state.selectedAnnotationId === id) {
          state.selectedAnnotationId = null;
        }
      }),

    setSelectedAnnotation: (id) =>
      set((state) => {
        state.selectedAnnotationId = id;
      }),

    setCurrentTool: (tool) =>
      set((state) => {
        state.currentTool = tool;
        state.selectedAnnotationId = null;
      }),

    setIsDrawing: (isDrawing) =>
      set((state) => {
        state.isDrawing = isDrawing;
      }),

    setTempAnnotation: (annotation) =>
      set((state) => {
        state.tempAnnotation = annotation;
      }),

    clearAll: () =>
      set((state) => {
        state.image = null;
        state.imageUrl = null;
        state.annotations = [];
        state.selectedAnnotationId = null;
        state.currentTool = 'select';
        state.isDrawing = false;
        state.tempAnnotation = null;
      }),
  }))
);
