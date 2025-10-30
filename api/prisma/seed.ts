import { PrismaClient, UserRole, BookingStatus, WorkStatus, PaymentStatus, ConsultationStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (in development only)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.serviceCatalog.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcryptjs.hashSync('password123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@mekaniku.com',
      passwordHash,
      role: UserRole.ADMIN,
      phone: '+6281234567890',
    },
  });

  console.log('✅ Admin created');

  // Create Workshop Owners
  const workshopOwner1 = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@workshop.com',
      passwordHash,
      role: UserRole.WORKSHOP,
      phone: '+6281234567891',
    },
  });

  const workshopOwner2 = await prisma.user.create({
    data: {
      name: 'Siti Rahayu',
      email: 'siti@workshop.com',
      passwordHash,
      role: UserRole.WORKSHOP,
      phone: '+6281234567892',
    },
  });

  console.log('✅ Workshop owners created');

  // Create Workshops
  const workshop1 = await prisma.workshop.create({
    data: {
      ownerId: workshopOwner1.id,
      name: 'Bengkel Sejahtera Motor',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      openHours: {
        monday: '08:00-17:00',
        tuesday: '08:00-17:00',
        wednesday: '08:00-17:00',
        thursday: '08:00-17:00',
        friday: '08:00-17:00',
        saturday: '08:00-14:00',
        sunday: 'CLOSED',
      },
    },
  });

  const workshop2 = await prisma.workshop.create({
    data: {
      ownerId: workshopOwner2.id,
      name: 'Bengkel Maju Jaya',
      address: 'Jl. Gatot Subroto No. 456',
      city: 'Bandung',
      latitude: -6.9175,
      longitude: 107.6191,
      openHours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '09:00-15:00',
        sunday: 'CLOSED',
      },
    },
  });

  console.log('✅ Workshops created');

  // Create Mechanics
  const mechanicUsers = await Promise.all(
    Array.from({ length: 5 }, async (_, i) => {
      return prisma.user.create({
        data: {
          name: `Mechanic ${i + 1}`,
          email: `mechanic${i + 1}@workshop.com`,
          passwordHash,
          role: UserRole.WORKSHOP,
          phone: `+628123456789${i + 3}`,
        },
      });
    })
  );

  await Promise.all([
    prisma.mechanic.create({
      data: {
        userId: mechanicUsers[0].id,
        workshopId: workshop1.id,
        specialization: ['Engine', 'Transmission'],
        isActive: true,
      },
    }),
    prisma.mechanic.create({
      data: {
        userId: mechanicUsers[1].id,
        workshopId: workshop1.id,
        specialization: ['Brake System', 'Suspension'],
        isActive: true,
      },
    }),
    prisma.mechanic.create({
      data: {
        userId: mechanicUsers[2].id,
        workshopId: workshop2.id,
        specialization: ['Electrical', 'AC System'],
        isActive: true,
      },
    }),
    prisma.mechanic.create({
      data: {
        userId: mechanicUsers[3].id,
        workshopId: workshop2.id,
        specialization: ['Body Repair', 'Painting'],
        isActive: true,
      },
    }),
    prisma.mechanic.create({
      data: {
        userId: mechanicUsers[4].id,
        workshopId: workshop1.id,
        specialization: ['Oil Change', 'General Maintenance'],
        isActive: false,
      },
    }),
  ]);

  console.log('✅ Mechanics created');

  // Create Services
  const services1 = await Promise.all([
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop1.id,
        name: 'Oil Change',
        description: 'Complete engine oil change with filter replacement',
        basePrice: 150000,
        estDurationMin: 30,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop1.id,
        name: 'Brake Pad Replacement',
        description: 'Front and rear brake pad replacement',
        basePrice: 350000,
        estDurationMin: 90,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop1.id,
        name: 'Engine Tune-Up',
        description: 'Complete engine tune-up and inspection',
        basePrice: 500000,
        estDurationMin: 120,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop1.id,
        name: 'AC Service',
        description: 'Air conditioning cleaning and refill',
        basePrice: 200000,
        estDurationMin: 60,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop1.id,
        name: 'Tire Rotation',
        description: 'Tire rotation and balancing',
        basePrice: 100000,
        estDurationMin: 45,
      },
    }),
  ]);

  const services2 = await Promise.all([
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop2.id,
        name: 'General Check-Up',
        description: 'Complete vehicle inspection',
        basePrice: 100000,
        estDurationMin: 45,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop2.id,
        name: 'Transmission Service',
        description: 'Transmission oil change and inspection',
        basePrice: 400000,
        estDurationMin: 120,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        workshopId: workshop2.id,
        name: 'Suspension Repair',
        description: 'Shock absorber replacement',
        basePrice: 600000,
        estDurationMin: 150,
      },
    }),
  ]);

  console.log('✅ Services created');

  // Create Customers
  const customers = await Promise.all(
    Array.from({ length: 30 }, async (_, i) => {
      return prisma.user.create({
        data: {
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          passwordHash,
          role: UserRole.CUSTOMER,
          phone: `+628123456${String(i + 10).padStart(4, '0')}`,
        },
      });
    })
  );

  console.log('✅ Customers created');

  // Create Vehicles
  const vehicles = await Promise.all(
    customers.slice(0, 25).map((customer, i) => {
      const brands = ['Toyota', 'Honda', 'Suzuki', 'Daihatsu', 'Mitsubishi'];
      const models = ['Avanza', 'Jazz', 'Ertiga', 'Xenia', 'Xpander'];
      return prisma.vehicle.create({
        data: {
          customerId: customer.id,
          plateNo: `B ${1000 + i} ABC`,
          brand: brands[i % brands.length],
          model: models[i % models.length],
          year: 2018 + (i % 6),
        },
      });
    })
  );

  console.log('✅ Vehicles created');

  // Create Consultations
  const consultations = await Promise.all([
    prisma.consultation.create({
      data: {
        customerId: customers[0].id,
        workshopId: workshop1.id,
        message: 'My car engine makes strange noise. Can you help?',
        status: ConsultationStatus.OPEN,
        chatId: 'chat_consultation_1',
      },
    }),
    prisma.consultation.create({
      data: {
        customerId: customers[1].id,
        workshopId: workshop2.id,
        message: 'Need to schedule oil change for next week',
        status: ConsultationStatus.CLOSED,
        chatId: 'chat_consultation_2',
      },
    }),
  ]);

  console.log('✅ Consultations created');

  // Create Bookings with different statuses
  const now = new Date();
  const bookings = [];

  // PENDING bookings
  for (let i = 0; i < 5; i++) {
    const booking = await prisma.booking.create({
      data: {
        customerId: customers[i].id,
        workshopId: i % 2 === 0 ? workshop1.id : workshop2.id,
        vehicleId: vehicles[i].id,
        serviceId: i % 2 === 0 ? services1[i % services1.length].id : services2[i % services2.length].id,
        scheduledAt: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        notes: `Booking ${i + 1} - Please check carefully`,
        status: BookingStatus.PENDING,
        chatId: `chat_booking_${i + 1}`,
      },
    });
    bookings.push(booking);
  }

  // CONFIRMED bookings
  for (let i = 5; i < 10; i++) {
    const booking = await prisma.booking.create({
      data: {
        customerId: customers[i].id,
        workshopId: i % 2 === 0 ? workshop1.id : workshop2.id,
        vehicleId: vehicles[i].id,
        serviceId: i % 2 === 0 ? services1[i % services1.length].id : services2[i % services2.length].id,
        scheduledAt: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        status: BookingStatus.CONFIRMED,
        chatId: `chat_booking_${i + 1}`,
      },
    });
    bookings.push(booking);
  }

  // IN_PROGRESS bookings with inspection and work orders
  for (let i = 10; i < 15; i++) {
    const booking = await prisma.booking.create({
      data: {
        customerId: customers[i].id,
        workshopId: i % 2 === 0 ? workshop1.id : workshop2.id,
        vehicleId: vehicles[i].id,
        serviceId: i % 2 === 0 ? services1[i % services1.length].id : services2[i % services2.length].id,
        scheduledAt: new Date(now.getTime() - i * 2 * 60 * 60 * 1000),
        status: BookingStatus.IN_PROGRESS,
        chatId: `chat_booking_${i + 1}`,
      },
    });

    await prisma.inspection.create({
      data: {
        bookingId: booking.id,
        findings: {
          condition: 'Good overall condition',
          issues: ['Minor oil leak', 'Worn brake pads'],
          recommendations: ['Replace brake pads', 'Fix oil seal'],
        },
        photos: [
          'https://example.com/inspection-1.jpg',
          'https://example.com/inspection-2.jpg',
        ],
      },
    });

    await prisma.workOrder.create({
      data: {
        bookingId: booking.id,
        status: WorkStatus.SERVICING,
        tasks: {
          task1: 'Replace brake pads - In Progress',
          task2: 'Fix oil seal - Pending',
          task3: 'General inspection - Completed',
        },
        parts: {
          'Brake Pads': { quantity: 4, price: 200000 },
          'Oil Seal': { quantity: 1, price: 50000 },
        },
        laborHours: 2.5,
        subtotal: 350000,
      },
    });

    bookings.push(booking);
  }

  // COMPLETED bookings with payment, review, and report
  for (let i = 15; i < 25; i++) {
    const booking = await prisma.booking.create({
      data: {
        customerId: customers[i].id,
        workshopId: i % 2 === 0 ? workshop1.id : workshop2.id,
        vehicleId: vehicles[i].id,
        serviceId: i % 2 === 0 ? services1[i % services1.length].id : services2[i % services2.length].id,
        scheduledAt: new Date(now.getTime() - (30 - i) * 24 * 60 * 60 * 1000),
        status: BookingStatus.COMPLETED,
        chatId: `chat_booking_${i + 1}`,
      },
    });

    await prisma.inspection.create({
      data: {
        bookingId: booking.id,
        findings: {
          condition: 'Completed successfully',
          issues: [],
          recommendations: ['Regular maintenance in 3 months'],
        },
        photos: [],
      },
    });

    await prisma.workOrder.create({
      data: {
        bookingId: booking.id,
        status: WorkStatus.DONE,
        tasks: {
          task1: 'Service completed',
        },
        parts: {},
        laborHours: 1.5,
        subtotal: 250000,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: 250000 + Math.floor(Math.random() * 300000),
        method: ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER'][i % 3],
        status: PaymentStatus.PAID,
        paidAt: new Date(now.getTime() - (25 - i) * 24 * 60 * 60 * 1000),
        externalRef: `PAY_${Date.now()}_${i}`,
      },
    });

    await prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: customers[i].id,
        rating: 3 + (i % 3),
        comment: i % 2 === 0 ? 'Great service! Very professional and fast.' : 'Good job, will come back.',
      },
    });

    await prisma.report.create({
      data: {
        bookingId: booking.id,
        summary: `Service completed successfully. Total work time: 1.5 hours. All tasks completed as planned.`,
        totalCost: payment.amount,
        pdfUrl: `https://storage.example.com/reports/${booking.id}.pdf`,
      },
    });

    bookings.push(booking);
  }

  console.log('✅ Bookings created with various statuses');

  // Create sample notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        toUserId: customers[0].id,
        type: 'BOOKING_CREATED',
        payload: {
          bookingId: bookings[0].id,
          message: 'Your booking has been created',
        },
      },
    }),
    prisma.notification.create({
      data: {
        toUserId: workshopOwner1.id,
        type: 'BOOKING_CREATED',
        payload: {
          bookingId: bookings[0].id,
          message: 'New booking received',
        },
      },
    }),
  ]);

  console.log('✅ Notifications created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- 1 Admin`);
  console.log(`- 2 Workshop Owners`);
  console.log(`- 2 Workshops`);
  console.log(`- 5 Mechanics`);
  console.log(`- ${services1.length + services2.length} Services`);
  console.log(`- 30 Customers`);
  console.log(`- 25 Vehicles`);
  console.log(`- 2 Consultations`);
  console.log(`- 25 Bookings (PENDING: 5, CONFIRMED: 5, IN_PROGRESS: 5, COMPLETED: 10)`);
  console.log('\n🔑 Test Credentials:');
  console.log('Admin: admin@mekaniku.com / password123');
  console.log('Workshop 1: budi@workshop.com / password123');
  console.log('Workshop 2: siti@workshop.com / password123');
  console.log('Customer 1: customer1@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
