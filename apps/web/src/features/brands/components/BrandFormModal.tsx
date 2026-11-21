
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  X,
  Tags,
  LoaderCircle,
  UploadCloud,
  ImagePlus,
  Trash2,
} from 'lucide-react';

import { brandsApi } from '../api/brand.api';
import { getApiErrorMessage } from '../../../lib/api-error';
import type { Brand } from '../types/brand.types';

interface BrandFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (brand: Brand) => void;
  brand?: Brand | null;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BrandFormModal({
  open,
  onClose,
  onSuccess,
  brand = null,
}: BrandFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(brand);

  useEffect(() => {
    if (!open) return;

    setName(brand?.name ?? '');
    setSlug(brand?.slug ?? '');
    setSlugEdited(Boolean(brand));
    updatePreview(null);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [open, brand]);

  const previewObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function updatePreview(nextFile: File | null) {
    const previousUrl = previewObjectUrlRef.current;

    const nextUrl = nextFile
      ? URL.createObjectURL(nextFile)
      : null;

    previewObjectUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl ?? '');
    setFile(nextFile);

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
  }

  if (!open) return null;

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError('');

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Logo không được vượt quá 2MB.');
      event.target.value = '';
      return;
    }

    updatePreview(selectedFile);
    event.target.value = '';
  }

  function removeFile() {
    updatePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) return;

    setError('');

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName || !cleanSlug) {
      setError('Vui lòng nhập tên và slug thương hiệu.');
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setError('Slug không hợp lệ.');
      return;
    }

    try {
      setSaving(true);

      let logoUrl: string | undefined;

      // Upload logo trước khi tạo thương hiệu.
      if (file) {
        const uploaded = await brandsApi.uploadLogo(file);
        logoUrl = uploaded.url;
      }

      // Lưu thương hiệu vào PostgreSQL.
      const payload = {
        name: cleanName,
        slug: cleanSlug,
        ...(logoUrl && { logoUrl }),
      };

      const saveBrand = brand ? await brandsApi.update(brand.id, payload) : await brandsApi.create(payload);

      onSuccess(saveBrand);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-modal-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-3">
              <Tags size={21} />
            </div>

            <div>
              <h2
                id="brand-modal-title"
                className="text-lg font-semibold"
              >
                {isEditing ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditing
                  ? 'Cập nhật thông tin thương hiệu'
                  : 'Tạo thương hiệu mới cho cửa hàng'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Đóng"
            className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Brand name */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Tên thương hiệu *
              </span>

              <input
                required
                maxLength={100}
                disabled={saving}
                value={name}
                onChange={(e) =>
                  handleNameChange(e.target.value)
                }
                placeholder="Ví dụ: Nike"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
              />
            </label>

            {/* Slug */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Slug *
              </span>

              <input
                required
                maxLength={120}
                disabled={saving}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                placeholder="nike"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
              />

              <span className="mt-1 block text-xs text-gray-400">
                Tự động tạo từ tên thương hiệu.
              </span>
            </label>

            {/* Logo upload */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Logo thương hiệu
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={saving}
                className="hidden"
                id="brand-logo-upload"
              />

              {!file && !brand?.logoUrl ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 transition hover:border-black hover:bg-gray-100 disabled:opacity-50"
                >
                  <div className="mb-3 rounded-xl bg-white p-3 shadow-sm">
                    <UploadCloud size={26} />
                  </div>

                  <span className="text-sm font-medium">
                    Nhấn để tải ảnh logo
                  </span>

                  <span className="mt-1 text-xs text-gray-400">
                    PNG, JPG, WEBP – Tối đa 2MB
                  </span>
                </button>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-36 items-center justify-center rounded-lg bg-white p-3">
                    <img
                      src={file ? previewUrl : brand?.logoUrl || '/images/image-not-available.png'}
                      alt="Logo thương hiệu"
                      className="max-h-full max-w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/images/image-not-available.png';
                      }}
                    />
                  </div>

                  <p className="mt-3 truncate text-center text-xs text-gray-500">
                    {file ? file.name : 'Logo hiện tại'}
                  </p>

                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ImagePlus size={15} />
                      Đổi ảnh
                    </button>
                    {file && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={removeFile}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? 'Đang lưu...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Tạo thương hiệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
