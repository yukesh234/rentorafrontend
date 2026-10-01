import { PackagePlus } from 'lucide-react';

export default function EmptyListingsState({ onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#3A3532] bg-[#1F1B18] px-6 py-20 text-center">
      <div className="rounded-full bg-[#2A2622] p-4">
        <PackagePlus size={28} strokeWidth={1.5} className="text-[#D4A574]" />
      </div>
      <div className="space-y-1">
        <h3 className="font-['Outfit'] text-lg font-medium text-[#F5F0EB]">
          Nothing listed yet
        </h3>
        <p className="max-w-sm text-sm text-[#8A7F76]">
          Add your first item or venue and it'll show up here for you to manage.
        </p>
      </div>
      <button
        onClick={onCreateNew}
        className="mt-2 rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
      >
        Create a listing
      </button>
    </div>
  );
}