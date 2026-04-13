'use client';

import React from 'react';
import { Permission, hasPermission } from '@amisimedos/auth';
import { Role } from '@amisimedos/db/client';

interface PermissionGuardProps {
  permission: Permission;
  userRole: Role;
  userPermissions?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGuard
 * 
 * Component-level RBAC enforcement.
 * Conditionally renders children based on the user's capabilities.
 */
export function PermissionGuard({
  permission,
  userRole,
  userPermissions = [],
  fallback = null,
  children
}: PermissionGuardProps) {
  const allowed = hasPermission(userRole, userPermissions, permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component for protecting entire page views
 */
export function withPermission(Component: React.ComponentType<any>, permission: Permission) {
  return function ProtectedComponent(props: any) {
    return (
      <PermissionGuard 
        permission={permission} 
        userRole={props.userRole} 
        userPermissions={props.userPermissions}
        fallback={<UnauthorizedView />}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

function UnauthorizedView() {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-900/50 border border-slate-800 rounded-3xl">
      <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
      <p className="text-slate-400 mt-2 text-center">
        Your role does not have the permissions required to view this section.
      </p>
    </div>
  );
}
