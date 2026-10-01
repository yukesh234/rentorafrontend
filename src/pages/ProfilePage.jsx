import { useEffect, useState, useRef } from 'react';
import { UserRound, Mail, Calendar, Camera, Loader2, Check, Lock } from 'lucide-react';
import { getProfile, updateProfile, uploadProfilePicture, changePassword } from '../services/userService';
import { useAuthStore } from '../stores/Authstore';

export default function ProfilePage() {
  const authIsLoading = useAuthStore((s) => s.isLoading);
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [picError, setPicError] = useState('');
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (authIsLoading) return;
    // eslint-disable-next-line react-hooks/immutability
    fetchProfile();
  }, [authIsLoading]);

  async function fetchProfile() {
    setIsLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setName(data.name ?? '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveName(e) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    setNameError('');
    setNameSuccess(false);
    setIsSavingName(true);
    try {
      const updated = await updateProfile({ name: name.trim() });
      setProfile(updated);
      setSession({ user: updated, accessToken });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch (err) {
      setNameError(err?.response?.data?.message || 'Could not update name.');
    } finally {
      setIsSavingName(false);
    }
  }

  async function handlePictureSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // if (!file.type.startsWith('image/')) {
    //   setPicError('Please select an image file.');
    //   return;
    // }
    if (file.size > 5 * 1024 * 1024) {
      setPicError('Image must be under 5MB.');
      return;
    }

    setPicError('');
    setIsUploadingPic(true);
    try {
      const updated = await uploadProfilePicture(file);
      setProfile(updated);
      setSession({ user: updated, accessToken });
    } catch (err) {
      setPicError(err?.response?.data?.message || 'Could not upload photo.');
    } finally {
      setIsUploadingPic(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err) {
      setPasswordError(err?.response?.data?.message || 'Could not change password.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-[#211D1A]" />
          <div className="h-40 animate-pulse rounded-xl bg-[#211D1A]" />
          <div className="h-32 animate-pulse rounded-xl bg-[#211D1A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1917] px-6 py-10 md:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 text-[#8A7F76]">
          <UserRound size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Account</span>
        </div>
        <h1 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#F5F0EB]">
          Your profile
        </h1>

        {/* Avatar + basic info card */}
        <div className="mt-8 rounded-xl border border-[#2A2622] bg-[#211D1A] p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#2A2622] bg-[#181512]">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#D4A574]">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPic}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#C2542D] text-[#1C1917] shadow-md transition-colors hover:bg-[#D4A574] disabled:opacity-50"
                aria-label="Change profile picture"
              >
                {isUploadingPic ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureSelect}
                className="hidden"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-['Outfit'] text-lg font-semibold text-[#F5F0EB]">
                {profile?.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[#8A7F76]">
                <Mail size={13} />
                <span className="truncate">{profile?.email}</span>
              </div>
              {profile?.createdAt && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#6B615A]">
                  <Calendar size={12} />
                  <span>
                    Member since{' '}
                    {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {picError && (
            <p className="mt-3 rounded-lg bg-[#3A1F1A] px-3 py-2 text-xs text-[#E07856]">
              {picError}
            </p>
          )}
        </div>

        {/* Editable name */}
        <form
          onSubmit={handleSaveName}
          className="mt-4 rounded-xl border border-[#2A2622] bg-[#211D1A] p-6"
        >
          <h2 className="font-['Outfit'] text-sm font-semibold text-[#F5F0EB]">
            Display name
          </h2>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] outline-none transition-colors focus:border-[#C2542D]/60"
            />
            <button
              type="submit"
              disabled={isSavingName}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C2542D] px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
            >
              {isSavingName ? (
                <Loader2 size={14} className="animate-spin" />
              ) : nameSuccess ? (
                <Check size={14} />
              ) : null}
              {isSavingName ? 'Saving…' : nameSuccess ? 'Saved' : 'Save'}
            </button>
          </div>
          {nameError && <p className="mt-2 text-xs text-[#E07856]">{nameError}</p>}
        </form>

        {/* Change password */}
        <form
          onSubmit={handleChangePassword}
          className="mt-4 rounded-xl border border-[#2A2622] bg-[#211D1A] p-6"
        >
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-[#8A7F76]" />
            <h2 className="font-['Outfit'] text-sm font-semibold text-[#F5F0EB]">
              Change password
            </h2>
          </div>

          <div className="mt-3 space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none transition-colors focus:border-[#C2542D]/60"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none transition-colors focus:border-[#C2542D]/60"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2A2622] bg-[#181512] px-3 py-2 text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none transition-colors focus:border-[#C2542D]/60"
            />
          </div>

          {passwordError && (
            <p className="mt-3 rounded-lg bg-[#3A1F1A] px-3 py-2 text-xs text-[#E07856]">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-400">
              Password updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={isChangingPassword}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-[#C2542D] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#D4A574] disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : null}
            {isChangingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}