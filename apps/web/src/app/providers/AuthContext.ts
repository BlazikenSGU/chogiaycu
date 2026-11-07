import { createContext } from "react";
import type {
    AuthUser,
    LoginDto,
    RegisterDto,
} from '../../features/auth/types/auth.types';

export type AuthStatus = | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
    user: AuthUser | null;
    status: AuthStatus;

    isAuthenticated: boolean;
    isAdmin: boolean;

    login: (data: LoginDto) => Promise<AuthUser>;
    register: (data: RegisterDto) => Promise<AuthUser>;
    logout: () => Promise<void>;
    updateProfile: (data: {name: string}) => Promise<AuthUser>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);