import { NextRequest, NextResponse } from 'next/server';
type LoginPayload = { access_token?: string; user_id?: number; email?: string; full_name?: string; detail?: string; message?: string };
function backendUrl() { const value = process.env.API_BACKEND_URL; if (!value) throw new Error('The application service is not configured. Please try again later.'); return value.replace(/\/$/, ''); }
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData(); const email = String(body.get('email') || '').trim(); const password = String(body.get('password') || '');
    if (!email || !password) return NextResponse.json({ message: 'Enter both your email and password.' }, { status: 400 });
    const upstream = await fetch(`${backendUrl()}/api/py/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams({ username: email, password }), cache: 'no-store' });
    const payload = await upstream.json().catch(() => ({})) as LoginPayload;
    if (!upstream.ok || !payload.access_token) { const message = upstream.status === 401 ? 'We could not sign you in. Check your email and password, or create an account.' : payload.detail || payload.message || 'We could not sign you in right now. Please try again.'; return NextResponse.json({ message }, { status: upstream.status || 500 }); }
    const response = NextResponse.json({ user: { id: payload.user_id, email: payload.email || email, full_name: payload.full_name || '' } });
    response.cookies.set({ name: 'access_token', value: payload.access_token, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : 'We could not sign you in right now. Please try again.' }, { status: 500 }); }
}
