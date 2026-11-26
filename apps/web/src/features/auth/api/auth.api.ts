import api from '../../../lib/api';

import type {
    AuthResponse,
    AuthUser,
    LoginDto,
    RegisterDto,
    RefreshResponse,
    LogoutResponse,
    RegisterResponse
} from '../types/auth.types';

export const authApi = {
    async login(data: LoginDto) {
        const response = await api.post<AuthResponse>(
            '/auth/login',
            data
        );

        return response.data;
    },

    async register(data: RegisterDto) {
        const res = await api.post<RegisterResponse>(
            '/auth/register',
            data
        );

        return res.data;
    },

    async refresh() {
        const res = await api.post<RefreshResponse>(
            '/auth/refresh',
        );

        return res.data;
    },

    async me() {
        const res = await api.get<AuthUser>(
            '/auth/me',
        );

        return res.data;
    },

    async logout() {
        const res = await api.post<LogoutResponse>(
            '/auth/logout'
        );

        return res.data;
    },

    async updateProfile(data: { name: string }) {
        const res = await api.patch<AuthUser>(
            '/auth/me',
            data
        );

        return res.data;
    },

    async changePassword(data: {
        currentPassword: string,
        newPassword: string
    }) {
        const res = await api.patch<{ message: string }>(
            `/auth/change-password`,
            data,
        );

        return res.data;
    },

    async forgotPassword(email: string) {
        const res = await api.post<{ message: string }>(
            '/auth/forgot-password',
            { email },
        );

        return res.data;
    },

    async resetPassword(data: {
        token: string;
        newPassword: string;
        confirmPassword: string;
    }) {
        const res = await api.post<{ message: string }>(
            '/auth/reset-password',
            data
        );

        return res.data;
    },

    async verifyEmail(token: string) {
        const res = await api.post<{ message: string }>(
            '/auth/verify-email',
            { token },
        );

        return res.data;
    },

    async resendVerification(email: string) {
        const res = await api.post<{ message: string }>(
            '/auth/resend-verification',
            { email },
        );

        return res.data;
    },
}