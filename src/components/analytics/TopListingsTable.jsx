import { Star } from 'lucide-react';

export default function TopListingsTable({ listings }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
        <h3 className="mb-2 text-sm font-medium text-[#F5F0EB]">Top listings</h3>
        <p className="text-xs text-[#6B615A]">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2622] bg-[#211D1A]">
      <h3 className="px-4 pt-4 text-sm font-medium text-[#F5F0EB]">Top listings</h3>
      <table className="mt-3 w-full text-sm">
        <thead className="border-t border-[#2A2622] bg-[#181512] text-xs uppercase text-[#8A7F76]">
          <tr>
            <th className="px-4 py-2 text-left">Listing</th>
            <th className="px-4 py-2 text-center">Bookings</th>
            <th className="px-4 py-2 text-center">Revenue</th>
            <th className="px-4 py-2 text-center">Rating</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l, i) => (
            <tr key={l.listingId} className={i !== listings.length - 1 ? 'border-b border-[#2A2622]' : ''}>
              <td className="px-4 py-2.5 text-[#F5F0EB]">{l.title}</td>
              <td className="px-4 py-2.5 text-center text-[#8A7F76]">{l.bookingCount}</td>
              <td className="px-4 py-2.5 text-center font-medium text-[#D4A574]">
                Rs. {l.revenue}
              </td>
              <td className="px-4 py-2.5 text-center">
                {l.averageRating != null ? (
                  <span className="flex items-center justify-center gap-1 text-[#D9CFC6]">
                    <Star size={12} className="fill-[#D4A574] text-[#D4A574]" />
                    {l.averageRating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-[#4A443F]">No ratings given</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}