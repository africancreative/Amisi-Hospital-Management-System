'use client';

import { useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
}

export function useAuth(): AuthState {
    const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

    useEffect(() => {
        const getCookie = (name: string): string | null => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        };

        const token = getCookie('amisi-token') || getCookie('amisi-session');
        const id = getCookie('amisi-user-id');
        const name = getCookie('amisi-user-name');
        const role = getCookie('amisi-user-role');

        setAuth({
            token,
            user: id && name && role ? { id, name, role } : null,
        });
    }, []);

    return auth;
}
