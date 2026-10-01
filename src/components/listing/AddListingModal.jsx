/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import axios from '../../axios/axios';
import ImageDropzone from './ImageDropzone';

const CATEGORIES = [
  { value: 'UTILITY', label: 'Utility' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
];

const emptyForm = {
  title: '',
  description: '',
  category: 'UTILITY',
  pricePerUnit: '',
  priceUnit: 'day',
  quantity: 1,
  status: 'ACTIVE',
  city: '',
  district: '',
  openingTime: '',
  closingTime: '',
};

function toTimeInputValue(value) {
  if (!value) return '';
  return value.slice(0, 5);
}

export default function AddListingModal({ existingListing, onClose, onCreated, onUpdated }) {
  const isEditMode = Boolean(existingListing);

  const [form, setForm] = useState(emptyForm);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingListing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        title: existingListing.title ?? '',
        description: existingListing.description ?? '',
        category: existingListing.category ?? 'UTILITY',
        pricePerUnit: existingListing.pricePerUnit ?? '',
        priceUnit: existingListing.priceUnit ?? 'day',
        quantity: existingListing.quantity ?? 1,
        status: existingListing.status ?? 'ACTIVE',
        city: existingListing.city ?? '',
        district: existingListing.district ?? '',
        openingTime: toTimeInputValue(existingListing.openingTime),
        closingTime: toTimeInputValue(existingListing.closingTime),
      });
      setExistingImageUrls(existingListing.imageUrls ?? []);
    } else {
      setForm(emptyForm);
      setExistingImageUrls([]);
    }
    setNewFiles([]);
    setError(null);
  }, [existingListing]);

  const isVenue = form.category !== 'UTILITY'; // SPORTS or ENTERTAINMENT
  const needsHours = isVenue;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCategoryChange(value) {
    setForm((prev) => ({
      ...prev,
      category: value,
      // venues are a single bookable resource — lock quantity to 1
      quantity: value !== 'UTILITY' ? 1 : prev.quantity,
    }));
  }

  async function handleGenerateDescription() {
    const hasAnyImage = newFiles.length > 0 || existingImageUrls.length > 0;
    if (!hasAnyImage) {
      setError('Add at least one photo before generating a description.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const fd = new FormData();
      newFiles.forEach((f) => fd.append('files', f));
      if (form.title) fd.append('title', form.title);
      fd.append('category', form.category);

      if (newFiles.length === 0) {
        setError('Add a new photo to generate a fresh description, or edit the text directly.');
        setIsGenerating(false);
        return;
      }

      const res = await axios.post('/api/v1/listings/generate-description', fd);
      update('description', res.data.description);
    } catch (err) {
      setError('Could not generate a description right now. Try writing one manually.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.pricePerUnit || !form.city.trim()) {
      setError('Fill in title, price, and city before saving.');
      return;
    }

    if (needsHours && (!form.openingTime || !form.closingTime)) {
      setError('Set opening and closing hours for this venue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        pricePerUnit: Number(form.pricePerUnit),
        quantity: isVenue ? 1 : Number(form.quantity),
        openingTime: needsHours && form.openingTime ? `${form.openingTime}:00` : null,
        closingTime: needsHours && form.closingTime ? `${form.closingTime}:00` : null,
      };

      const fd = new FormData();
      fd.append('listing', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      newFiles.forEach((f) => fd.append('files', f));

      if (isEditMode) {
        const res = await axios.put(`/api/v1/listings/${existingListing.id}`, fd);
        onUpdated(res.data);
      } else {
        const res = await axios.post('/api/v1/listings', fd);
        onCreated(res.data);
      }

      onClose();
    } catch (err) {
      setError('Something went wrong while saving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[#2A2622] bg-[#211D1A]">
        <div className="flex items-center justify-between border-b border-[#2A2622] px-6 py-4">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#F5F0EB]">
            {isEditMode ? 'Edit listing' : 'New listing'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8A7F76] transition-colors hover:bg-[#2A2622] hover:text-[#F5F0EB]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {existingImageUrls.length > 0 && (
            <Field label="Current photos">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {existingImageUrls.map((url, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg border border-[#2A2622]">
                    <img src={url} alt={`Existing ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[#6B615A]">
                Existing photos stay as-is. Add more below, or manage individual photos from the listing card.
              </p>
            </Field>
          )}

          <Field label={isEditMode ? 'Add more photos' : 'Photos'}>
            <ImageDropzone files={newFiles} onFilesChange={setNewFiles} />
          </Field>

          <Field label="Title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. 3-Person Camping Tent"
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleCategoryChange(c.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    form.category === c.value
                      ? 'border-[#C2542D] bg-[#C2542D]/15 text-[#D4A574]'
                      : 'border-[#2A2622] text-[#8A7F76] hover:border-[#3A3532]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {isVenue && (
              <p className="mt-1.5 text-xs text-[#6B615A]">
                Venues are booked one time slot at a time — renters pick a start and end time, and the slot is blocked for everyone else while it's booked.
              </p>
            )}
          </Field>

          <Field
            label="Description"
            action={
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs font-medium text-[#D4A574] transition-colors hover:text-[#C2542D] disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                {isGenerating ? 'Writing…' : 'Generate with AI'}
              </button>
            }
          >
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              placeholder="What are you renting out?"
              className={`${inputClass} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price">
              <input
                type="number"
                min="0"
                value={form.pricePerUnit}
                onChange={(e) => update('pricePerUnit', e.target.value)}
                placeholder="500"
                className={inputClass}
              />
            </Field>
            <Field label="Per">
              <select
                value={form.priceUnit}
                onChange={(e) => update('priceUnit', e.target.value)}
                className={inputClass}
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input
                type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="Kathmandu"
                className={inputClass}
              />
            </Field>
            <Field label="District">
              <input
                type="text"
                value={form.district}
                onChange={(e) => update('district', e.target.value)}
                placeholder="Kathmandu"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {isVenue ? (
              <>
                <Field label="Opens at">
                  <input
                    type="time"
                    value={form.openingTime}
                    onChange={(e) => update('openingTime', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Closes at">
                  <input
                    type="time"
                    value={form.closingTime}
                    onChange={(e) => update('closingTime', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Quantity">
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                    className={inputClass}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Live</option>
                    <option value="INACTIVE">Paused</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </Field>
              </>
            )}
          </div>

          {isVenue && (
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className={inputClass}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Live</option>
                <option value="INACTIVE">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
          )}

          {error && (
            <p className="rounded-lg bg-[#3A1F1A] px-3 py-2 text-sm text-[#E07856]">{error}</p>
          )}
        </form>

        <div className="flex justify-end gap-2 border-t border-[#2A2622] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#A89A8C] transition-colors hover:bg-[#2A2622]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-[#C2542D] px-5 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none transition-colors focus:border-[#C2542D]/60';

function Field({ label, action, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}