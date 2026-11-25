import toast from 'react-hot-toast';
import {
    AlertTriangle,
    Info,
} from 'lucide-react';

import { getApiErrorMessage } from './api-error';

export const notify = {
    success(message: string) {
        return toast.success(message);
    },

    error(message: string) {
        return toast.error(message);
    },

    warning(message: string) {
        return toast(message, {
            icon: (
                <AlertTriangle
                    size={20}
                    color="#d97706"
                />
            ),
            duration: 5000,
            style: {
                border: '1px solid #d97706',
            },
        });
    },

    info(message: string) {
        return toast(message, {
            icon: (
                <Info
                    size={20}
                    color="#2563eb"
                />
            ),
            duration: 4000,
            style: {
                border: '1px solid #2563eb',
            },
        });
    },

    loading(message: string) {
        return toast.loading(message);
    },

    apiError(
        error: unknown,
        title = 'Thao tác thất bại',
    ) {
        return toast.error(
            `${title}: ${getApiErrorMessage(error)}`,
        );
    },

    updateSuccess(id: string, message: string) {
        return toast.success(message, { id });
    },

    updateError(id: string, message: string) {
        return toast.error(message, { id });
    },

    dismiss(id?: string) {
        toast.dismiss(id);
    },
};