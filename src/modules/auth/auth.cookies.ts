import { CookieOptions, Response } from "express";

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const REFRESH_COOKIE_PATH = '/auth';


const base: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};

export function setAuthCookies(res: Response, token: { accessToken: string, refreshToken: string }): void{
    res.cookie(ACCESS_COOKIE, token.accessToken, {...base, path: '/', maxAge: 15 * 60 * 1000 });
    res.cookie(REFRESH_COOKIE_NAME, token.refreshToken, {...base, path: REFRESH_COOKIE_PATH, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response): void{
    res.clearCookie(ACCESS_COOKIE, {...base, path: '/'});
    res.clearCookie(REFRESH_COOKIE_NAME, {...base, path: REFRESH_COOKIE_PATH});
}