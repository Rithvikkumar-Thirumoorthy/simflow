import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { useAnnotationStore } from '../stores/annotationStore';
import type { BBoxGeometry } from '../types';

interface AnnotationCanvasProps {
  containerWidth: number;
  containerHeight: number;
}

export default function AnnotationCanvas({ containerWidth, containerHeight }: AnnotationCanvasProps) {
  const {
    imageUrl,
    annotations,
    selectedAnnotationId,
    currentTool,
    isDrawing,
    setIsDrawing,
    setTempAnnotation,
    setSelectedAnnotation,
  } = useAnnotationStore();

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: containerWidth, height: containerHeight });
  const [tempBox, setTempBox] = useState<BBoxGeometry | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Load image
  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        setImage(img);

        // Calculate scale to fit image in container
        const scaleX = containerWidth / img.width;
        const scaleY = containerHeight / img.height;
        const newScale = Math.min(scaleX, scaleY, 1);

        setScale(newScale);
        setStageSize({
          width: img.width * newScale,
          height: img.height * newScale,
        });
      };
    }
  }, [imageUrl, containerWidth, containerHeight]);

  // Handle transformer
  useEffect(() => {
    if (transformerRef.current && selectedAnnotationId !== null) {
      const stage = stageRef.current;
      if (!stage) return;

      const selectedNode = stage.findOne(`#annotation-${selectedAnnotationId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedAnnotationId]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentTool !== 'bbox') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Convert to image coordinates
    const x = pos.x / scale;
    const y = pos.y / scale;

    setStartPos({ x, y });
    setTempBox({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !startPos || currentTool !== 'bbox') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Convert to image coordinates
    const x = pos.x / scale;
    const y = pos.y / scale;

    setTempBox({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempBox || currentTool !== 'bbox') return;

    // Only create annotation if box has minimum size
    if (tempBox.width > 5 && tempBox.height > 5) {
      setTempAnnotation({
        annotation_type: 'bbox',
        geometry: tempBox,
      });
    }

    setTempBox(null);
    setStartPos(null);
    setIsDrawing(false);
  };

  const handleBoxClick = (annotationId: number) => {
    if (currentTool === 'select') {
      setSelectedAnnotation(annotationId);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedAnnotation(null);
    }
  };

  if (!image) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No image loaded
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
        style={{ cursor: currentTool === 'bbox' ? 'crosshair' : 'default' }}
      >
        <Layer>
          {/* Image */}
          <KonvaImage
            image={image}
            width={image.width}
            height={image.height}
            scaleX={scale}
            scaleY={scale}
          />

          {/* Existing annotations */}
          {annotations
            .filter((a) => a.annotation_type === 'bbox')
            .map((annotation) => {
              const geometry = annotation.geometry as BBoxGeometry;
              const isSelected = annotation.id === selectedAnnotationId;

              return (
                <Rect
                  key={annotation.id}
                  id={`annotation-${annotation.id}`}
                  x={geometry.x * scale}
                  y={geometry.y * scale}
                  width={geometry.width * scale}
                  height={geometry.height * scale}
                  stroke={isSelected ? '#3B82F6' : '#10B981'}
                  strokeWidth={2}
                  fill="transparent"
                  onClick={() => handleBoxClick(annotation.id)}
                  draggable={currentTool === 'select'}
                />
              );
            })}

          {/* Temporary box while drawing */}
          {tempBox && (
            <Rect
              x={tempBox.x * scale}
              y={tempBox.y * scale}
              width={tempBox.width * scale}
              height={tempBox.height * scale}
              stroke="#3B82F6"
              strokeWidth={2}
              fill="rgba(59, 130, 246, 0.1)"
              dash={[5, 5]}
            />
          )}

          {/* Transformer for selected annotation */}
          {currentTool === 'select' && (
            <Transformer
              ref={transformerRef}
              borderStroke="#3B82F6"
              borderStrokeWidth={2}
              anchorStroke="#3B82F6"
              anchorFill="#fff"
              anchorSize={8}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
