export const UserRole = {
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUser {
    id: string,
    email: string,
    name: string,
    role: UserRole,
}

export interface LoginDto {
    email: string,
    password: string
}

export interface RegisterDto {
    email: string,
    password: string,
    name?: string,
}

export interface AuthResponse {
    user: AuthUser,
    accessToken: string,
}

export interface RefreshResponse {
    accessToken: string;
}

export interface LogoutResponse {
    message: string;
}