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
    
    // Role permissions
    { resource: 'role', action: 'create', description: 'Create roles' },
    { resource: 'role', action: 'read', description: 'Read roles' },
    { resource: 'role', action: 'update', description: 'Update roles' },
    { resource: 'role', action: 'delete', description: 'Delete roles' },
    
    // Permission permissions
    { resource: 'permission', action: 'create', description: 'Create permissions' },
    { resource: 'permission', action: 'read', description: 'Read permissions' },
    { resource: 'permission', action: 'update', description: 'Update permissions' },
    { resource: 'permission', action: 'delete', description: 'Delete permissions' },
    
    // CRM permissions
    { resource: 'contact', action: 'create', description: 'Create contacts' },
    { resource: 'contact', action: 'read', description: 'Read contacts' },
    { resource: 'contact', action: 'update', description: 'Update contacts' },
    { resource: 'contact', action: 'delete', description: 'Delete contacts' },
    
    { resource: 'company', action: 'create', description: 'Create companies' },
    { resource: 'company', action: 'read', description: 'Read companies' },
    { resource: 'company', action: 'update', description: 'Update companies' },
    { resource: 'company', action: 'delete', description: 'Delete companies' },
    
    { resource: 'lead', action: 'create', description: 'Create leads' },
    { resource: 'lead', action: 'read', description: 'Read leads' },
    { resource: 'lead', action: 'update', description: 'Update leads' },
    { resource: 'lead', action: 'delete', description: 'Delete leads' },
    
    { resource: 'deal', action: 'create', description: 'Create deals' },
    { resource: 'deal', action: 'read', description: 'Read deals' },
    { resource: 'deal', action: 'update', description: 'Update deals' },
    { resource: 'deal', action: 'delete', description: 'Delete deals' },
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

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: {
        connect: { id: adminRole.id }
      }
    },
  });

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
