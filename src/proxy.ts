import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the role-based protected routes
const roleBasedRoutes = {
    student: [/^\/dashboard/],
    tutor: [/^\/tutor/],
    admin: [/^\/admin/],
};

const authRoutes = ["/login", "/register"];

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

        // Redirect them to their respective dashboard
        if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
        if (role === "tutor") return NextResponse.redirect(new URL("/tutor/dashboard", request.url));
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. Identify if the current path matches any protected role route
    const isStudentRoute = roleBasedRoutes.student.some((regex) => regex.test(pathname));
    const isTutorRoute = roleBasedRoutes.tutor.some((regex) => regex.test(pathname));
    const isAdminRoute = roleBasedRoutes.admin.some((regex) => regex.test(pathname));

    const isProtectedRoute = isStudentRoute || isTutorRoute || isAdminRoute;

    if (isProtectedRoute) {
        // 3. If unauthenticated and trying to access a protected route
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const role = user.role?.toLowerCase() || "student";

        // 4. Role-based Authorization restrictions

        // Admins only
        if (isAdminRoute && role !== "admin") {
            return NextResponse.redirect(new URL(role === "tutor" ? "/tutor/dashboard" : "/dashboard", request.url));
        }

        // Tutors only
        if (isTutorRoute && role !== "tutor") {
            return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/dashboard", request.url));
        }

        // Students only
        if (isStudentRoute && role !== "student") {
            return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/tutor/dashboard", request.url));
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
