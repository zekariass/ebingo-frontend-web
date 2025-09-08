import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}
