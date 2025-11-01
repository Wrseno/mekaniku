import { prisma } from '@/db/prisma';
import { NotFoundError, ForbiddenError, ValidationError } from '@/utils/response';
import { CreateBookingInput } from './schemas';
import { BookingStatus, UserRole, PaymentStatus } from '@prisma/client';
import { ChatService } from '@/modules/chat/service';
import { buildPaginationResult, calculatePagination } from '@/utils/pagination';

export class BookingService {
  private chatService = new ChatService();

  async createBooking(customerId: string, data: CreateBookingInput) {
    // Verify all referenced entities exist
    const [workshop, vehicle, service] = await Promise.all([
      prisma.workshop.findFirst({ where: { id: data.workshopId, deletedAt: null } }),
      prisma.vehicle.findFirst({ where: { id: data.vehicleId, customerId } }),
      prisma.serviceCatalog.findFirst({ where: { id: data.serviceId, deletedAt: null } }),
    ]);

    if (!workshop) throw new NotFoundError('Workshop not found');
    if (!vehicle) throw new NotFoundError('Vehicle not found or not owned by you');
    if (!service) throw new NotFoundError('Service not found');

    // Get chatId from consultation if provided
    let chatId: string | undefined;
    if (data.consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: { id: data.consultationId },
      });
      if (consultation) {
        chatId = consultation.chatId || undefined;
      }
    }

    // Create new chat if not from consultation
    if (!chatId) {
      chatId = await this.chatService.createChat({
        workshopId: data.workshopId,
        participants: [customerId, workshop.ownerId],
        consultationId: data.consultationId || undefined,
      });
    }

    // Create booking
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          customerId,
          workshopId: data.workshopId,
          vehicleId: data.vehicleId,
          serviceId: data.serviceId,
          consultationId: data.consultationId,
          scheduledAt: new Date(data.scheduledAt),
          notes: data.notes,
          chatId,
          status: BookingStatus.PENDING,
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          workshop: { select: { id: true, name: true, address: true } },
          vehicle: true,
          service: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: customerId,
          entityType: 'Booking',
          entityId: newBooking.id,
          action: 'CREATE',
          toStatus: BookingStatus.PENDING,
          meta: { workshopId: data.workshopId, serviceId: data.serviceId },
        },
      });

      // Create notification for workshop
      await tx.notification.create({
        data: {
          toUserId: workshop.ownerId,
          type: 'BOOKING_CREATED',
          payload: {
            bookingId: newBooking.id,
            customerId,
            customerName: newBooking.customer.name,
            scheduledAt: data.scheduledAt,
          },
        },
      });

      return newBooking;
    });

    // Send system message to chat
    if (chatId) {
      await this.chatService.sendSystemMessage(
        chatId,
        `Booking created for ${service.name} on ${new Date(data.scheduledAt).toLocaleString()}`
      );
    }

    return booking;
  }

  async getBookings(userId: string, userRole: UserRole, filters: any, page: number, limit: number) {
    const { skip, take } = calculatePagination(page, limit);

    const where: any = { deletedAt: null };

    // Role-based filtering
    if (userRole === UserRole.CUSTOMER) {
      where.customerId = userId;
    } else if (userRole === UserRole.WORKSHOP) {
      const mechanic = await prisma.mechanic.findUnique({ where: { userId } });
      const ownedWorkshop = await prisma.workshop.findFirst({ where: { ownerId: userId } });
      const workshopId = mechanic?.workshopId || ownedWorkshop?.id;
      if (workshopId) {
        where.workshopId = workshopId;
      }
    }

    // Additional filters
    if (filters.status) where.status = filters.status;
    if (filters.workshopId) where.workshopId = filters.workshopId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          workshop: { select: { id: true, name: true } },
          vehicle: true,
          service: true,
          payment: true,
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return buildPaginationResult(bookings, total, page, limit);
  }

  async getBookingById(id: string) {
    const booking = await prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        workshop: { select: { id: true, name: true, address: true, city: true } },
        vehicle: true,
        service: true,
        inspection: true,
        workOrder: true,
        payment: true,
        review: true,
        report: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');
    return booking;
  }

  async confirmBooking(id: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(id, userId, userRole, BookingStatus.CONFIRMED);
  }

  async cancelBooking(id: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(id, userId, userRole, BookingStatus.CANCELLED);
  }

  async startBooking(id: string, userId: string, userRole: UserRole) {
    return this.updateBookingStatus(id, userId, userRole, BookingStatus.IN_PROGRESS);
  }

  async completeBooking(id: string, userId: string, userRole: UserRole) {
    const booking = await this.getBookingById(id);

    // Verify payment is completed
    if (!booking.payment || booking.payment.status !== PaymentStatus.PAID) {
      throw new ValidationError('Payment must be completed before completing booking');
    }

    return this.updateBookingStatus(id, userId, userRole, BookingStatus.COMPLETED);
  }

  private async updateBookingStatus(
    id: string,
    userId: string,
    userRole: UserRole,
    newStatus: BookingStatus
  ) {
    const booking = await prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: { workshop: true },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    // Check permissions
    if (
      userRole !== UserRole.ADMIN &&
      booking.customerId !== userId &&
      booking.workshop.ownerId !== userId
    ) {
      throw new ForbiddenError('You do not have permission to update this booking');
    }

    // Validate status transition
    this.validateStatusTransition(booking.status, newStatus);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: { select: { id: true, name: true } },
          workshop: { select: { id: true, name: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          entityType: 'Booking',
          entityId: id,
          action: 'STATUS_UPDATE',
          fromStatus: booking.status,
          toStatus: newStatus,
        },
      });

      // Create notification
      const notifyUserId = booking.customerId === userId ? booking.workshop.ownerId : booking.customerId;
      await tx.notification.create({
        data: {
          toUserId: notifyUserId,
          type: 'STATUS_CHANGED',
          payload: {
            bookingId: id,
            fromStatus: booking.status,
            toStatus: newStatus,
          },
        },
      });

      return updatedBooking;
    });

    // Send system message
    if (booking.chatId) {
      await this.chatService.sendSystemMessage(
        booking.chatId,
        `Booking status changed to ${newStatus}`
      );
    }

    return updated;
  }

  private validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus) {
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.NO_SHOW]: [],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
