import bcrypt from 'bcryptjs';
import { prisma } from './config/prisma';
import { ENV } from './config/env';

async function main() {
  if (ENV.NODE_ENV === 'production') {
    throw new Error('Development demo seed data cannot be loaded in production.');
  }

  console.log('🌱 Starting SchoolMate database seed for Neon PostgreSQL...');

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Drivers & Vehicles
  console.log('Creating Drivers & Vehicles...');

  // Driver 1: Nimal Fernando
  const driverUser1 = await prisma.user.create({
    data: {
      fullName: 'Nimal Fernando',
      phoneNumber: '0771234567',
      email: 'nimal.driver@schoolmate.lk',
      password: defaultPassword,
      role: 'DRIVER',
      driverProfile: {
        create: {
          licenseNumber: 'B-8923412',
          isVerified: true,
          vehicles: {
            create: {
              vehicleNumber: 'WP NB-4821',
              model: 'Toyota Hiace KDH (Super GL)',
              vehicleType: 'VAN',
              totalSeats: 14,
              availableSeats: 3,
              hasAC: true,
              routes: {
                create: {
                  title: 'Maharagama to Town Hall & Colombo 07 Schools',
                  startTown: 'Maharagama',
                  endTown: 'Colombo 07',
                  schoolsCovered: ['Ananda College', 'Nalanda College', 'D.S. Senanayake', 'Musaeus College'],
                  morningStartTime: '06:15 AM',
                  afternoonReturnTime: '02:00 PM',
                  minMonthlyFee: 8500,
                  maxMonthlyFee: 10500,
                },
              },
            },
          },
        },
      },
    },
    include: {
      driverProfile: {
        include: { vehicles: true },
      },
    },
  });

  const vehicle1 = driverUser1.driverProfile!.vehicles[0];

  // Driver 2: Sunil Weerasinghe
  await prisma.user.create({
    data: {
      fullName: 'Sunil Weerasinghe',
      phoneNumber: '0719876543',
      email: 'sunil.bus@schoolmate.lk',
      password: defaultPassword,
      role: 'DRIVER',
      driverProfile: {
        create: {
          licenseNumber: 'B-7712499',
          isVerified: true,
          vehicles: {
            create: {
              vehicleNumber: 'WP ND-9102',
              model: 'Toyota Coaster AC Bus',
              vehicleType: 'BUS',
              totalSeats: 26,
              availableSeats: 5,
              hasAC: true,
              routes: {
                create: {
                  title: 'Nugegoda / Kotte to Bambalapitiya & Havelock',
                  startTown: 'Nugegoda',
                  endTown: 'Bambalapitiya',
                  schoolsCovered: ['Royal College', 'Visakha Vidyalaya', 'St. Peters College'],
                  morningStartTime: '06:30 AM',
                  afternoonReturnTime: '02:15 PM',
                  minMonthlyFee: 9000,
                  maxMonthlyFee: 11500,
                },
              },
            },
          },
        },
      },
    },
  });

  // Driver 3: Bandara Silva
  await prisma.user.create({
    data: {
      fullName: 'Bandara Silva',
      phoneNumber: '0765558899',
      email: 'bandara.van@schoolmate.lk',
      password: defaultPassword,
      role: 'DRIVER',
      driverProfile: {
        create: {
          licenseNumber: 'B-6554311',
          isVerified: true,
          vehicles: {
            create: {
              vehicleNumber: 'WP NC-2034',
              model: 'Nissan Caravan High Roof',
              vehicleType: 'VAN',
              totalSeats: 12,
              availableSeats: 0,
              hasAC: false,
              routes: {
                create: {
                  title: 'Kottawa / Pannipitiya to Maradana & Colombo 10',
                  startTown: 'Kottawa',
                  endTown: 'Colombo 10',
                  schoolsCovered: ['Ananda College', 'Zahira College', 'Wesley College'],
                  morningStartTime: '06:00 AM',
                  afternoonReturnTime: '01:45 PM',
                  minMonthlyFee: 7500,
                  maxMonthlyFee: 9000,
                },
              },
            },
          },
        },
      },
    },
  });

  // 2. Create Parent & Children
  console.log('Creating Parent & Children...');
  const parent = await prisma.user.create({
    data: {
      fullName: 'Saman Perera',
      phoneNumber: '0774456677',
      email: 'saman.parent@gmail.com',
      password: defaultPassword,
      role: 'PARENT',
      children: {
        create: [
          {
            fullName: 'Kasun Perera',
            schoolName: 'Ananda College',
            grade: 'Grade 5-B',
            pickupAddress: 'No. 45, Temple Road, Maharagama',
            pickupLat: 6.8485,
            pickupLng: 79.9268,
          },
          {
            fullName: 'Senuri Perera',
            schoolName: 'Musaeus College',
            grade: 'Grade 2-A',
            pickupAddress: 'No. 45, Temple Road, Maharagama',
            pickupLat: 6.8485,
            pickupLng: 79.9268,
          },
        ],
      },
    },
    include: {
      children: true,
    },
  });

  const kasun = parent.children.find((c: any) => c.fullName.includes('Kasun'))!;
  const senuri = parent.children.find((c: any) => c.fullName.includes('Senuri'))!;

  // 3. Create Accepted Enrollments
  console.log('Enrolling children in vehicle WP NB-4821...');
  await prisma.enrollment.create({
    data: {
      childId: kasun.id,
      vehicleId: vehicle1.id,
      status: 'ACCEPTED',
      monthlyFee: 9500,
      pickupSequenceIndex: 1,
    },
  });

  await prisma.enrollment.create({
    data: {
      childId: senuri.id,
      vehicleId: vehicle1.id,
      status: 'ACCEPTED',
      monthlyFee: 9500,
      pickupSequenceIndex: 2,
    },
  });

  // 4. Create Today's Trip & Attendances
  console.log("Setting up today's active morning trip...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trip = await prisma.dailyTrip.create({
    data: {
      vehicleId: vehicle1.id,
      tripType: 'MORNING_PICKUP',
      tripDate: today,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      currentLat: 6.845,
      currentLng: 79.924,
      currentHeading: 45,
      currentSpeed: 32,
      attendances: {
        create: [
          {
            childId: kasun.id,
            status: 'COMING',
            boardingStatus: 'PENDING',
          },
          {
            childId: senuri.id,
            status: 'NOT_COMING', // Absent today
            boardingStatus: 'SKIPPED',
            parentNotes: 'Fever today, staying home.',
          },
        ],
      },
    },
  });

  console.log('✅ SchoolMate Seed completed successfully!');
  console.log(`- Driver Login: 0771234567 / password123`);
  console.log(`- Parent Login: 0774456677 / password123`);
  console.log(`- Active Trip ID: ${trip.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
