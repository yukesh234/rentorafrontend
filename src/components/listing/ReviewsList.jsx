import { Star, MessageSquare } from 'lucide-react';

export default function ReviewsList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#3A3532] bg-[#1F1B18] p-6 text-center">
        <MessageSquare size={22} strokeWidth={1.5} className="mx-auto text-[#4A443F]" />
        <p className="mt-2 text-sm text-[#8A7F76]">No reviews yet for this listing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#F5F0EB]">{r.reviewerName}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < r.rating ? 'fill-[#D4A574] text-[#D4A574]' : 'text-[#3A3532]'}
                />
              ))}
            </div>
          </div>
          {r.comment && (
            <p className="mt-1.5 text-sm text-[#A89A8C]">{r.comment}</p>
          )}
          <p className="mt-1.5 text-[10px] text-[#6B615A]">
            {new Date(r.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}