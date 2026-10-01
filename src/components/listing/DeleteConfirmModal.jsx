import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ listing, onConfirm, onCancel, isDeleting }) {
  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#2A2622] bg-[#211D1A] p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#3A1F1A] p-2">
            <AlertTriangle size={18} className="text-[#E07856]" />
          </div>
          <h3 className="font-['Outfit'] text-base font-semibold text-[#F5F0EB]">
            Delete this listing?
          </h3>
        </div>

        <p className="mt-3 text-sm text-[#A89A8C]">
          <span className="text-[#F5F0EB]">"{listing.title}"</span> will be removed permanently, along with its photos. This can't be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#A89A8C] transition-colors hover:bg-[#2A2622] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-[#C23D2D] px-4 py-2 text-sm font-medium text-[#F5F0EB] transition-colors hover:bg-[#A8331F] disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}