export function dateDiff(a, b) {
    let delta = Math.abs(b - a) / 1000;
    const months = Math.floor(delta / 2592000);
    delta -= months * 2592000;
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;
    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    const seconds = Math.floor(delta % 60);
    return {
        days,
        hours,
        minutes,
        months,
        seconds,
    };
}
