"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToIE = exports.getLogger = exports.getScopes = exports.getUserAgentApp = void 0;
const msal_browser_1 = require("@azure/msal-browser");
const CLIENT_ID_REGEX = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;
const getUserAgentApp = ({ clientId, tenantUrl, redirectUri, postLogoutRedirectUri, useLocalStorageCache, }) => {
    if (clientId && CLIENT_ID_REGEX.test(clientId)) {
        return new msal_browser_1.PublicClientApplication({
            auth: Object.assign(Object.assign(Object.assign(Object.assign({}, (redirectUri && { redirectUri })), (tenantUrl && { authority: tenantUrl })), (postLogoutRedirectUri && { postLogoutRedirectUri })), { clientId, navigateToLoginRequestUrl: false }),
            cache: Object.assign({}, (useLocalStorageCache
                ? { cacheLocation: "localStorage" }
                : { cacheLocation: "sessionStorage" })),
        });
    }
};
exports.getUserAgentApp = getUserAgentApp;
const getScopes = (graphScopes) => {
    const scopes = graphScopes || [];
    if (!scopes.find((el) => el.toLowerCase() === "user.read")) {
        scopes.push("user.read");
    }
    return scopes;
};
exports.getScopes = getScopes;
const getLogger = (isDebugMode) => (name, content, isError) => {
    if (isDebugMode) {
        const style = `background-color: ${isError ? "#990000" : "#009900"}; color: #ffffff; font-weight: 700; padding: 2px`;
        console.groupCollapsed("MSLogin debug");
        console.log(`%c${name}`, style);
        content && console.log(content.message || content);
        console.groupEnd();
    }
};
exports.getLogger = getLogger;
const checkToIE = () => {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf("MSIE ");
    const msie11 = ua.indexOf("Trident/");
    const msedge = ua.indexOf("Edge/");
    const isIE = msie > 0 || msie11 > 0;
    const isEdge = msedge > 0;
    return isIE || isEdge;
};
exports.checkToIE = checkToIE;
//# sourceMappingURL=helpers.js.map