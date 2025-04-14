import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ImageIcon, MoveIcon } from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
  isSelected: boolean;
  type?: string;
}

interface ImageBankProps {
  images: ImageItem[];
}

const ImageBank: React.FC<ImageBankProps> = ({ images }) => {
  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
          <ImageIcon className="mr-2 text-primary" size={16} />
          Image Bank
        </h4>
        
        <p className="text-xs text-gray-600 mb-3">
          Drag images into content sections to position them in your article.
        </p>
        
        <Droppable droppableId="image-bank">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {images.length > 0 ? (
                images.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        id={`image-${image.id}`}
                        className={`bg-gray-50 rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 ${
                          snapshot.isDragging ? 'shadow-lg scale-105' : ''
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-32 object-cover"
                          />
                          <div 
                            {...provided.dragHandleProps}
                            className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md cursor-move hover:bg-gray-100"
                          >
                            <MoveIcon size={16} className="text-gray-600" />
                          </div>
                        </div>
                        <div className="p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {image.type === 'featured' ? 'Featured Image' : 'Section Image'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{image.caption}</p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No images selected</p>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default ImageBank;