'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/hooks/useLanguage';
import type { FamilyMember } from '../family.types';
import {
  deleteMemberProfileImage,
  memberProfileImagePath,
  resolveMemberProfileImageUrl,
  uploadMemberProfileImage,
} from '../services/familyFirestore';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 - 1;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface MemberProfileModalProps {
  familyId: string;
  member: FamilyMember;
  canManageImage: boolean;
  canDelete: boolean;
  onClose: () => void;
  onSave: (member: FamilyMember) => Promise<void>;
  onDelete: (member: FamilyMember) => Promise<void>;
}

const initialsFor = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .slice(0, 3)
  .toUpperCase();

export default function MemberProfileModal({
  familyId,
  member,
  canManageImage,
  canDelete,
  onClose,
  onSave,
  onDelete,
}: MemberProfileModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(member.name);
  const [color, setColor] = useState(member.color);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleId = `edit-profile-${member.id}`;

  useEffect(() => {
    let active = true;
    if (member.profileImagePath) {
      void resolveMemberProfileImageUrl(member.profileImagePath)
        .then((url) => { if (active) setCurrentImageUrl(url); })
        .catch(() => { if (active) setCurrentImageUrl(null); });
    }
    return () => { active = false; };
  }, [member.profileImagePath]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  const chooseFile = (file?: File) => {
    setError(null);
    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setError(t('family.imageTypeError'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('family.imageSizeError'));
      return;
    }
    setSelectedFile(file);
    setRemoveImage(false);
    setProgress(0);
  };

  const requestRemoveImage = () => {
    setSelectedFile(null);
    setRemoveImage(true);
    setProgress(0);
    setError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || busy) return;
    setBusy(true);
    setError(null);
    const imagePath = memberProfileImagePath(familyId, member);
    let uploadedNewImage = false;
    try {
      if (selectedFile) {
        await uploadMemberProfileImage(imagePath, selectedFile, setProgress);
        uploadedNewImage = true;
      } else if (removeImage && member.profileImagePath) {
        await deleteMemberProfileImage(member.profileImagePath);
      }

      await onSave({
        ...member,
        name: trimmedName,
        color,
        avatar: initialsFor(trimmedName),
        profileImagePath: selectedFile ? imagePath : removeImage ? undefined : member.profileImagePath,
        profileImageUpdatedAt: selectedFile ? new Date().toISOString() : removeImage ? undefined : member.profileImageUpdatedAt,
      });
    } catch {
      if (uploadedNewImage && !member.profileImagePath) {
        await deleteMemberProfileImage(imagePath).catch(() => undefined);
      }
      setError(t('family.profileSaveError'));
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!canDelete || busy || !window.confirm(t('family.deleteProfileConfirm'))) return;
    setBusy(true);
    setError(null);
    try {
      if (member.profileImagePath) await deleteMemberProfileImage(member.profileImagePath);
      await onDelete(member);
    } catch {
      setError(t('family.profileDeleteError'));
      setBusy(false);
    }
  };

  const displayedImage = previewUrl || (!removeImage ? currentImageUrl : null);

  return (
    <div className="profile-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="profile-modal-header">
          <div>
            <span>{t('family.memberProfile')}</span>
            <h3 id={titleId}>{t('family.editProfile')}</h3>
          </div>
          <button type="button" className="profile-modal-close" onClick={onClose} disabled={busy} aria-label={t('family.closeProfileEditor')}>×</button>
        </header>

        <form onSubmit={submit}>
          <div className="profile-image-editor">
            <div className="profile-image-preview" style={{ backgroundColor: color }}>
              {displayedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayedImage} alt={t('family.profileImageAlt')} />
              ) : (
                <span>{initialsFor(name) || member.avatar}</span>
              )}
            </div>
            {canManageImage && (
              <div className="profile-image-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                  disabled={busy}
                  aria-label={t('family.chooseProfileImage')}
                />
                <button type="button" className="secondary-profile-button" onClick={() => fileInputRef.current?.click()} disabled={busy}>
                  {displayedImage ? t('family.changeImage') : t('family.uploadImage')}
                </button>
                {displayedImage && (
                  <button type="button" className="text-danger-button" onClick={requestRemoveImage} disabled={busy}>
                    {t('family.removeImage')}
                  </button>
                )}
              </div>
            )}
          </div>

          {busy && selectedFile && (
            <div className="profile-upload-progress" role="status" aria-live="polite">
              <span>{t('family.uploadingImage')} {progress}%</span>
              <progress max="100" value={progress}>{progress}%</progress>
            </div>
          )}
          {error && <p className="profile-modal-error" role="alert">{error}</p>}

          <label htmlFor="profileName">{t('family.profileName')}</label>
          <input id="profileName" value={name} onChange={(event) => setName(event.target.value)} required disabled={busy} autoFocus />
          <label htmlFor="profileColor">{t('family.profileColor')}</label>
          <div className="profile-color-row">
            <input id="profileColor" type="color" value={color} onChange={(event) => setColor(event.target.value)} disabled={busy} />
            <span>{color.toUpperCase()}</span>
          </div>

          <footer className="profile-modal-footer">
            {canDelete && (
              <button type="button" className="delete-profile-button" onClick={() => void confirmDelete()} disabled={busy}>
                {t('common.delete')}
              </button>
            )}
            <button type="button" className="secondary-profile-button" onClick={onClose} disabled={busy}>{t('family.cancel')}</button>
            <button type="submit" disabled={busy || !name.trim()}>{busy ? t('family.savingProfile') : t('common.save')}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
