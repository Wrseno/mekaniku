import { prisma } from '@/db/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '@/utils/response';
import { UserRole } from '@prisma/client';
import {
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopQueryInput,
  CreateServiceInput,
  UpdateServiceInput,
  CreateMechanicInput,
  UpdateMechanicInput,
} from './schemas';
import { buildPaginationResult, calculatePagination } from '@/utils/pagination';

export class WorkshopService {
  async createWorkshop(ownerId: string, data: CreateWorkshopInput) {
    // Verify user exists and has WORKSHOP or ADMIN role
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundError('Owner not found');
    }

    if (owner.role !== UserRole.WORKSHOP && owner.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only workshop owners or admins can create workshops');
    }

    const workshop = await prisma.workshop.create({
      data: {
        ...data,
        ownerId,
        openHours: data.openHours as any,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return workshop;
  }

  async getWorkshops(query: WorkshopQueryInput, page: number, limit: number) {
    const { skip, take } = calculatePagination(page, limit);

    const where: any = {
      deletedAt: null,
    };

    // Filter by city
    if (query.city) {
      where.city = {
        contains: query.city,
        mode: 'insensitive',
      };
    }

    // Simple proximity filter (for production, use PostGIS)
    if (query.lat && query.lng && query.radius) {
      // This is a simplified rectangular bounding box
      // For accurate distance, use raw SQL with PostGIS or calculate in application
      const latDelta = query.radius / 111; // 1 degree lat ≈ 111 km
      const lngDelta = query.radius / (111 * Math.cos((query.lat * Math.PI) / 180));

      where.latitude = {
        gte: query.lat - latDelta,
        lte: query.lat + latDelta,
      };
      where.longitude = {
        gte: query.lng - lngDelta,
        lte: query.lng + lngDelta,
      };
    }

    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              serviceCatalogs: true,
              mechanics: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.workshop.count({ where }),
    ]);

    return buildPaginationResult(workshops, total, page, limit);
  }

  async getWorkshopById(id: string) {
    const workshop = await prisma.workshop.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        serviceCatalogs: {
          where: {
            deletedAt: null,
          },
        },
        mechanics: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    return workshop;
  }

  async updateWorkshop(id: string, data: UpdateWorkshopInput, userId: string, userRole: UserRole) {
    const workshop = await prisma.workshop.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Only owner or admin can update
    if (userRole !== UserRole.ADMIN && workshop.ownerId !== userId) {
      throw new ForbiddenError('You can only update your own workshop');
    }

    const updated = await prisma.workshop.update({
      where: { id },
      data: {
        ...data,
        ...(data.openHours && { openHours: data.openHours as any }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteWorkshop(id: string, userId: string, userRole: UserRole) {
    const workshop = await prisma.workshop.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Only owner or admin can delete
    if (userRole !== UserRole.ADMIN && workshop.ownerId !== userId) {
      throw new ForbiddenError('You can only delete your own workshop');
    }

    // Soft delete
    await prisma.workshop.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Workshop deleted successfully' };
  }

  // Service Catalog Management
  async createService(workshopId: string, data: CreateServiceInput) {
    const workshop = await prisma.workshop.findFirst({
      where: {
        id: workshopId,
        deletedAt: null,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    const service = await prisma.serviceCatalog.create({
      data: {
        ...data,
        workshopId,
      },
    });

    return service;
  }

  async getServices(workshopId: string) {
    const services = await prisma.serviceCatalog.findMany({
      where: {
        workshopId,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return services;
  }

  async updateService(id: string, data: UpdateServiceInput) {
    const service = await prisma.serviceCatalog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    const updated = await prisma.serviceCatalog.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteService(id: string) {
    const service = await prisma.serviceCatalog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    await prisma.serviceCatalog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Service deleted successfully' };
  }

  // Mechanic Management
  async createMechanic(workshopId: string, data: CreateMechanicInput) {
    // Check if user exists and is WORKSHOP role
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== UserRole.WORKSHOP) {
      throw new ForbiddenError('User must have WORKSHOP role');
    }

    // Check if already a mechanic
    const existing = await prisma.mechanic.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      throw new ConflictError('User is already a mechanic');
    }

    const mechanic = await prisma.mechanic.create({
      data: {
        ...data,
        workshopId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return mechanic;
  }

  async getMechanics(workshopId: string) {
    const mechanics = await prisma.mechanic.findMany({
      where: {
        workshopId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return mechanics;
  }

  async updateMechanic(id: string, data: UpdateMechanicInput) {
    const mechanic = await prisma.mechanic.findUnique({
      where: { id },
    });

    if (!mechanic) {
      throw new NotFoundError('Mechanic not found');
    }

    const updated = await prisma.mechanic.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteMechanic(id: string) {
    const mechanic = await prisma.mechanic.findUnique({
      where: { id },
    });

    if (!mechanic) {
      throw new NotFoundError('Mechanic not found');
    }

    await prisma.mechanic.delete({
      where: { id },
    });

    return { message: 'Mechanic removed successfully' };
  }
}
