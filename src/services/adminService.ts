const API_BASE_URL = 'http://localhost:49971/api';

export interface DashboardStats {
  pendingRequests: number;
  approvedToday: number;
  activeBookings: number;
  completionRate: number;
}

export interface TodaysMeeting {
  id: number;
  roomName: string;
  organizer: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending';
}

export interface RoomUtilization {
  roomName: string;
  percentage: number;
  color: string;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const bookingsResponse = await fetch(`${API_BASE_URL}/Booking/GetBookings`);
      
      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookings = await bookingsResponse.json();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate pending requests (bookings without approval or in pending state)
      const pendingRequests = bookings.filter((b: any) => 
        b.status === 'Pending' || !b.status
      ).length;

      // Calculate approved today
      const approvedToday = bookings.filter((b: any) => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime() && 
               (b.status === 'Confirmed' || b.status === 'Approved');
      }).length;

      // Calculate active bookings (today's ongoing meetings)
      const now = new Date();
      const activeBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        if (bookingDate.getTime() !== today.getTime()) {
          return false;
        }

        // Parse time strings (assuming format like "09:00" or "9:00 AM")
        const startTimeParts = b.startTime.match(/(\d+):(\d+)/);
        const endTimeParts = b.endTime.match(/(\d+):(\d+)/);
        
        if (!startTimeParts || !endTimeParts) return false;

        const startHour = parseInt(startTimeParts[1]);
        const startMinute = parseInt(startTimeParts[2]);
        const endHour = parseInt(endTimeParts[1]);
        const endMinute = parseInt(endTimeParts[2]);

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        return currentTimeInMinutes >= startTimeInMinutes && 
               currentTimeInMinutes <= endTimeInMinutes;
      }).length;

      // Calculate completion rate (percentage of completed bookings)
      const pastBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.date);
        return bookingDate < today;
      });
      
      const completedBookings = pastBookings.filter((b: any) => 
        b.status === 'Completed' || b.status === 'Confirmed'
      );
      
      const completionRate = pastBookings.length > 0 
        ? Math.round((completedBookings.length / pastBookings.length) * 100)
        : 100;

      return {
        pendingRequests,
        approvedToday,
        activeBookings,
        completionRate
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        pendingRequests: 0,
        approvedToday: 0,
        activeBookings: 0,
        completionRate: 0
      };
    }
  },

  /**
   * Get today's meetings
   */
  async getTodaysMeetings(): Promise<TodaysMeeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Booking/GetBookings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookings = await response.json();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter for today's bookings and map to TodaysMeeting format
      const todaysMeetings = bookings
        .filter((b: any) => {
          const bookingDate = new Date(b.date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        })
        .map((b: any) => ({
          id: b.id,
          roomName: b.roomName,
          organizer: b.organizer,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status?.toLowerCase() === 'confirmed' ? 'confirmed' : 'pending'
        }))
        .sort((a: any, b: any) => {
          // Sort by start time
          const aTime = a.startTime.match(/(\d+):(\d+)/);
          const bTime = b.startTime.match(/(\d+):(\d+)/);
          
          if (!aTime || !bTime) return 0;
          
          const aMinutes = parseInt(aTime[1]) * 60 + parseInt(aTime[2]);
          const bMinutes = parseInt(bTime[1]) * 60 + parseInt(bTime[2]);
          
          return aMinutes - bMinutes;
        });

      return todaysMeetings;
    } catch (error) {
      console.error('Error fetching today\'s meetings:', error);
      return [];
    }
  },

  /**
   * Get room utilization statistics
   */
  async getRoomUtilization(): Promise<RoomUtilization[]> {
    try {
      // Fetch both rooms and bookings
      const [roomsResponse, bookingsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/Room/GetRooms`),
        fetch(`${API_BASE_URL}/Booking/GetBookings`)
      ]);

      if (!roomsResponse.ok || !bookingsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const rooms = await roomsResponse.json();
      const bookings = await bookingsResponse.json();

      // Calculate utilization for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.date);
        return bookingDate >= thirtyDaysAgo;
      });

      // Define colors for different rooms
      const colors = ['#64442F', '#9D7E5E', '#B08968', '#DDB892', '#E6CCB2'];

      // Calculate utilization per room
      const roomUtilization = rooms.map((room: any, index: number) => {
        const roomBookings = recentBookings.filter((b: any) => 
          b.roomId === room.id || b.roomName === room.roomName
        );

        // Calculate total booked hours
        let totalBookedMinutes = 0;
        roomBookings.forEach((b: any) => {
          const startTimeParts = b.startTime.match(/(\d+):(\d+)/);
          const endTimeParts = b.endTime.match(/(\d+):(\d+)/);
          
          if (startTimeParts && endTimeParts) {
            const startMinutes = parseInt(startTimeParts[1]) * 60 + parseInt(startTimeParts[2]);
            const endMinutes = parseInt(endTimeParts[1]) * 60 + parseInt(endTimeParts[2]);
            totalBookedMinutes += (endMinutes - startMinutes);
          }
        });

        // Assume working hours are 8 AM to 6 PM (10 hours) for 30 days
        const totalAvailableMinutes = 10 * 60 * 30; // 10 hours * 60 minutes * 30 days
        const utilizationPercentage = Math.round((totalBookedMinutes / totalAvailableMinutes) * 100);

        return {
          roomName: room.roomName,
          percentage: Math.min(utilizationPercentage, 100), // Cap at 100%
          color: colors[index % colors.length]
        };
      });

      return roomUtilization;
    } catch (error) {
      console.error('Error fetching room utilization:', error);
      return [];
    }
  }
};
