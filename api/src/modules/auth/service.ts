import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/db/prisma';
import { env } from '@/config/env';
import { ConflictError, UnauthorizedError, NotFoundError } from '@/utils/response';
import { RegisterInput, LoginInput } from './schemas';
import { UserRole } from '@prisma/client';
import { getFirebaseAuth } from '@/lib/firebase';

const SALT_ROUNDS = 10;

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role || UserRole.CUSTOMER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        mechanic: {
          select: {
            workshopId: true,
          },
        },
        ownedWorkshops: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Determine workshopId for WORKSHOP role
    let workshopId: string | undefined;
    if (user.role === UserRole.WORKSHOP) {
      workshopId = user.mechanic?.workshopId || user.ownedWorkshops[0]?.id;
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      workshopId,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workshopId,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_SECRET) as any;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          deletedAt: true,
        },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getFirebaseToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mechanic: {
          select: {
            workshopId: true,
          },
        },
        ownedWorkshops: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    // Determine workshopId
    let workshopId: string | undefined;
    if (user.role === UserRole.WORKSHOP) {
      workshopId = user.mechanic?.workshopId || user.ownedWorkshops[0]?.id;
    }

    // Create custom token with claims
    const firebaseAuth = getFirebaseAuth();
    const customToken = await firebaseAuth.createCustomToken(user.id, {
      role: user.role,
      email: user.email,
      ...(workshopId && { workshopId }),
    });

    return { token: customToken };
  }

  private generateTokens(payload: {
    userId: string;
    email: string;
    role: UserRole;
    workshopId?: string;
  }) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      env.REFRESH_SECRET,
      {
        expiresIn: env.REFRESH_EXPIRES_IN,
      } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}
