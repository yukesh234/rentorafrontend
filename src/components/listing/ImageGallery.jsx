import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

export default function ImageGallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-[#181512] text-[#4A443F]">
        <Package size={40} strokeWidth={1.5} />
      </div>
    );
  }

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#181512]">
        <img
          src={images[activeIndex]}
          alt={`${title} photo ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === activeIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex ? 'border-[#C2542D]' : 'border-transparent'
              }`}
            >
              <img src={url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}