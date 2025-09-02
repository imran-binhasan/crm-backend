import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default permissions
  const permissions = [
    // User permissions
    { resource: 'user', action: 'create', description: 'Create users' },
    { resource: 'user', action: 'read', description: 'Read users' },
    { resource: 'user', action: 'update', description: 'Update users' },
    { resource: 'user', action: 'delete', description: 'Delete users' },
    { resource: 'user', action: 'manage', description: 'Manage all user operations' },
    { resource: 'user', action: 'assign', description: 'Assign roles to users' },
    
    // Role permissions
    { resource: 'role', action: 'create', description: 'Create roles' },
    { resource: 'role', action: 'read', description: 'Read roles' },
    { resource: 'role', action: 'update', description: 'Update roles' },
    { resource: 'role', action: 'delete', description: 'Delete roles' },
    { resource: 'role', action: 'manage', description: 'Manage all role operations' },
    
    // Permission permissions
    { resource: 'permission', action: 'create', description: 'Create permissions' },
    { resource: 'permission', action: 'read', description: 'Read permissions' },
    { resource: 'permission', action: 'update', description: 'Update permissions' },
    { resource: 'permission', action: 'delete', description: 'Delete permissions' },
    { resource: 'permission', action: 'manage', description: 'Manage all permission operations' },
    
    // CRM permissions
    { resource: 'contact', action: 'create', description: 'Create contacts' },
    { resource: 'contact', action: 'read', description: 'Read contacts' },
    { resource: 'contact', action: 'update', description: 'Update contacts' },
    { resource: 'contact', action: 'delete', description: 'Delete contacts' },
    { resource: 'contact', action: 'manage', description: 'Manage all contact operations' },
    { resource: 'contact', action: 'read', description: 'Read own contacts' },
    
    { resource: 'company', action: 'create', description: 'Create companies' },
    { resource: 'company', action: 'read', description: 'Read companies' },
    { resource: 'company', action: 'update', description: 'Update companies' },
    { resource: 'company', action: 'delete', description: 'Delete companies' },
    { resource: 'company', action: 'manage', description: 'Manage all company operations' },
    
    { resource: 'lead', action: 'create', description: 'Create leads' },
    { resource: 'lead', action: 'read', description: 'Read leads' },
    { resource: 'lead', action: 'update', description: 'Update leads' },
    { resource: 'lead', action: 'delete', description: 'Delete leads' },
    { resource: 'lead', action: 'manage', description: 'Manage all lead operations' },
    { resource: 'lead', action: 'assign', description: 'Assign leads to users' },
    
    { resource: 'deal', action: 'create', description: 'Create deals' },
    { resource: 'deal', action: 'read', description: 'Read deals' },
    { resource: 'deal', action: 'update', description: 'Update deals' },
    { resource: 'deal', action: 'delete', description: 'Delete deals' },
    { resource: 'deal', action: 'manage', description: 'Manage all deal operations' },
    { resource: 'deal', action: 'assign', description: 'Assign deals to users' },
    
    // Dashboard and reporting
    { resource: 'dashboard', action: 'read', description: 'Access dashboard' },
    { resource: 'report', action: 'read', description: 'View reports' },
    { resource: 'report', action: 'export', description: 'Export reports' },
  ];

  // Create permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: permission.resource, action: permission.action } },
      update: {},
      create: permission,
    });
  }

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Sales Manager',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Regular User',
    },
  });

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Assign all permissions to Admin role
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign CRM permissions to Manager role
  const managerPermissions = allPermissions.filter(p => 
    ['contact', 'company', 'lead', 'deal'].includes(p.resource)
  );
  
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign read permissions to User role
  const readPermissions = allPermissions.filter(p => p.action === 'read');
  
  for (const permission of readPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create admin user using raw SQL approach
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.$executeRaw`
    INSERT INTO users (id, "firstName", "lastName", email, password, "roleId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'Admin', 'User', 'admin@example.com', ${hashedPassword}, ${adminRole.id}, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `;

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
