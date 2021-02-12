export function getApiUrl(): string {
    const url = typeof window !== "undefined" ? window.location.toString() : "";
    if (url.indexOf("localhost:4200") !== -1) { // is dev
        const apiPortDev = 3000;
        return `http://localhost:${apiPortDev}/api/`;
    }
    return `${url.substring(0, url.indexOf("/login"))}/api/`;
}
