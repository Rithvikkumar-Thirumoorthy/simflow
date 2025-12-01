import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAnnotationStore } from '../stores/annotationStore';
import AnnotationCanvas from '../components/AnnotationCanvas';
import type { Image, Dataset } from '../types';

export default function AnnotationPage() {
  const { datasetId, imageId } = useParams<{ datasetId: string; imageId: string }>();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const {
    image,
    imageUrl,
    annotations,
    tempAnnotation,
    currentTool,
    selectedAnnotationId,
    setImage,
    setAnnotations,
    setCurrentTool,
    setTempAnnotation,
    deleteAnnotation,
    clearAll,
  } = useAnnotationStore();

  // Load dataset and images
  useEffect(() => {
    if (datasetId) {
      loadDataset(parseInt(datasetId));
      loadImages(parseInt(datasetId));
    }
  }, [datasetId]);

  // Load specific image or first image
  useEffect(() => {
    if (images.length > 0) {
      if (imageId) {
        const index = images.findIndex((img) => img.id === parseInt(imageId));
        if (index !== -1) {
          setCurrentImageIndex(index);
          loadImage(images[index]);
        }
      } else {
        loadImage(images[0]);
      }
    }
  }, [images, imageId]);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedAnnotationId !== null) {
        handleDeleteAnnotation(selectedAnnotationId);
      } else if (e.key === 'Escape') {
        setCurrentTool('select');
      } else if (e.key === 'ArrowLeft') {
        navigateImage(-1);
      } else if (e.key === 'ArrowRight') {
        navigateImage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, currentImageIndex, images.length]);

  // Save temp annotation when it's created
  useEffect(() => {
    if (tempAnnotation && tempAnnotation.geometry && image) {
      if (label.trim()) {
        handleSaveAnnotation();
      }
    }
  }, [tempAnnotation]);

  const loadDataset = async (id: number) => {
    try {
      const data = await api.getDataset(id);
      setDataset(data);
    } catch (error) {
      console.error('Failed to load dataset:', error);
    }
  };

  const loadImages = async (datasetId: number) => {
    try {
      const data = await api.getDatasetImages(datasetId);
      setImages(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load images:', error);
      setLoading(false);
    }
  };

  const loadImage = async (img: Image) => {
    try {
      // Get image URL
      const { url } = await api.getImageUrl(img.id, false);

      // Set image in store
      setImage(img, url);

      // Load annotations
      const anns = await api.getImageAnnotations(img.id);
      setAnnotations(anns);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const handleSaveAnnotation = async () => {
    if (!tempAnnotation || !tempAnnotation.geometry || !image || !label.trim()) return;

    try {
      const annotation = await api.createAnnotation({
        image_id: image.id,
        label: label.trim(),
        annotation_type: tempAnnotation.annotation_type!,
        geometry: tempAnnotation.geometry,
      });

      setAnnotations([...annotations, annotation]);
      setTempAnnotation(null);
      setLabel('');
    } catch (error) {
      console.error('Failed to save annotation:', error);
    }
  };

  const handleDeleteAnnotation = async (id: number) => {
    try {
      await api.deleteAnnotation(id);
      deleteAnnotation(id);
    } catch (error) {
      console.error('Failed to delete annotation:', error);
    }
  };

  const navigateImage = (delta: number) => {
    const newIndex = currentImageIndex + delta;
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentImageIndex(newIndex);
      const newImage = images[newIndex];
      navigate(`/datasets/${datasetId}/images/${newImage.id}`);
      loadImage(newImage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No images in this dataset</p>
          <button
            onClick={() => navigate(`/datasets/${datasetId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="hover:text-gray-300"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">{dataset?.name}</h1>
          <span className="text-sm text-gray-400">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateImage(-1)}
            disabled={currentImageIndex === 0}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => navigateImage(1)}
            disabled={currentImageIndex === images.length - 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Tools</h3>

          <div className="space-y-2 mb-6">
            <button
              onClick={() => setCurrentTool('select')}
              className={`w-full px-4 py-2 rounded text-left ${
                currentTool === 'select' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Select
            </button>
            <button
              onClick={() => setCurrentTool('bbox')}
              className={`w-full px-4 py-2 rounded text-left ${
                currentTool === 'bbox' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Bounding Box
            </button>
          </div>

          {tempAnnotation && (
            <div className="mb-6 p-3 bg-gray-700 rounded">
              <h4 className="text-sm font-semibold mb-2">New Annotation</h4>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAnnotation()}
                placeholder="Enter label..."
                className="w-full px-3 py-2 bg-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSaveAnnotation}
                disabled={!label.trim()}
                className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          )}

          <h3 className="font-semibold mb-2">Annotations ({annotations.length})</h3>
          <div className="space-y-1">
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <span className="text-sm truncate">{ann.label}</span>
                <button
                  onClick={() => handleDeleteAnnotation(ann.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1">
          <AnnotationCanvas
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        </div>
      </div>
    </div>
  );
}
