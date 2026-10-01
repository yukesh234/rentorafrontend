import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

export default function ImageDropzone({ files, onFilesChange, maxFiles = 6 }) {
  const inputRef = useRef(null);

  function handleSelect(e) {
    const selected = Array.from(e.target.files);
    const combined = [...files, ...selected].slice(0, maxFiles);
    onFilesChange(combined);
    e.target.value = ''; // allow re-selecting the same file
  }

  function removeFile(index) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {files.map((file, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-[#2A2622]">
            <img
              src={URL.createObjectURL(file)}
              alt={`Upload ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {files.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#3A3532] text-[#6B615A] transition-colors hover:border-[#C2542D]/50 hover:text-[#D4A574]"
          >
            <ImagePlus size={20} strokeWidth={1.5} />
            <span className="text-[10px]">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      <p className="mt-2 text-xs text-[#6B615A]">
        {files.length} / {maxFiles} photos added
      </p>
    </div>
  );
}