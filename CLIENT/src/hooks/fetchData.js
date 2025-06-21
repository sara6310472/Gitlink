import { useCallback } from 'react';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:3001';

export function useFetchData() {
    const fetchData = useCallback(async ({
        role = '', type, params = {}, method = "GET", body = null, onSuccess, onError, logOut = null,
    }) => {
        const query = method === "GET" ? `?${new URLSearchParams(params).toString()}` : "";
        const url = `${BASE_URL}${role}/${type}${query}`;
        const token = Cookies.get('accessToken');

        const options = (tokenToUse) => {
            const headers = {
                ...(tokenToUse && { Authorization: `Bearer ${tokenToUse}` }),
            };
            if (!(body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }
            return {
                method,
                credentials: 'include',
                headers,
                ...(body && { body: body instanceof FormData ? body : JSON.stringify(body) }),
            };
        };

        try {
            let response = await fetch(url, options(token));

            if (response.status === 401) {
                try {
                    const refreshRes = await fetch(`${BASE_URL}/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                    if (!refreshRes.ok) {
                        logOut?.();
                        throw new Error('Session expired. Please login again.');
                    }
                    const { token: newToken } = await refreshRes.json();
                    Cookies.set('accessToken', newToken);
                    const newOptions = {
                        ...options(newToken),
                        headers: {
                            ...options(newToken).headers,
                            'Authorization': `Bearer ${newToken}`
                        }
                    };
                    response = await fetch(url, newOptions);
                } catch (error) {
                    logOut?.();
                    throw error;
                }
            }

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw data;

            onSuccess?.(data);
        } catch (error) {
            console.error(error);
            onError?.(error.message || error.error || JSON.stringify(error));
        }
    }, []);

    return fetchData;
}
