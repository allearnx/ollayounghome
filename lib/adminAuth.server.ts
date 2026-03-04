import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase.server';

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type AccessRole = 'staff' | 'admin';

export function hasRequiredRole(userRole: AccessRole, requiredRole: AccessRole) {
  if (userRole === 'admin') return true;
  return userRole === requiredRole;
}

async function requireRole(
  request: NextRequest,
  requiredRole: AccessRole
): Promise<{ userId: string; email?: string; role: AccessRole }> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!token) {
    throw new AdminAuthError('인증이 필요합니다.', 401);
  }

  const supabase = getSupabaseAdmin();

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    throw new AdminAuthError('인증이 올바르지 않습니다.', 401);
  }

  const user = userData.user;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AdminAuthError('권한 정보를 찾을 수 없습니다.', 403);
  }

  const role = profile.role as AccessRole;
  if (!hasRequiredRole(role, requiredRole)) {
    throw new AdminAuthError(
      requiredRole === 'admin' ? '관리자 권한이 필요합니다.' : '스태프 권한이 필요합니다.',
      403
    );
  }

  return { userId: user.id, email: user.email, role };
}

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, 'admin');
}

export async function requireStaffOrAdmin(request: NextRequest) {
  return requireRole(request, 'staff');
}

