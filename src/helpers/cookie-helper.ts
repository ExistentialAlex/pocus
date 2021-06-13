export function getCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(name));

  return cookie ? cookie.split("=")[1] : "";
}

export function setCookie(name: string, value: string) {
  document.cookie = name + "=" + value;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

export function checkCookie(name: string): boolean {
  return getCookie(name) != "";
}
