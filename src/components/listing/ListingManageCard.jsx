import { Pencil, Trash2, MapPin, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';



export default function ListingManageCard({ listing, onEdit, onDeleteRequest }) {
  const thumbnail = listing.imageUrls?.[0];
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#2A2622] bg-[#211D1A] transition-colors hover:border-[#3A3532]">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#181512]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#4A443F]">
            <Package size={32} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={listing.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-['Outfit'] text-base font-semibold leading-tight text-[#F5F0EB] line-clamp-1">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-[#8A7F76]">
          <MapPin size={12} strokeWidth={2} />
          <span className="line-clamp-1">{listing.city}, {listing.district}</span>
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-['Outfit'] text-lg font-semibold text-[#D4A574]">
            Rs. {listing.pricePerUnit}
          </span>
          <span className="text-xs text-[#8A7F76]">/ {listing.priceUnit}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#2A2622]">
          <span className="text-xs text-[#6B615A]">Qty: {listing.quantity}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(listing)}
              className="rounded-lg p-2 text-[#A89A8C] transition-colors hover:bg-[#2A2622] hover:text-[#D4A574]"
              aria-label="Edit listing"
            >
              <Pencil size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => onDeleteRequest(listing)}
              className="rounded-lg p-2 text-[#A89A8C] transition-colors hover:bg-[#3A1F1A] hover:text-[#E07856]"
              aria-label="Delete listing"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}