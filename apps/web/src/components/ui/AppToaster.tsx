import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { X } from 'lucide-react';

export default function AppToaster() {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={12}
            containerStyle={{
                top: 24,
                right: 16,
                left: 16,
            }}
            toastOptions={{
                duration: 4000,

                style: {
                    background: '#ffffff',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    maxWidth: '380px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                },

                success: {
                    duration: 4000,
                    style: {
                        border: '1px solid #16a34a',
                    },
                    iconTheme: {
                        primary: '#16a34a',
                        secondary: '#ffffff',
                    },
                },

                error: {
                    duration: 6000,
                    style: {
                        border: '1px solid #dc2626',
                    },
                    iconTheme: {
                        primary: '#dc2626',
                        secondary: '#ffffff',
                    },
                },

                loading: {
                    duration: Infinity,
                    style: {
                        border: '1px solid #64748b',
                    },
                    iconTheme: {
                        primary: '#64748b',
                        secondary: '#e2e8f0',
                    },
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <>
                            {icon}

                            {message}

                            {t.type !== 'loading' && (
                                <button
                                    type="button"
                                    onClick={() => toast.dismiss(t.id)}
                                    title="Đóng thông báo"
                                    aria-label="Đóng thông báo"
                                    className="
                                        ml-1 shrink-0
                                        cursor-pointer
                                        rounded-md p-1
                                        text-gray-400
                                        transition-colors
                                        hover:bg-gray-100
                                        hover:text-gray-800
                                    "
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
}