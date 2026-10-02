import { useState } from 'react';
import { Pencil, Trash2, MapPin, Package, RotateCcw, Loader2 } from 'lucide-react';
import axios from '../../axios/axios.js';
import StatusBadge from './StatusBadge';

export default function ListingManageCard({ listing, onEdit, onDeleteRequest, onResubmitted }) {
  const thumbnail = listing.imageUrls?.[0];
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleResubmit() {
    setError('');
    setIsResubmitting(true);
    try {
      const res = await axios.post(`/api/v1/listings/${listing.id}/resubmit`);
      onResubmitted?.(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not resubmit this listing.');
    } finally {
      setIsResubmitting(false);
    }
  }

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

        {listing.status === 'PENDING_REVIEW' && (
          <p className="text-xs text-[#6B615A]">Waiting for an admin to review this listing.</p>
        )}

        {listing.status === 'REJECTED' && (
          <div className="rounded-lg bg-[#3A1F1A] px-3 py-2.5 text-xs">
            <p className="font-medium text-[#E07856]">Rejected by admin</p>
            <p className="mt-1 whitespace-pre-wrap text-[#D9A395]">
              {listing.rejectionReason || 'No reason was given.'}
            </p>
            <button
              onClick={handleResubmit}
              disabled={isResubmitting}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#C2542D] py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
            >
              {isResubmitting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
              {isResubmitting ? 'Resubmitting…' : 'Resubmit for review'}
            </button>
            <p className="mt-1.5 text-[11px] text-[#8A7F76]">
              Editing the listing and saving also resubmits it.
            </p>
            {error && <p className="mt-1.5 text-[11px] text-[#E07856]">{error}</p>}
          </div>
        )}

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