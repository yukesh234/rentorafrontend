/* eslint-disable react-hooks/immutability */
/*
@TODO: refactor the update and the closing and opening time of listings
*/
import { useEffect, useState } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import axios from '../axios/axios.js';
import { useAuthStore } from "../stores/Authstore.js";

import ListingManageCard from '../components/listing/ListingManageCard';
import EmptyListingsState from '../components/listing/EmptyListingsState';
import DeleteConfirmModal from '../components/listing/DeleteConfirmModal';
import AddListingModal from '../components/listing/AddListingModal';


export default function ManageListingsPage() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null); // null = add mode, object = edit mode

  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const authIsLoading = useAuthStore((s) => s.isLoading);
  useEffect(() => {
    if (authIsLoading) return;
    fetchListings();
  }, [authIsLoading]);

  async function fetchListings() {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/v1/listings/my');
      setListings(res.data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCreated(newListing) {
    setListings((prev) => [newListing, ...prev]);
  }

  function handleUpdated(updatedListing) {
    setListings((prev) =>
      prev.map((l) => (l.id === updatedListing.id ? updatedListing : l))
    );
  }

  function handleEditRequest(listing) {
    setEditingListing(listing);
  }

  function closeAddOrEditModal() {
    setIsAddModalOpen(false);
    setEditingListing(null);
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/v1/listings/${pendingDelete.id}`);
      setListings((prev) => prev.filter((l) => l.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      console.error('Failed to delete listing', err);
    } finally {
      setIsDeleting(false);
    }
  }

  const isModalOpen = isAddModalOpen || editingListing !== null;

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#8A7F76]">
              <LayoutGrid size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Owner dashboard
              </span>
            </div>
            <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB] md:text-3xl">
              Your listings
            </h1>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#C2542D] px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574]"
          >
            <Plus size={16} strokeWidth={2.5} />
            New listing
          </button>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-4/3 animate-pulse rounded-xl bg-[#211D1A]"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyListingsState onCreateNew={() => setIsAddModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingManageCard
                  key={listing.id}
                  listing={listing}
                  onEdit={handleEditRequest}
                  onDeleteRequest={setPendingDelete}
                  onResubmitted={handleUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddListingModal
          existingListing={editingListing}
          onClose={closeAddOrEditModal}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
        />
      )}

      <DeleteConfirmModal
        listing={pendingDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}