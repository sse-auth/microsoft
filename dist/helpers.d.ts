import { PublicClientApplication } from "@azure/msal-browser";
export declare const getUserAgentApp: ({ clientId, tenantUrl, redirectUri, postLogoutRedirectUri, useLocalStorageCache, }: {
    clientId: string;
    tenantUrl?: string;
    redirectUri?: string;
    postLogoutRedirectUri?: string;
    useLocalStorageCache?: boolean;
}) => PublicClientApplication | undefined;
export declare const getScopes: (graphScopes?: string[]) => string[];
export declare const getLogger: (isDebugMode?: boolean) => (name: string, content?: any, isError?: boolean) => void;
export declare const checkToIE: () => boolean;
//# sourceMappingURL=helpers.d.ts.map