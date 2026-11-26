import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,

            refetchOnWindowFocus: true,
            refetchOnReconnect: true,

            retry: (failureCount, error) => {
                if (isAxiosError(error)) {
                    const status = error.response?.status;

                    if (status && status >= 400 && status < 500) {
                        return false;
                    }
                }

                return failureCount < 1;
            },
        },

        mutations: {
            retry: false,
        },
    },
});