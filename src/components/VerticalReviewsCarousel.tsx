import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Quote, Sparkles, User, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  company: string;
  text: string;
  aiResponse: string | null;
  officialResponse: string;
  date: string;
}

interface VerticalReviewsCarouselProps {
  reviews: Review[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  isCommentsOpen?: boolean;
  isWriteReviewOpen?: boolean;
  onToggleComments?: () => void;
  onToggleWriteReview?: () => void;
}

export default function VerticalReviewsCarousel({
  reviews,
  activeIndex,
  onChangeIndex,
  isCommentsOpen = false,
  isWriteReviewOpen = false,
  onToggleComments,
  onToggleWriteReview
}: VerticalReviewsCarouselProps) {
  // Swipe & Drag gesture state
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number>(0);
  const dragStartX = useRef<number>(0);

  const handleNext = () => {
    if (reviews.length === 0) return;
    onChangeIndex((activeIndex + 1) % reviews.length);
  };

  const handlePrev = () => {
    if (reviews.length === 0) return;
    onChangeIndex((activeIndex - 1 + reviews.length) % reviews.length);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null || touchStartX === null) return;
    const diffY = touchStartY - e.changedTouches[0].clientY;
    const diffX = touchStartX - e.changedTouches[0].clientX;

    // Detect swipe direction: vertical takes priority for vertical block
    if (Math.abs(diffY) > Math.abs(diffX)) {
      if (Math.abs(diffY) > 40) {
        if (diffY > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    } else {
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    setTouchStartY(null);
    setTouchStartX(null);
  };

  // Mouse Drag Handlers for Desktop Swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // We can show visual drag indicator if needed
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diffY = dragStartY.current - e.clientY;
    const diffX = dragStartX.current - e.clientX;

    if (Math.abs(diffY) > Math.abs(diffX)) {
      if (Math.abs(diffY) > 40) {
        if (diffY > 0) handleNext();
        else handlePrev();
      }
    } else {
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) handleNext();
        else handlePrev();
      }
    }
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Get index helper with looping
  const getLoopIndex = (offset: number) => {
    if (reviews.length === 0) return 0;
    return (activeIndex + offset + reviews.length * 10) % reviews.length;
  };

  // Indices for our 5 slots
  const idxFarPrev = getLoopIndex(-2);
  const idxPrev = getLoopIndex(-1);
  const idxActive = activeIndex;
  const idxNext = getLoopIndex(1);
  const idxFarNext = getLoopIndex(2);

  // Helper to render preview / collapsed review card
  const renderSideCard = (idx: number, level: 1 | 2, position: 'top' | 'bottom') => {
    const rev = reviews[idx];
    if (!rev) return null;

    // Custom stylings based on distance from center
    const isFar = level === 2;
    const scaleClass = isFar ? 'scale-85 sm:scale-90 opacity-30' : 'scale-92 sm:scale-96 opacity-60';
    const heightClass = isFar ? 'h-14 sm:h-16' : 'h-18 sm:h-20';
    const borderClass = 'border-white/5 bg-[#17344F]/40 hover:bg-[#1E4468]/60 hover:border-white/15';

    return (
      <div
        onClick={() => onChangeIndex(idx)}
        className={`w-full ${heightClass} ${scaleClass} ${borderClass} border p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 hover:scale-[0.98] select-none overflow-hidden relative group shadow-md`}
        id={`review-side-${position}-${level}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#1E4468]/80 border border-white/10 flex items-center justify-center font-bold text-xs text-[#F4EE8E] shrink-0">
            {rev.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white text-xs truncate">{rev.name}</span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{rev.date}</span>
            </div>
            <p className="text-slate-300 text-[10px] truncate">{rev.company}</p>
            <p className="text-slate-400 text-[10px] italic truncate mt-0.5">"{rev.text}"</p>
          </div>
        </div>
        <div className="text-slate-500 group-hover:text-[#E7C768] transition-colors shrink-0">
          <Quote size={12} className="opacity-40" />
        </div>
      </div>
    );
  };

  const activeReview = reviews[idxActive];

  return (
    <div 
      className="flex flex-col gap-3 w-full max-w-2xl mx-auto"
      id="vertical-reviews-carousel-wrapper"
    >
      {/* Swipe instructions banner */}
      <div className="text-center text-[10px] text-slate-400 font-sans tracking-wider uppercase flex items-center justify-center gap-1.5 opacity-80 py-1 select-none">
        <span className="animate-bounce">↕</span>
        Проведите пальцем или зажмите мышь для свайпа отзывов
        <span className="animate-bounce">↕</span>
      </div>

      {/* Main vertical container */}
      <div 
        className="relative flex flex-col items-center gap-2.5 py-4 px-1 rounded-3xl bg-[#17344F]/10 border border-white/5 select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        id="vertical-carousel-container"
      >
        {/* Navigation Buttons overlayed or styled nicely */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-8 h-8 rounded-full border border-white/10 bg-[#1E4468]/80 hover:bg-[#265582] text-white flex items-center justify-center font-bold transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
            aria-label="Предыдущий отзыв"
            id="vertical-prev-btn"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-8 h-8 rounded-full border border-white/10 bg-[#1E4468]/80 hover:bg-[#265582] text-white flex items-center justify-center font-bold transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md"
            aria-label="Следующий отзыв"
            id="vertical-next-btn"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* TOP SIDES (2 Blocks) */}
        <div className="w-full flex flex-col gap-2 relative opacity-85 select-none px-2 sm:px-4">
          {renderSideCard(idxFarPrev, 2, 'top')}
          {renderSideCard(idxPrev, 1, 'top')}
        </div>

        {/* ACTIVE CARD (Center) */}
        {activeReview && (
          <div 
            className="w-full p-5 sm:p-6 rounded-3xl border border-amber-200/25 bg-gradient-to-br from-[#17344F] to-[#265582] space-y-4 relative overflow-hidden shadow-2xl scale-[1.01] sm:scale-[1.03] z-20 transition-all duration-300 mx-auto max-w-[98%] animate-fade-in" 
            id={`review-active-card-${activeReview.id}`}
          >
            {/* Liquid glass effect reflection */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent" />
            
            <div className="flex justify-between items-start sm:items-center text-xs flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E7C768] border border-white/10 flex items-center justify-center font-extrabold text-[#17344F] shrink-0 text-sm">
                  {activeReview.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-white text-sm sm:text-base">{activeReview.name}</span>
                  <span className="text-[#F4EE8E] font-medium text-[11px] block mt-0.5">{activeReview.company}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-300 font-mono bg-[#1E4468]/60 px-2.5 py-1 rounded-full border border-white/5 shrink-0">{activeReview.date}</span>
            </div>

            <p className="text-slate-100 text-xs sm:text-sm italic leading-relaxed pl-1 pt-1">
              "{activeReview.text}"
            </p>

            <div className="space-y-2 pt-3.5 border-t border-white/10 text-[11px] sm:text-xs">
              {/* Neural network response */}
              {activeReview.aiResponse && (
                <div className="bg-amber-400/10 border border-amber-400/15 p-3 rounded-2xl space-y-1">
                  <p className="font-bold text-amber-200 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#E7C768]" />
                    <span>ИИ Автоответ Рапорт:</span>
                  </p>
                  <p className="text-slate-200 leading-relaxed font-sans">{activeReview.aiResponse}</p>
                </div>
              )}
              {/* Official response */}
              <div className="bg-[#17344F]/40 border border-white/5 p-3 rounded-2xl space-y-1">
                <p className="font-bold text-slate-300 flex items-center gap-1">
                  <User size={11} className="text-slate-400" />
                  <span>Официальный ответ RR:</span>
                </p>
                <p className="text-slate-300 leading-relaxed font-sans">{activeReview.officialResponse}</p>
              </div>
            </div>

            {/* Action buttons inside the active review card */}
            <div className="flex flex-wrap gap-2.5 pt-3.5 border-t border-white/10" id="review-card-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComments?.();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                  isCommentsOpen
                    ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-lg scale-102 font-bold'
                    : 'bg-[#1E4468]/80 hover:bg-[#265582] text-slate-200 border border-white/10 hover:border-amber-200/20'
                }`}
                id="toggle-review-comments-btn"
              >
                <MessageSquare size={13} />
                <span>Комментарии {isCommentsOpen ? '▲' : '▼'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWriteReview?.();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                  isWriteReviewOpen
                    ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-lg scale-102 font-bold'
                    : 'bg-[#1E4468]/80 hover:bg-[#265582] text-slate-200 border border-white/10 hover:border-amber-200/20'
                }`}
                id="toggle-review-form-btn"
              >
                <span>✍️</span>
                <span>Оставить отзыв {isWriteReviewOpen ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM SIDES (2 Blocks) */}
        <div className="w-full flex flex-col gap-2 relative opacity-85 select-none px-2 sm:px-4">
          {renderSideCard(idxNext, 1, 'bottom')}
          {renderSideCard(idxFarNext, 2, 'bottom')}
        </div>
      </div>

      {/* Progress / Dot Indicators */}
      <div className="flex gap-1.5 justify-center mt-1">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onChangeIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeIndex 
                ? 'bg-[#E7C768] w-5' 
                : 'bg-white/20 hover:bg-white/40 w-1.5'
            }`}
            aria-label={`Перейти к отзыву ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
