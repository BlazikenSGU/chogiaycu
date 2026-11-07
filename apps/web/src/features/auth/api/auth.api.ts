import api from '../../../lib/api';

import type {
    AuthResponse,
    AuthUser,
    LoginDto,
    RegisterDto,
    RefreshResponse,
    LogoutResponse
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
        const res = await api.post<AuthResponse>(
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
    }
}