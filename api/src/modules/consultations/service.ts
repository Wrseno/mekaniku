import { prisma } from '@/db/prisma';
import { NotFoundError, ForbiddenError } from '@/utils/response';
import { CreateConsultationInput } from './schemas';
import { ConsultationStatus, UserRole } from '@prisma/client';
import { ChatService } from '@/modules/chat/service';

export class ConsultationService {
  private chatService = new ChatService();

  async createConsultation(customerId: string, data: CreateConsultationInput) {
    // Verify workshop exists
    const workshop = await prisma.workshop.findFirst({
      where: {
        id: data.workshopId,
        deletedAt: null,
      },
      include: {
        owner: true,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Create chat for this consultation
    const chatId = await this.chatService.createChat({
      workshopId: data.workshopId,
      participants: [customerId, workshop.ownerId],
      consultationId: undefined, // Will be updated after consultation is created
    });

    // Create consultation
    const consultation = await prisma.consultation.create({
      data: {
        customerId,
        workshopId: data.workshopId,
        message: data.message,
        chatId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workshop: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    // Send system message
    await this.chatService.sendSystemMessage(chatId, 'Consultation started');

    // Send initial customer message
    await this.chatService.sendSystemMessage(chatId, `Customer: ${data.message}`);

    // Create notification for workshop owner
    await prisma.notification.create({
      data: {
        toUserId: workshop.ownerId,
        type: 'BOOKING_CREATED', // Reusing for consultation
        payload: {
          consultationId: consultation.id,
          customerId,
          message: data.message,
        },
      },
    });

    return consultation;
  }

  async getConsultations(userId: string, userRole: UserRole, page: number, limit: number) {
    const where: any = {};

    if (userRole === UserRole.CUSTOMER) {
      where.customerId = userId;
    } else if (userRole === UserRole.WORKSHOP) {
      // Get workshop ID for this user
      const mechanic = await prisma.mechanic.findUnique({
        where: { userId },
        select: { workshopId: true },
      });

      const ownedWorkshop = await prisma.workshop.findFirst({
        where: { ownerId: userId },
        select: { id: true },
      });

      const workshopId = mechanic?.workshopId || ownedWorkshop?.id;
      if (workshopId) {
        where.workshopId = workshopId;
      }
    }
    // ADMIN sees all

    const skip = (page - 1) * limit;

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          workshop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.consultation.count({ where }),
    ]);

    return {
      data: consultations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  async getConsultationById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        workshop: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return consultation;
  }

  async closeConsultation(id: string, userId: string, userRole: UserRole) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        workshop: true,
      },
    });

    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    // Check access
    if (
      userRole !== UserRole.ADMIN &&
      consultation.customerId !== userId &&
      consultation.workshop.ownerId !== userId
    ) {
      throw new ForbiddenError('You cannot close this consultation');
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        status: ConsultationStatus.CLOSED,
      },
    });

    // Send system message
    if (consultation.chatId) {
      await this.chatService.sendSystemMessage(consultation.chatId, 'Consultation closed');
    }

    return updated;
  }
}
