import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the role-based protected routes
const roleBasedRoutes = {
    student: [/^\/dashboard/],
    tutor: [/^\/tutor/],
    admin: [/^\/admin/],
};

const authRoutes = ["/login", "/register"];

const getDefaultRouteForRole = (role: string) => {
    if (role === "admin") return "/admin";
    if (role === "tutor") return "/tutor/dashboard";
    return "/dashboard";
};

const isSafeRedirectPath = (path: string | null): path is string =>
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/login") &&
    !path.startsWith("/register");

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Extract user cookie
    const userCookie = request.cookies.get("user")?.value;

    let user = null;
    if (userCookie) {
        try {
            user = JSON.parse(decodeURIComponent(userCookie));
        } catch (error) {
            console.error("Error parsing user cookie in middleware", error);
        }
    }

    // 1. If user is trying to access auth pages (login/register) but is already logged in
    if (user && authRoutes.some((route) => pathname.startsWith(route))) {
        const role = user.role?.toLowerCase() || "student";
        const redirectPath = pathname.startsWith("/login")
            ? request.nextUrl.searchParams.get("redirect")
            : null;

        // Prefer original intended route after login when provided.
        if (isSafeRedirectPath(redirectPath)) {
            return NextResponse.redirect(new URL(redirectPath, request.url));
        }

        // Otherwise redirect to their role dashboard.
        return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
    }

    // 2. Identify if the current path matches any protected role route
    const isStudentRoute = roleBasedRoutes.student.some((regex) => regex.test(pathname));
    const isTutorRoute = roleBasedRoutes.tutor.some((regex) => regex.test(pathname));
    const isAdminRoute = roleBasedRoutes.admin.some((regex) => regex.test(pathname));

    const isProtectedRoute = isStudentRoute || isTutorRoute || isAdminRoute;

    if (isProtectedRoute) {
        // 3. If unauthenticated and trying to access a protected route
        if (!user) {
            const loginUrl = new URL("/login", request.url);
            const intendedPath = `${pathname}${request.nextUrl.search}`;
            if (isSafeRedirectPath(intendedPath)) {
                loginUrl.searchParams.set("redirect", intendedPath);
            }
            return NextResponse.redirect(loginUrl);
        }

        const role = user.role?.toLowerCase() || "student";

        // 4. Role-based Authorization restrictions

        // Admins only
        if (isAdminRoute && role !== "admin") {
            return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
        }

        // Tutors only
        if (isTutorRoute && role !== "tutor") {
            return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
        }

        // Students only
        if (isStudentRoute && role !== "student") {
            return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
        }
    }

    return NextResponse.next();
}

// Config to specify which paths the middleware should intercept
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/tutor/:path*",
        "/login",
        "/register",
    ],
};
