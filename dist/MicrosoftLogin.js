"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const MicrosoftLoginButton_1 = __importDefault(require("./MicrosoftLoginButton"));
const helpers_1 = require("./helpers");
const MicrosoftLogin = ({ graphScopes, clientId, tenantUrl, redirectUri, postLogoutRedirectUri, children, buttonTheme, className, withUserData = false, authCallback, forceRedirectStrategy = false, prompt, debug, useLocalStorageCache, }) => {
    const msalInstance = (0, helpers_1.getUserAgentApp)({
        clientId,
        tenantUrl,
        redirectUri,
        postLogoutRedirectUri,
        useLocalStorageCache,
    });
    const scopes = (0, helpers_1.getScopes)(graphScopes);
    const log = (0, helpers_1.getLogger)(debug);
    if (!msalInstance) {
        log("Initialization", "clientID broken or not provided", true);
        return null;
    }
    (0, react_1.useEffect)(() => {
        msalInstance
            .handleRedirectPromise()
            .then((AuthenticationResult) => {
            if (AuthenticationResult) {
                log("Fetch Azure AD 'token' with redirect SUCCEEDED", AuthenticationResult);
                log("Fetch Graph API 'access_token' in silent mode STARTED");
                getGraphAPITokenAndUser(true);
            }
        })
            .catch((error) => {
            log("Fetch Azure AD 'token' with redirect FAILED", error, true);
            authCallback(error);
        });
    }, []);
    // attempt silent login
    // return msalInstance to user login handler on reload if token is present
    (0, react_1.useEffect)(() => {
        const clientToken = useLocalStorageCache
            ? localStorage.getItem("msal.idtoken")
            : sessionStorage.getItem("msal.idtoken");
        clientToken &&
            getGraphAPITokenAndUser(forceRedirectStrategy || (0, helpers_1.checkToIE)());
    }, [msalInstance]);
    const login = () => {
        log("Login STARTED");
        if (forceRedirectStrategy || (0, helpers_1.checkToIE)()) {
            redirectLogin();
        }
        else {
            popupLogin();
        }
    };
    const finalStep = (AuthenticationResultWithAccessToken) => {
        log("Fetch Graph API 'access_token' SUCCEEDED", AuthenticationResultWithAccessToken);
        if (withUserData) {
            getUserData(AuthenticationResultWithAccessToken);
        }
        else {
            log("Login SUCCEEDED");
            authCallback(null, AuthenticationResultWithAccessToken, msalInstance);
        }
    };
    const getGraphAPITokenAndUser = (isRedirect) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            try {
                const silentRes = yield msalInstance.acquireTokenSilent({ scopes });
                finalStep(silentRes);
            }
            catch (err) {
                log("Fetch Graph API 'access_token' in silent mode is FAILED", err, true);
                if (isRedirect) {
                    log("Fetch Graph API 'access_token' with redirect STARTED");
                    msalInstance.acquireTokenRedirect({ scopes });
                }
                else {
                    log("Fetch Graph API 'access_token' with popup STARTED");
                    const popupRes = yield msalInstance.acquireTokenPopup({ scopes });
                    finalStep(popupRes);
                }
            }
        }
        catch (error) {
            log("Login FAILED", error, true);
            authCallback(error);
        }
    });
    const popupLogin = () => __awaiter(void 0, void 0, void 0, function* () {
        log("Fetch Azure AD 'token' with popup STARTED");
        try {
            const AuthenticationResult = yield msalInstance.loginPopup({
                scopes,
                prompt,
            });
            log("Fetch Azure AD 'token' with popup SUCCEEDED", AuthenticationResult);
            log("Fetch Graph API 'access_token' in silent mode STARTED");
            getGraphAPITokenAndUser();
        }
        catch (err) {
            log("Fetch Azure AD 'token' with popup FAILED", err, true);
            authCallback(err);
        }
    });
    const redirectLogin = () => {
        log("Fetch Azure AD 'token' with redirect STARTED");
        msalInstance.loginRedirect({ scopes, prompt });
    };
    const getUserData = (AuthenticationResultWithAccessToken) => __awaiter(void 0, void 0, void 0, function* () {
        const { accessToken } = AuthenticationResultWithAccessToken;
        log("Fetch Graph API user data STARTED");
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };
        const response = yield fetch("https://graph.microsoft.com/v1.0/me", options);
        const userData = yield response.json();
        log("Fetch Graph API user data SUCCEEDED", userData);
        log("Login SUCCEEDED");
        authCallback(null, Object.assign(Object.assign({}, userData), AuthenticationResultWithAccessToken), msalInstance);
    });
    return children ? (react_1.default.createElement("div", { onClick: login }, children)) : (react_1.default.createElement(MicrosoftLoginButton_1.default, { buttonTheme: buttonTheme || "light", buttonClassName: className, onClick: login }));
};
exports.default = MicrosoftLogin;
//# sourceMappingURL=MicrosoftLogin.js.map