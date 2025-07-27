'use client';

import { useState } from 'react';

interface Option {
  id: string;
  text: string;
  image?: string;
}

interface QuizSelectorClientProps {
  title: string;
  description: string;
  options: Option[];
  multiSelect?: boolean;
}

export default function QuizSelectorClient({ 
  title, 
  description, 
  options, 
  multiSelect = false 
}: QuizSelectorClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleOptionClick = (optionId: string) => {
    if (multiSelect) {
      setSelectedIds(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedIds([optionId]);
    }
  };

  const handleSubmit = () => {
    console.log('選択された項目:', selectedIds);
    alert(`選択された項目: ${selectedIds.join(', ')}`);
  };

  const isSelected = (optionId: string) => selectedIds.includes(optionId);
  const getSelectionOrder = (optionId: string) => selectedIds.indexOf(optionId) + 1;
  const getOpacity = (optionId: string) => {
    if (!isSelected(optionId)) return 1;
    const order = getSelectionOrder(optionId);
    return Math.max(0.3, 1 - (order - 1) * 0.15);
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-gray-50 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Be Vietnam Pro", "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-gray-50 p-4 pb-2 justify-between">
          <div className="text-[#101518] flex size-12 shrink-0 items-center" data-icon="ArrowLeft" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </div>
          <h2 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            {title}
          </h2>
        </div>
        
        <h1 className="text-[#101518] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          {title}
        </h1>
        
        <p className="text-[#101518] text-base font-normal leading-normal pb-3 pt-1 px-4">
          {description}
        </p>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square cursor-pointer transition-all duration-200 relative"
              style={{
                backgroundImage: option.image 
                  ? `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("${option.image}")` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: getOpacity(option.id)
              }}
            >
              {isSelected(option.id) && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getSelectionOrder(option.id)}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-white text-base font-bold leading-tight flex-1 line-clamp-2">
                  {option.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex justify-center px-4 py-3">
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className={`
              flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 text-lg font-bold leading-normal tracking-[0.015em] transition-all duration-200
              ${selectedIds.length > 0 
                ? 'bg-[#dce8f3] text-[#101518] hover:bg-[#c6ddf0]' 
                : 'bg-[#dce8f3] text-[#101518] cursor-not-allowed opacity-50'
              }
            `}
          >
            <span className="truncate">確認</span>
          </button>
        </div>
        <div className="h-5 bg-gray-50"></div>
      </div>
    </div>
  );
}