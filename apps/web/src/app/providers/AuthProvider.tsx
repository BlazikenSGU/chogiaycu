import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { AuthContext } from './AuthContext';
import type { AuthStatus } from './AuthContext';

import { authApi } from '../../features/auth/api/auth.api';
import { tokenStore } from '../../lib/token-store';

import type {
    AuthUser,
    LoginDto,
    RegisterDto,
} from '../../features/auth/types/auth.types';

import { UserRole } from '../../features/auth/types/auth.types';
import { restoreAccessToken, invalidateAuthSession } from '../../lib/api';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    const sessionVersion = useRef(0);

    useEffect(() => {
        let active = true;
        const version = sessionVersion.current;

        async function restoreSession() {
            try {
                await restoreAccessToken();

                const currentUser = await authApi.me();

                if (active && version === sessionVersion.current) {
                    setUser(currentUser);
                    setStatus('authenticated');
                }
            } catch {
                if (
                    active && version === sessionVersion.current
                ) {
                    tokenStore.clear();
                    setUser(null);
                    setStatus('unauthenticated');
                }
            }
        }

        void restoreSession();

        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(
        async (data: LoginDto): Promise<AuthUser> => {
            const res = await authApi.login(data);

            sessionVersion.current += 1;

            tokenStore.set(res.accessToken);
            setUser(res.user);
            setStatus('authenticated');

            return res.user;
        }, [],
    );

    const register = useCallback(
        async (data: RegisterDto): Promise<AuthUser> => {
            const res = await authApi.register(data);

            sessionVersion.current += 1;

            tokenStore.set(res.accessToken);
            setUser(res.user);
            setStatus('authenticated');

            return res.user;
        }, [],
    );

    const logout = useCallback(
        async () => {
            sessionVersion.current += 1;

            invalidateAuthSession();

            setUser(null);
            setStatus('unauthenticated');

            try {
                await authApi.logout();
            } catch (error) {
                console.error('Logout request failed:', error);
            }
        }, []
    );

    const updateProfile = useCallback(
        async (data: { name: string }): Promise<AuthUser> => {
            const version = sessionVersion.current;

            const updateUser = await authApi.updateProfile(data);

            if (version !== sessionVersion.current) {
                throw new Error('Phiên đăng nhập đã thay đổi');
            }

            setUser(updateUser);
            return updateUser;
        },
        [],
    );

    const value = useMemo(
        () => ({
            user,
            status,
            isAuthenticated:
                status === 'authenticated' && user !== null,
            isAdmin:
                status === 'authenticated' && user?.role === UserRole.ADMIN,
            login,
            register,
            logout,
            updateProfile,
        }),
        [user, status, login, register, logout, updateProfile,],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}