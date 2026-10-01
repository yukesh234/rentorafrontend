import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";

const CATEGORY_LABELS = {
  UTILITY: "Utility",
  SPORTS: "Sports",
  ENTERTAINMENT: "Entertainment",
};

export default function ListingCard({ listing, onBookNow, onToggleFavorite }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!listing) return null;

  const {
    id,
    title,
    city,
    district,
    category,
    pricePerUnit,
    priceUnit,
    currency = "NPR",
    imageUrls,
    owner,
    isFavorite = false,
  } = listing;

  const imageUrl = imageUrls?.[0];
  const location = [city, district].filter(Boolean).join(", ");
  const categoryLabel = CATEGORY_LABELS[category] ?? category;
   const isOutOfStock = listing.quantity <= 0;

  return (
    <div className="group rt-font-body flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#262019] transition-colors hover:border-white/15">
      <Link to={`/listings/${id}`} className="contents">
        {/* Image */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-[#201B17]">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-linear-to-br from-[#201B17] to-[#2C251E]" />
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              onLoad={() => setImgLoaded(true)}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/20">
              No photo
            </div>
          )}

          {categoryLabel && (
            <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              {categoryLabel}
            </span>
          )}

          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(listing);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <Heart
              size={16}
              strokeWidth={2}
              className={isFavorite ? "fill-[#C2542D] text-[#C2542D]" : "text-white"}
            />
          </button>

          {/* owner avatar, bottom-left of the image */}
          {owner?.name && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 py-1 pl-1 pr-3 backdrop-blur-md">
              {owner.profilePicture ? (
                <img
                  src={owner.profilePicture}
                  alt={owner.name}
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C2542D]/30 text-[10px] font-semibold text-[#D4A574] ring-1 ring-white/20">
                  {owner.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-medium text-white">{owner.name}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <h3 className="rt-font-display line-clamp-1 text-[15px] font-semibold text-white">
            {title}
          </h3>

          {location && (
            <p className="flex items-center gap-1 text-[13px] text-white/50">
              <MapPin size={13} strokeWidth={2} />
              <span className="line-clamp-1">{location}</span>
            </p>
          )}

          <div className="mt-1 flex items-center justify-between border-t border-white/6 pt-3">
            <p className="text-[14px] text-white">
              <span className="rt-font-display font-semibold">
                {currency} {pricePerUnit?.toLocaleString()}
              </span>
              <span className="text-white/40"> / {priceUnit}</span>
            </p>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookNow(listing);
              }}
              className="rounded-full bg-[#C2542D] px-4 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#D4A574]"
            >
             {isOutOfStock ? 'Out of stock' : 'Book now'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}