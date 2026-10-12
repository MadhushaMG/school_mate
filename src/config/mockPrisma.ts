import bcrypt from 'bcryptjs';

const defaultHashedPassword = bcrypt.hashSync('password123', 10);

const today = new Date();
today.setHours(0, 0, 0, 0);

// In-Memory Database Store
export const mockStore = {
  users: [
    {
      id: 'user-driver-1',
      fullName: 'Nimal Fernando',
      phoneNumber: '0771234567',
      email: 'nimal.driver@schoolmate.lk',
      password: defaultHashedPassword,
      role: 'DRIVER',
      homeAddress: 'Colombo 05',
      emergencyContact: '0777000111',
      avatarUrl: null,
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-driver-2',
      fullName: 'Sunil Weerasinghe',
      phoneNumber: '0719876543',
      email: 'sunil.bus@schoolmate.lk',
      password: defaultHashedPassword,
      role: 'DRIVER',
      homeAddress: 'Nugegoda',
      emergencyContact: '0712223344',
      avatarUrl: null,
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-driver-3',
      fullName: 'Bandara Silva',
      phoneNumber: '0765558899',
      email: 'bandara.van@schoolmate.lk',
      password: defaultHashedPassword,
      role: 'DRIVER',
      homeAddress: 'Kottawa',
      emergencyContact: '0761112233',
      avatarUrl: null,
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-parent-1',
      fullName: 'Saman Perera',
      phoneNumber: '0774456677',
      email: 'saman.parent@gmail.com',
      password: defaultHashedPassword,
      role: 'PARENT',
      homeAddress: 'No. 45, Temple Road, Maharagama',
      emergencyContact: '0711122334',
      avatarUrl: null,
      pushToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  driverProfiles: [
    {
      id: 'dp-1',
      userId: 'user-driver-1',
      licenseNumber: 'B-8923412',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dp-2',
      userId: 'user-driver-2',
      licenseNumber: 'B-7712499',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'dp-3',
      userId: 'user-driver-3',
      licenseNumber: 'B-6554311',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  vehicles: [
    {
      id: 'veh-1',
      driverProfileId: 'dp-1',
      vehicleNumber: 'WP NB-4821',
      model: 'Toyota Hiace KDH (Super GL)',
      vehicleType: 'VAN',
      totalSeats: 14,
      availableSeats: 3,
      hasAC: true,
      photoUrls: ['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'veh-2',
      driverProfileId: 'dp-2',
      vehicleNumber: 'WP ND-9102',
      model: 'Toyota Coaster AC Bus',
      vehicleType: 'BUS',
      totalSeats: 26,
      availableSeats: 5,
      hasAC: true,
      photoUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'veh-3',
      driverProfileId: 'dp-3',
      vehicleNumber: 'WP NC-2034',
      model: 'Nissan Caravan High Roof',
      vehicleType: 'VAN',
      totalSeats: 12,
      availableSeats: 0,
      hasAC: false,
      photoUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  routes: [
    {
      id: 'route-1',
      vehicleId: 'veh-1',
      title: 'Maharagama to Town Hall & Colombo 07 Schools',
      startTown: 'Maharagama',
      endTown: 'Colombo 07',
      schoolsCovered: ['Ananda College', 'Nalanda College', 'D.S. Senanayake', 'Musaeus College'],
      morningStartTime: '06:15 AM',
      afternoonReturnTime: '02:00 PM',
      minMonthlyFee: 8500,
      maxMonthlyFee: 10500,
      waypointsJson: JSON.stringify([
        { name: 'Maharagama Town', lat: 6.848, lng: 79.926 },
        { name: 'Nugegoda Junction', lat: 6.871, lng: 79.899 },
        { name: 'Town Hall', lat: 6.915, lng: 79.866 },
      ]),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'route-2',
      vehicleId: 'veh-2',
      title: 'Nugegoda / Kotte to Bambalapitiya & Havelock',
      startTown: 'Nugegoda',
      endTown: 'Bambalapitiya',
      schoolsCovered: ['Royal College', 'Visakha Vidyalaya', 'St. Peters College'],
      morningStartTime: '06:30 AM',
      afternoonReturnTime: '02:15 PM',
      minMonthlyFee: 9000,
      maxMonthlyFee: 11500,
      waypointsJson: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'route-3',
      vehicleId: 'veh-3',
      title: 'Kottawa / Pannipitiya to Maradana & Colombo 10',
      startTown: 'Kottawa',
      endTown: 'Colombo 10',
      schoolsCovered: ['Ananda College', 'Zahira College', 'Wesley College'],
      morningStartTime: '06:00 AM',
      afternoonReturnTime: '01:45 PM',
      minMonthlyFee: 7500,
      maxMonthlyFee: 9000,
      waypointsJson: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  children: [
    {
      id: 'child-1',
      parentId: 'user-parent-1',
      fullName: 'Kasun Perera',
      schoolName: 'Ananda College',
      grade: 'Grade 5-B',
      pickupAddress: 'No. 45, Temple Road, Maharagama',
      pickupLat: 6.8485,
      pickupLng: 79.9268,
      dropAddress: null,
      dropLat: null,
      dropLng: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'child-2',
      parentId: 'user-parent-1',
      fullName: 'Senuri Perera',
      schoolName: 'Musaeus College',
      grade: 'Grade 2-A',
      pickupAddress: 'No. 45, Temple Road, Maharagama',
      pickupLat: 6.8485,
      pickupLng: 79.9268,
      dropAddress: null,
      dropLat: null,
      dropLng: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  enrollments: [
    {
      id: 'enroll-1',
      childId: 'child-1',
      vehicleId: 'veh-1',
      status: 'ACCEPTED',
      monthlyFee: 9500,
      pickupSequenceIndex: 1,
      parentNotes: 'Please pick up near gate A',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'enroll-2',
      childId: 'child-2',
      vehicleId: 'veh-1',
      status: 'ACCEPTED',
      monthlyFee: 9500,
      pickupSequenceIndex: 2,
      parentNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  dailyTrips: [
    {
      id: 'trip-1',
      vehicleId: 'veh-1',
      tripType: 'MORNING_PICKUP',
      tripDate: today,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      completedAt: null,
      currentLat: 6.865,
      currentLng: 79.898,
      currentHeading: 45,
      currentSpeed: 34,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  tripAttendances: [
    {
      id: 'att-1',
      tripId: 'trip-1',
      dailyTripId: 'trip-1',
      childId: 'child-1',
      status: 'COMING',
      boardingStatus: 'PICKED_UP',
      parentNotes: null,
      pickedUpAt: new Date(),
      droppedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'att-2',
      tripId: 'trip-1',
      dailyTripId: 'trip-1',
      childId: 'child-2',
      status: 'NOT_COMING',
      boardingStatus: 'SKIPPED',
      parentNotes: 'Fever today, staying home.',
      pickedUpAt: null,
      droppedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'user-parent-1',
      title: 'Morning Pickup Started',
      message: 'Vehicle WP NB-4821 has started its morning trip.',
      type: 'TRIP_START',
      isRead: false,
      metadataJson: JSON.stringify({ vehicleId: 'veh-1', tripId: 'trip-1' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: 'notif-2',
      userId: 'user-parent-1',
      title: 'Child Boarded Van',
      message: 'Kasun Perera was safely picked up by Nimal Fernando.',
      type: 'BOARDING',
      isRead: false,
      metadataJson: JSON.stringify({ childId: 'child-1' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ],
  passwordResetCodes: [] as any[],
};

// Helper relation expanders
function expandUser(u: any, include?: any) {
  if (!u) return null;
  const res = { ...u };
  if (include?.driverProfile) {
    const dp = mockStore.driverProfiles.find((p) => p.userId === u.id);
    if (dp) {
      const dpCopy: any = { ...dp };
      if (include.driverProfile.include?.vehicles) {
        dpCopy.vehicles = mockStore.vehicles
          .filter((v) => v.driverProfileId === dp.id)
          .map((v) => expandVehicle(v, { routes: true }));
      }
      res.driverProfile = dpCopy;
    } else {
      res.driverProfile = null;
    }
  }
  if (include?.children) {
    res.children = mockStore.children.filter((c) => c.parentId === u.id);
  }
  return res;
}

function expandVehicle(v: any, include?: any) {
  if (!v) return null;
  const res: any = { ...v };
  const dp = mockStore.driverProfiles.find((p) => p.id === v.driverProfileId);
  if (dp) {
    const dpCopy: any = { ...dp };
    dpCopy.user = mockStore.users.find((u) => u.id === dp.userId);
    res.driverProfile = dpCopy;
  }
  if (include?.routes) {
    res.routes = mockStore.routes.filter((r) => r.vehicleId === v.id);
  }
  if (include?.enrollments) {
    res.enrollments = mockStore.enrollments
      .filter((e) => e.vehicleId === v.id)
      .map((e) => {
        const eCopy: any = { ...e };
        if (include.enrollments.include?.child) {
          const ch = mockStore.children.find((c) => c.id === e.childId);
          if (ch) {
            const chCopy: any = { ...ch };
            if (include.enrollments.include.child.include?.parent) {
              chCopy.parent = mockStore.users.find((u) => u.id === ch.parentId);
            }
            eCopy.child = chCopy;
          }
        }
        return eCopy;
      });
  }
  return res;
}

function expandChild(c: any, include?: any) {
  if (!c) return null;
  const res: any = { ...c };
  if (include?.enrollments) {
    let enr = mockStore.enrollments.filter((e) => e.childId === c.id);
    if (include.enrollments.where?.status) {
      enr = enr.filter((e) => e.status === include.enrollments.where.status);
    }
    const vehicleQuery = include.enrollments.include?.vehicle || include.enrollments.select?.vehicle;
    res.enrollments = enr.map((e) => {
      const eCopy: any = { ...e };
      if (vehicleQuery) {
        eCopy.vehicle = expandVehicle(
          mockStore.vehicles.find((v) => v.id === e.vehicleId),
          typeof vehicleQuery === 'object' ? vehicleQuery : undefined
        );
      }
      return eCopy;
    });
  }
  return res;
}

function expandDailyTrip(t: any, include?: any) {
  if (!t) return null;
  const res: any = { ...t };
  if (include?.vehicle) {
    res.vehicle = expandVehicle(
      mockStore.vehicles.find((v) => v.id === t.vehicleId),
      include.vehicle.include
    );
  }
  if (include?.attendances) {
    res.attendances = mockStore.tripAttendances
      .filter((a) => a.dailyTripId === t.id)
      .map((a) => {
        const aCopy: any = { ...a };
        if (include.attendances.include?.child) {
          const ch = mockStore.children.find((c) => c.id === a.childId);
          if (ch) {
            const chCopy: any = { ...ch };
            if (include.attendances.include.child.include?.parent) {
              chCopy.parent = mockStore.users.find((u) => u.id === ch.parentId);
            }
            aCopy.child = chCopy;
          }
        }
        return aCopy;
      });
  }
  return res;
}

export const mockPrisma = {
  user: {
    findFirst: async (args?: any) => {
      let matches = mockStore.users;
      if (args?.where) {
        if (args.where.OR && Array.isArray(args.where.OR)) {
          matches = matches.filter((u) =>
            args.where.OR.some((cond: any) => {
              if (cond.phoneNumber?.in) {
                return cond.phoneNumber.in.includes(u.phoneNumber);
              }
              if (cond.phoneNumber) return u.phoneNumber === cond.phoneNumber;
              if (cond.email) return u.email?.toLowerCase() === cond.email.toLowerCase();
              return false;
            })
          );
        }
      }
      return matches[0] ? expandUser(matches[0], args?.include) : null;
    },
    findUnique: async (args: any) => {
      const u = mockStore.users.find(
        (user) =>
          user.id === args?.where?.id ||
          user.phoneNumber === args?.where?.phoneNumber ||
          (user.email && user.email.toLowerCase() === args?.where?.email?.toLowerCase())
      );
      return u ? expandUser(u, args?.include) : null;
    },
    create: async (args: any) => {
      const id = `user-${Date.now()}`;
      const newUser = {
        id,
        fullName: args.data.fullName,
        phoneNumber: args.data.phoneNumber,
        email: args.data.email || null,
        password: args.data.password,
        role: args.data.role || 'PARENT',
        homeAddress: args.data.homeAddress || null,
        emergencyContact: args.data.emergencyContact || null,
        avatarUrl: null,
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.users.push(newUser);
      if (newUser.role === 'DRIVER') {
        const dpId = `dp-${Date.now()}`;
        mockStore.driverProfiles.push({
          id: dpId,
          userId: id,
          licenseNumber: args.data.driverProfile?.create?.licenseNumber || null,
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return expandUser(newUser, args?.include);
    },
    update: async (args: any) => {
      const index = mockStore.users.findIndex((u) => u.id === args.where.id);
      if (index === -1) throw new Error('User not found');
      mockStore.users[index] = {
        ...mockStore.users[index],
        ...args.data,
        updatedAt: new Date(),
      };
      return expandUser(mockStore.users[index], args?.include);
    },
  },

  driverProfile: {
    findUnique: async (args: any) => {
      const dp = mockStore.driverProfiles.find(
        (p) => p.userId === args?.where?.userId || p.id === args?.where?.id
      );
      if (!dp) return null;
      const res: any = { ...dp };
      if (args?.include?.vehicles) {
        res.vehicles = mockStore.vehicles
          .filter((v) => v.driverProfileId === dp.id)
          .map((v) => expandVehicle(v, { routes: true }));
      }
      return res;
    },
    create: async (args: any) => {
      const newDp = {
        id: `dp-${Date.now()}`,
        userId: args.data.userId,
        licenseNumber: args.data.licenseNumber || null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.driverProfiles.push(newDp);
      return newDp;
    },
  },

  vehicle: {
    findMany: async (args?: any) => {
      let list = mockStore.vehicles;
      if (args?.where?.driverProfileId) {
        list = list.filter((v) => v.driverProfileId === args.where.driverProfileId);
      }
      if (args?.where?.availableSeats?.gt !== undefined) {
        list = list.filter((v) => v.availableSeats > args.where.availableSeats.gt);
      }
      if (args?.where?.routes?.some) {
        const filter = args.where.routes.some;
        list = list.filter((v) => {
          const vRoutes = mockStore.routes.filter((r) => r.vehicleId === v.id);
          return vRoutes.some((r) => {
            if (filter.schoolsCovered) {
              const schoolTarget = filter.schoolsCovered.hasSome?.[0] || filter.schoolsCovered;
              if (schoolTarget) {
                const q = schoolTarget.toLowerCase();
                const matchedSchool = r.schoolsCovered.some((s) => s.toLowerCase().includes(q));
                if (!matchedSchool) return false;
              }
            }
            if (filter.OR && Array.isArray(filter.OR)) {
              const matchesOr = filter.OR.some((clause: any) => {
                if (clause.startTown?.contains) {
                  return r.startTown.toLowerCase().includes(clause.startTown.contains.toLowerCase());
                }
                if (clause.endTown?.contains) {
                  return r.endTown.toLowerCase().includes(clause.endTown.contains.toLowerCase());
                }
                if (clause.title?.contains) {
                  return r.title.toLowerCase().includes(clause.title.contains.toLowerCase());
                }
                return false;
              });
              if (!matchesOr) return false;
            }
            return true;
          });
        });
      }
      return list.map((v) => expandVehicle(v, args?.include));
    },
    findUnique: async (args: any) => {
      const v = mockStore.vehicles.find(
        (item) => item.id === args?.where?.id || item.vehicleNumber === args?.where?.vehicleNumber
      );
      return v ? expandVehicle(v, args?.include) : null;
    },
    findFirst: async (args: any) => {
      let matches = mockStore.vehicles;
      if (args?.where?.id) matches = matches.filter((v) => v.id === args.where.id);
      if (args?.where?.driverProfile?.userId) {
        const dp = mockStore.driverProfiles.find((p) => p.userId === args.where.driverProfile.userId);
        matches = matches.filter((v) => v.driverProfileId === dp?.id);
      }
      return matches[0] ? expandVehicle(matches[0], args?.include) : null;
    },
    create: async (args: any) => {
      const id = `veh-${Date.now()}`;
      const newV = {
        id,
        driverProfileId: args.data.driverProfileId,
        vehicleNumber: args.data.vehicleNumber,
        model: args.data.model,
        vehicleType: args.data.vehicleType || 'VAN',
        totalSeats: args.data.totalSeats,
        availableSeats: args.data.availableSeats ?? args.data.totalSeats,
        hasAC: Boolean(args.data.hasAC),
        photoUrls: args.data.photoUrls || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.vehicles.push(newV);
      if (args.data.routes?.create) {
        const routeData = args.data.routes.create;
        mockStore.routes.push({
          id: `route-${Date.now()}`,
          vehicleId: id,
          title: routeData.title,
          startTown: routeData.startTown,
          endTown: routeData.endTown,
          schoolsCovered: routeData.schoolsCovered || [],
          morningStartTime: routeData.morningStartTime,
          afternoonReturnTime: routeData.afternoonReturnTime,
          minMonthlyFee: routeData.minMonthlyFee,
          maxMonthlyFee: routeData.maxMonthlyFee,
          waypointsJson: routeData.waypointsJson || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return expandVehicle(newV, args?.include);
    },
    update: async (args: any) => {
      const v = mockStore.vehicles.find((item) => item.id === args.where.id);
      if (!v) throw new Error('Vehicle not found');
      Object.assign(v, args.data, { updatedAt: new Date() });
      return expandVehicle(v, args?.include);
    },
    updateMany: async (args: any) => {
      let count = 0;
      mockStore.vehicles.forEach((v) => {
        if (args?.where?.id && v.id === args.where.id) {
          if (args.where.availableSeats?.gt !== undefined && !(v.availableSeats > args.where.availableSeats.gt)) {
            return;
          }
          if (args.data.availableSeats?.decrement) {
            v.availableSeats = Math.max(0, v.availableSeats - args.data.availableSeats.decrement);
          } else if (typeof args.data.availableSeats === 'number') {
            v.availableSeats = args.data.availableSeats;
          }
          count++;
        }
      });
      return { count };
    },
  },

  route: {
    create: async (args: any) => {
      const newRoute = {
        id: `route-${Date.now()}`,
        vehicleId: args.data.vehicleId,
        title: args.data.title,
        startTown: args.data.startTown,
        endTown: args.data.endTown,
        schoolsCovered: args.data.schoolsCovered || [],
        morningStartTime: args.data.morningStartTime,
        afternoonReturnTime: args.data.afternoonReturnTime,
        minMonthlyFee: args.data.minMonthlyFee,
        maxMonthlyFee: args.data.maxMonthlyFee,
        waypointsJson: args.data.waypointsJson || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.routes.push(newRoute);
      return newRoute;
    },
  },

  child: {
    create: async (args: any) => {
      const newChild = {
        id: `child-${Date.now()}`,
        parentId: args.data.parentId,
        fullName: args.data.fullName,
        schoolName: args.data.schoolName,
        grade: args.data.grade,
        pickupAddress: args.data.pickupAddress,
        pickupLat: args.data.pickupLat,
        pickupLng: args.data.pickupLng,
        dropAddress: args.data.dropAddress || null,
        dropLat: args.data.dropLat || null,
        dropLng: args.data.dropLng || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.children.push(newChild);
      return expandChild(newChild, { enrollments: true }) || { ...newChild, enrollments: [] };
    },
    findMany: async (args?: any) => {
      let list = mockStore.children;
      if (args?.where?.parentId) {
        list = list.filter((c) => c.parentId === args.where.parentId);
      }
      return list.map((c) => expandChild(c, args?.include));
    },
    findFirst: async (args: any) => {
      let matches = mockStore.children;
      if (args?.where?.id) matches = matches.filter((c) => c.id === args.where.id);
      if (args?.where?.parentId) matches = matches.filter((c) => c.parentId === args.where.parentId);
      return matches[0] ? expandChild(matches[0], args?.include) : null;
    },
  },

  enrollment: {
    findMany: async (args?: any) => {
      let list = mockStore.enrollments;
      if (args?.where?.vehicle?.driverProfileId) {
        const vehicleIds = mockStore.vehicles
          .filter((v) => v.driverProfileId === args.where.vehicle.driverProfileId)
          .map((v) => v.id);
        list = list.filter((e) => vehicleIds.includes(e.vehicleId));
      }
      if (args?.where?.childId) {
        list = list.filter((e) => e.childId === args.where.childId);
      }
      return list.map((e) => {
        const eCopy: any = { ...e };
        if (args?.include?.child) {
          eCopy.child = mockStore.children.find((c) => c.id === e.childId);
        }
        if (args?.include?.vehicle) {
          eCopy.vehicle = expandVehicle(
            mockStore.vehicles.find((v) => v.id === e.vehicleId),
            args.include.vehicle.include
          );
        }
        return eCopy;
      });
    },
    findUnique: async (args: any) => {
      const e = mockStore.enrollments.find((item) => item.id === args?.where?.id);
      if (!e) return null;
      const eCopy: any = { ...e };
      if (args?.include?.child) {
        const ch = mockStore.children.find((c) => c.id === e.childId);
        if (ch) {
          const chCopy: any = { ...ch };
          if (args.include.child.include?.parent) {
            chCopy.parent = mockStore.users.find((u) => u.id === ch.parentId);
          }
          eCopy.child = chCopy;
        }
      }
      if (args?.include?.vehicle) {
        eCopy.vehicle = expandVehicle(
          mockStore.vehicles.find((v) => v.id === e.vehicleId),
          args.include.vehicle.include
        );
      }
      return eCopy;
    },
    findUniqueOrThrow: async (args: any) => {
      const res = await mockPrisma.enrollment.findUnique(args);
      if (!res) throw new Error('Enrollment not found');
      return res;
    },
    findFirst: async (args: any) => {
      let matches = mockStore.enrollments;
      if (args?.where?.childId) matches = matches.filter((e) => e.childId === args.where.childId);
      if (args?.where?.vehicleId) matches = matches.filter((e) => e.vehicleId === args.where.vehicleId);
      if (args?.where?.status) matches = matches.filter((e) => e.status === args.where.status);
      return matches[0] ? mockPrisma.enrollment.findUnique({ where: { id: matches[0].id }, include: args?.include }) : null;
    },
    create: async (args: any) => {
      const newE = {
        id: `enroll-${Date.now()}`,
        childId: args.data.childId,
        vehicleId: args.data.vehicleId,
        status: args.data.status || 'PENDING',
        monthlyFee: args.data.monthlyFee || 0,
        pickupSequenceIndex: args.data.pickupSequenceIndex || null,
        parentNotes: args.data.parentNotes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.enrollments.push(newE);
      return newE;
    },
    upsert: async (args: any) => {
      const existing = mockStore.enrollments.find((e) => e.id === args?.where?.id);
      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() });
        return existing;
      }
      return mockPrisma.enrollment.create({ data: args.create });
    },
    update: async (args: any) => {
      const item = mockStore.enrollments.find((e) => e.id === args.where.id);
      if (!item) throw new Error('Enrollment not found');
      Object.assign(item, args.data, { updatedAt: new Date() });
      return item;
    },
    updateMany: async (args: any) => {
      let count = 0;
      mockStore.enrollments.forEach((e) => {
        if (args?.where?.id && e.id === args.where.id) {
          Object.assign(e, args.data, { updatedAt: new Date() });
          count++;
        }
      });
      return { count };
    },
  },

  dailyTrip: {
    findMany: async (args?: any) => {
      return mockStore.dailyTrips.map((t) => expandDailyTrip(t, args?.include));
    },
    findUnique: async (args: any) => {
      const t = mockStore.dailyTrips.find((item) => item.id === args?.where?.id);
      return t ? expandDailyTrip(t, args?.include) : null;
    },
    findFirst: async (args: any) => {
      let matches = mockStore.dailyTrips;
      if (args?.where?.id) matches = matches.filter((t) => t.id === args.where.id);
      if (args?.where?.vehicleId) matches = matches.filter((t) => t.vehicleId === args.where.vehicleId);
      if (args?.where?.status) matches = matches.filter((t) => t.status === args.where.status);
      if (args?.where?.tripType) matches = matches.filter((t) => t.tripType === args.where.tripType);
      return matches[0] ? expandDailyTrip(matches[0], args?.include) : null;
    },
    create: async (args: any) => {
      const id = `trip-${Date.now()}`;
      const newTrip = {
        id,
        vehicleId: args.data.vehicleId,
        tripType: args.data.tripType,
        tripDate: args.data.tripDate || new Date(),
        status: args.data.status || 'IN_PROGRESS',
        startedAt: args.data.startedAt || new Date(),
        completedAt: null,
        currentLat: args.data.currentLat || 6.848,
        currentLng: args.data.currentLng || 79.926,
        currentHeading: args.data.currentHeading || 0,
        currentSpeed: args.data.currentSpeed || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.dailyTrips.push(newTrip);

      if (args.data.attendances?.create) {
        for (const att of args.data.attendances.create) {
          mockStore.tripAttendances.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            tripId: id,
            dailyTripId: id,
            childId: att.childId,
            status: att.status || 'COMING',
            boardingStatus: att.boardingStatus || 'PENDING',
            parentNotes: att.parentNotes || null,
            pickedUpAt: null,
            droppedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      return expandDailyTrip(newTrip, args?.include);
    },
    update: async (args: any) => {
      const index = mockStore.dailyTrips.findIndex((t) => t.id === args.where.id);
      if (index === -1) throw new Error('Daily trip not found');
      mockStore.dailyTrips[index] = {
        ...mockStore.dailyTrips[index],
        ...args.data,
        updatedAt: new Date(),
      };
      return expandDailyTrip(mockStore.dailyTrips[index], args?.include);
    },
  },

  tripAttendance: {
    findMany: async (args?: any) => {
      let list = mockStore.tripAttendances;
      const tripId = args?.where?.tripId || args?.where?.dailyTripId;
      if (tripId) {
        list = list.filter((a) => (a as any).tripId === tripId || a.dailyTripId === tripId);
      }
      if (args?.where?.childId) {
        list = list.filter((a) => a.childId === args.where.childId);
      }
      if (args?.where?.status) {
        list = list.filter((a) => a.status === args.where.status);
      }
      if (args?.where?.boardingStatus) {
        list = list.filter((a) => a.boardingStatus === args.where.boardingStatus);
      }
      return list.map((a) => {
        const aCopy: any = { ...a, tripId: (a as any).tripId || a.dailyTripId };
        if (args?.include?.child) {
          const ch = mockStore.children.find((c) => c.id === a.childId);
          if (ch) {
            const chCopy: any = { ...ch };
            if (args.include.child.include?.parent) {
              chCopy.parent = mockStore.users.find((u) => u.id === ch.parentId);
            }
            aCopy.child = chCopy;
          }
        }
        return aCopy;
      });
    },
    findUnique: async (args: any) => {
      const tripId = args?.where?.id || args?.where?.tripId || args?.where?.tripId_childId?.tripId;
      const childId = args?.where?.childId || args?.where?.tripId_childId?.childId;

      const a = mockStore.tripAttendances.find((item) => {
        if (args?.where?.id && item.id === args.where.id) return true;
        if (tripId && childId && ((item as any).tripId === tripId || item.dailyTripId === tripId) && item.childId === childId) {
          return true;
        }
        return false;
      });
      if (!a) return null;
      const aCopy: any = { ...a, tripId: (a as any).tripId || a.dailyTripId };
      if (args?.include?.child) {
        const ch = mockStore.children.find((c) => c.id === a.childId);
        if (ch) {
          const chCopy: any = { ...ch };
          if (args.include.child.include?.parent) {
            chCopy.parent = mockStore.users.find((u) => u.id === ch.parentId);
          }
          aCopy.child = chCopy;
        }
      }
      if (args?.include?.trip) {
        const tr = mockStore.dailyTrips.find((t) => t.id === ((a as any).tripId || a.dailyTripId));
        if (tr) {
          aCopy.trip = expandDailyTrip(tr, args.include.trip.include);
        }
      }
      return aCopy;
    },
    findFirst: async (args: any) => {
      let matches = mockStore.tripAttendances;
      const tripId = args?.where?.tripId || args?.where?.dailyTripId;
      if (tripId) matches = matches.filter((a) => (a as any).tripId === tripId || a.dailyTripId === tripId);
      if (args?.where?.childId) matches = matches.filter((a) => a.childId === args.where.childId);
      return matches[0] ? mockPrisma.tripAttendance.findUnique({ where: { id: matches[0].id }, include: args?.include }) : null;
    },
    create: async (args: any) => {
      const tripId = args.data.tripId || args.data.dailyTripId;
      const newA = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        tripId,
        dailyTripId: tripId,
        childId: args.data.childId,
        status: args.data.status || 'COMING',
        boardingStatus: args.data.boardingStatus || (args.data.status === 'NOT_COMING' ? 'SKIPPED' : 'PENDING'),
        isAutoGeofence: Boolean(args.data.isAutoGeofence),
        parentNotes: args.data.parentNotes || null,
        pickedUpAt: args.data.pickedUpAt || null,
        droppedAt: args.data.droppedAt || null,
        boardedAt: args.data.boardedAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.tripAttendances.push(newA);
      return newA;
    },
    upsert: async (args: any) => {
      const tripId = args?.where?.id || args?.where?.tripId || args?.where?.tripId_childId?.tripId;
      const childId = args?.where?.childId || args?.where?.tripId_childId?.childId;

      const existing = mockStore.tripAttendances.find((a) => {
        if (args?.where?.id && a.id === args.where.id) return true;
        if (tripId && childId && ((a as any).tripId === tripId || a.dailyTripId === tripId) && a.childId === childId) {
          return true;
        }
        return false;
      });

      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() });
        return { ...existing, tripId: (existing as any).tripId || existing.dailyTripId };
      }
      const createData = {
        ...args.create,
        tripId: args.create?.tripId || tripId,
        dailyTripId: args.create?.dailyTripId || args.create?.tripId || tripId,
      };
      return mockPrisma.tripAttendance.create({ data: createData });
    },
    update: async (args: any) => {
      const item = mockStore.tripAttendances.find((a) => a.id === args.where.id);
      if (!item) throw new Error('Attendance record not found');
      Object.assign(item, args.data, { updatedAt: new Date() });
      return { ...item, tripId: (item as any).tripId || item.dailyTripId };
    },
    updateMany: async (args: any) => {
      let count = 0;
      const tripId = args?.where?.tripId || args?.where?.dailyTripId;
      mockStore.tripAttendances.forEach((a) => {
        const matchesId = !args?.where?.id || a.id === args.where.id;
        const matchesTrip = !tripId || (a as any).tripId === tripId || a.dailyTripId === tripId;
        const matchesBoarding = !args?.where?.boardingStatus || a.boardingStatus === args.where.boardingStatus;
        const matchesStatus = !args?.where?.status || a.status === args.where.status;

        if (matchesId && matchesTrip && matchesBoarding && matchesStatus) {
          Object.assign(a, args.data, { updatedAt: new Date() });
          count++;
        }
      });
      return { count };
    },
  },

  notification: {
    findMany: async (args?: any) => {
      let list = mockStore.notifications;
      if (args?.where?.userId) {
        list = list.filter((n) => n.userId === args.where.userId);
      }
      return list;
    },
    findFirst: async (args: any) => {
      const match = mockStore.notifications.find(
        (n) => n.id === args?.where?.id && (!args.where.userId || n.userId === args.where.userId)
      );
      return match || null;
    },
    findFirstOrThrow: async (args: any) => {
      const res = await mockPrisma.notification.findFirst(args);
      if (!res) throw new Error('Notification not found');
      return res;
    },
    create: async (args: any) => {
      const newN = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: args.data.userId,
        title: args.data.title,
        message: args.data.message,
        type: args.data.type || 'INFO',
        isRead: false,
        metadataJson: args.data.metadataJson || null,
        createdAt: new Date(),
      };
      mockStore.notifications.unshift(newN);
      return newN;
    },
    createMany: async (args: any) => {
      if (Array.isArray(args.data)) {
        args.data.forEach((item: any) => {
          mockPrisma.notification.create({ data: item });
        });
      }
      return { count: args.data?.length || 0 };
    },
    updateMany: async (args: any) => {
      let count = 0;
      mockStore.notifications.forEach((n) => {
        if (
          (!args.where.id || n.id === args.where.id) &&
          (!args.where.userId || n.userId === args.where.userId) &&
          (args.where.isRead === undefined || n.isRead === args.where.isRead)
        ) {
          Object.assign(n, args.data);
          count++;
        }
      });
      return { count };
    },
  },

  passwordResetCode: {
    findFirst: async (args: any) => {
      return (
        mockStore.passwordResetCodes.find(
          (c) =>
            (!args.where.code || c.code === args.where.code) &&
            (!args.where.email || c.email === args.where.email)
        ) || null
      );
    },
    findMany: async (args?: any) => mockStore.passwordResetCodes,
    create: async (args: any) => {
      const newCode = { id: `rc-${Date.now()}`, ...args.data, createdAt: new Date() };
      mockStore.passwordResetCodes.push(newCode);
      return newCode;
    },
    deleteMany: async (args: any) => {
      mockStore.passwordResetCodes = mockStore.passwordResetCodes.filter(
        (c) => args.where.userId && c.userId !== args.where.userId
      );
      return { count: 1 };
    },
  },

  $transaction: async (fn: any) => {
    return await fn(mockPrisma);
  },

  $disconnect: async () => {},
};
