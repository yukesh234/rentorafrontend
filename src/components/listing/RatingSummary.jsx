import { Star } from 'lucide-react';

export default function RatingSummary({ averageRating, reviewCount }) {
  if (!averageRating) {
    return <p className="text-xs text-[#6B615A]">No reviews yet</p>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Star size={15} className="fill-[#D4A574] text-[#D4A574]" />
      <span className="text-sm font-medium text-[#F5F0EB]">{averageRating.toFixed(1)}</span>
      <span className="text-xs text-[#8A7F76]">
        ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
      </span>
    </div>
  );
}