import { useState } from 'react';
import { X, MapPin, Clock, Package, CheckCircle2, XCircle, ImageOff, Loader2 } from 'lucide-react';

export default function AdminListingModal({
  listing,
  onClose,
  onApprove,
  onReject,
  isActing,
  startRejecting = false,
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [rejecting, setRejecting] = useState(startRejecting);
  const [reason, setReason] = useState('');
  const images = listing.imageUrls ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[#2A2622] bg-[#211D1A]">
        <div className="flex items-center justify-between border-b border-[#2A2622] px-6 py-4">
          <div className="min-w-0">
            <span className="text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
              {listing.category}
            </span>
            <h2 className="truncate font-['Outfit'] text-lg font-semibold text-[#F5F0EB]">
              {listing.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8A7F76] transition-colors hover:bg-[#2A2622] hover:text-[#F5F0EB]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* photos */}
          {images.length > 0 ? (
            <div>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#181512]">
                <img
                  src={images[activeImage]}
                  alt={`${listing.title} photo ${activeImage + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 ${
                        i === activeImage ? 'border-[#C2542D]' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg bg-[#181512] text-[#4A443F]">
              <ImageOff size={28} strokeWidth={1.5} />
              <span className="text-xs">No photos uploaded</span>
            </div>
          )}

          {/* key facts */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[#181512] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-[#6B615A]">Price</p>
              <p className="mt-0.5 font-medium text-[#D4A574]">
                Rs. {listing.pricePerUnit} / {listing.priceUnit}
              </p>
            </div>
            <div className="rounded-lg bg-[#181512] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-[#6B615A]">Quantity</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[#F5F0EB]">
                <Package size={13} className="text-[#8A7F76]" />
                {listing.quantity}
              </p>
            </div>
            <div className="rounded-lg bg-[#181512] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-[#6B615A]">Location</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[#F5F0EB]">
                <MapPin size={13} className="text-[#8A7F76]" />
                {[listing.city, listing.district].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
            <div className="rounded-lg bg-[#181512] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-[#6B615A]">Opening hours</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[#F5F0EB]">
                <Clock size={13} className="text-[#8A7F76]" />
                {listing.openingTime && listing.closingTime
                  ? `${listing.openingTime.slice(0, 5)} – ${listing.closingTime.slice(0, 5)}`
                  : 'Not set'}
              </p>
            </div>
          </div>

          {/* description */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F0EB]">Description</h3>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#A89A8C]">
              {listing.description?.trim() || 'No description provided.'}
            </p>
          </div>

          {/* owner */}
          <div className="border-t border-[#2A2622] pt-4 text-xs text-[#8A7F76]">
            Submitted by <span className="text-[#F5F0EB]">{listing.ownerName}</span>
            {listing.ownerEmail && <> ({listing.ownerEmail})</>}
            {listing.createdAt && <> on {new Date(listing.createdAt).toLocaleDateString()}</>}
          </div>

          {/* rejection reason */}
          {rejecting && (
            <div>
              <label className="text-sm font-semibold text-[#F5F0EB]">Reason for rejection</label>
              <p className="mt-0.5 text-xs text-[#6B615A]">
                The owner will see this, can fix the listing and submit it again.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                autoFocus
                placeholder="e.g. Photos are blurry — please add clearer pictures and a fuller description"
                className="mt-2 w-full resize-none rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none focus:border-[#C2542D]/60"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#2A2622] px-6 py-4">
          {rejecting ? (
            <>
              <button
                onClick={() => {
                  setRejecting(false);
                  setReason('');
                }}
                disabled={isActing}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#A89A8C] transition-colors hover:bg-[#2A2622] disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={() => onReject(listing.id, reason.trim())}
                disabled={isActing || !reason.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-[#E07856] hover:bg-red-500/10 disabled:opacity-50"
              >
                {isActing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirm rejection
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setRejecting(true)}
                disabled={isActing}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-[#E07856] hover:bg-red-500/10 disabled:opacity-50"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={() => onApprove(listing.id)}
                disabled={isActing}
                className="flex items-center gap-1.5 rounded-lg border border-green-500/30 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/10 disabled:opacity-50"
              >
                {isActing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}