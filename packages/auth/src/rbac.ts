export type Permission = 
  | 'patient:read' | 'patient:write' | 'patient:delete'
  | 'encounter:read' | 'encounter:write' | 'encounter:delete'
  | 'prescription:read' | 'prescription:write'
  | 'lab:read' | 'lab:write' | 'lab:validate'
  | 'radiology:read' | 'radiology:write'
  | 'billing:read' | 'billing:write' | 'billing:refund'
  | 'inventory:read' | 'inventory:write' | 'inventory:adjust'
  | 'hr:read' | 'hr:write'
  | 'reports:read' | 'reports:export'
  | 'admin:full' | 'admin:users' | 'admin:settings'
  | 'chat:read' | 'chat:write'
  | 'audit:read';

export interface RolePermissions {
  roleName: string;
  permissions: Permission[];
  extends?: string[];
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  ADMIN: {
    roleName: 'ADMIN',
    permissions: [
      'patient:read', 'patient:write', 'patient:delete',
      'encounter:read', 'encounter:write', 'encounter:delete',
      'prescription:read', 'prescription:write',
      'lab:read', 'lab:write', 'lab:validate',
      'radiology:read', 'radiology:write',
      'billing:read', 'billing:write', 'billing:refund',
      'inventory:read', 'inventory:write', 'inventory:adjust',
      'hr:read', 'hr:write',
      'reports:read', 'reports:export',
      'admin:full', 'admin:users', 'admin:settings',
      'chat:read', 'chat:write',
      'audit:read'
    ]
  },
  DOCTOR: {
    roleName: 'DOCTOR',
    permissions: [
      'patient:read', 'patient:write',
      'encounter:read', 'encounter:write',
      'prescription:read', 'prescription:write',
      'lab:read', 'lab:write',
      'radiology:read', 'radiology:write',
      'reports:read',
      'chat:read', 'chat:write'
    ]
  },
  NURSE: {
    roleName: 'NURSE',
    permissions: [
      'patient:read', 'patient:write',
      'encounter:read', 'encounter:write',
      'prescription:read',
      'lab:read',
      'reports:read',
      'chat:read', 'chat:write'
    ]
  },
  PHARMACIST: {
    roleName: 'PHARMACIST',
    permissions: [
      'patient:read',
      'prescription:read', 'prescription:write',
      'inventory:read', 'inventory:write',
      'reports:read',
      'chat:read', 'chat:write'
    ]
  },
  LAB_TECH: {
    roleName: 'LAB_TECH',
    permissions: [
      'patient:read',
      'lab:read', 'lab:write', 'lab:validate',
      'reports:read',
      'chat:read', 'chat:write'
    ]
  },
  ACCOUNTANT: {
    roleName: 'ACCOUNTANT',
    permissions: [
      'patient:read',
      'billing:read', 'billing:write', 'billing:refund',
      'reports:read', 'reports:export',
      'chat:read', 'chat:write'
    ]
  },
  HR_MANAGER: {
    roleName: 'HR_MANAGER',
    permissions: [
      'hr:read', 'hr:write',
      'reports:read', 'reports:export',
      'admin:users',
      'chat:read', 'chat:write'
    ]
  },
  ICU_NURSE: {
    roleName: 'ICU_NURSE',
    permissions: [
      'patient:read', 'patient:write',
      'encounter:read', 'encounter:write',
      'prescription:read',
      'lab:read',
      'inventory:read',
      'reports:read',
      'chat:read', 'chat:write'
    ]
  }
};

export class RBACService {
  private rolePermissions: Map<string, Set<Permission>> = new Map();
  private userPermissions: Map<string, Set<Permission>> = new Map();

  constructor() {
    this.loadRolePermissions();
  }

  private loadRolePermissions(): void {
    for (const role of Object.values(ROLE_PERMISSIONS)) {
      const permissions = new Set(role.permissions);
      
      if (role.extends) {
        for (const parentRole of role.extends) {
          const parent = ROLE_PERMISSIONS[parentRole];
          if (parent) {
            parent.permissions.forEach(p => permissions.add(p));
          }
        }
      }
      
      this.rolePermissions.set(role.roleName, permissions);
    }
  }

  public getRolePermissions(role: string): Permission[] {
    return Array.from(this.rolePermissions.get(role) || []);
  }

  public getUserPermissions(role: string, customPermissions?: string[]): Permission[] {
    const rolePerms = new Set(this.rolePermissions.get(role) || []);
    
    if (customPermissions) {
      customPermissions.forEach(p => rolePerms.add(p as Permission));
    }
    
    return Array.from(rolePerms);
  }

  public hasPermission(role: string, permission: Permission, customPermissions?: string[]): boolean {
    const userPerms = this.getUserPermissions(role, customPermissions);
    return userPerms.includes(permission);
  }

  public hasAnyPermission(role: string, permissions: Permission[], customPermissions?: string[]): boolean {
    const userPerms = this.getUserPermissions(role, customPermissions);
    return permissions.some(p => userPerms.includes(p));
  }

  public hasAllPermissions(role: string, permissions: Permission[], customPermissions?: string[]): boolean {
    const userPerms = this.getUserPermissions(role, customPermissions);
    return permissions.every(p => userPerms.includes(p));
  }

  public canAccessResource(role: string, resource: string, action: string, customPermissions?: string[]): boolean {
    const permission = `${resource}:${action}` as Permission;
    return this.hasPermission(role, permission, customPermissions);
  }

  public filterAccessibleResources<T extends { resourceType: string }>(
    role: string,
    resources: T[],
    action: 'read' | 'write' | 'delete',
    customPermissions?: string[]
  ): T[] {
    return resources.filter(r => 
      this.canAccessResource(role, r.resourceType, action, customPermissions)
    );
  }
}

export const rbacService = new RBACService();