import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Dataset, Image } from '../types';

export default function DatasetDetailsPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (datasetId) {
      loadDataset(parseInt(datasetId));
      loadImages(parseInt(datasetId));
    }
  }, [datasetId]);

  const loadDataset = async (id: number) => {
    try {
      const data = await api.getDataset(id);
      setDataset(data);
    } catch (error) {
      console.error('Failed to load dataset:', error);
    }
  };

  const loadImages = async (id: number) => {
    try {
      const data = await api.getDatasetImages(id);
      setImages(data);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !datasetId) return;

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      await api.uploadImages(parseInt(datasetId), fileArray);
      await loadImages(parseInt(datasetId));
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.deleteImage(imageId);
      setImages(images.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dataset?.name}</h1>
              {dataset?.description && (
                <p className="text-sm text-gray-600">{dataset.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Images ({images.length})
          </h2>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer">
            {uploading ? 'Uploading...' : 'Upload Images'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No images yet. Upload some images to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">{image.filename}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {image.filename}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {image.annotation_count || 0} annotations
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/datasets/${datasetId}/images/${image.id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Annotate
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
