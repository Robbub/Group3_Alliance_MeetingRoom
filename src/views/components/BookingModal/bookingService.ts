// Validation endpoints use the new API
const VALIDATION_API_BASE_URL = 'http://localhost:64509/api/Booking';

export interface BookingViewModel {
  RoomId: number;
  RoomName: string;
  Floor: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  Purpose?: string;
  Organizer?: string;
  Recurring: boolean;
  Frequency?: string;
  RecurringEndDate?: string;
  DaysOfWeek?: string[];
  Image?: string;
  Participants?: string[];
}

export interface ApiResult<T> {
  response: T | null;
  status: number;
  message: string;
  name: string | null;
  data: T | null;
}

export interface ValidationErrors {
  [key: string]: string[];
}

/**
 * Validate booking fields in real-time
 */
export const validateBookingFields = async (
  booking: Partial<BookingViewModel>
): Promise<ValidationErrors> => {
  try {
    const response = await fetch(`${VALIDATION_API_BASE_URL}/ValidateBookingFields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      // If server is not available, return empty errors (fail silently for validation)
      console.warn('Validation endpoint not available:', response.status);
      return {};
    }

    const result: ApiResult<ValidationErrors> = await response.json();
    
    if (result.status === 0) {
      return {};
    }
    
    return result.response || {};
  } catch (error) {
    // Network errors (CORS, server down, etc.) - fail silently for validation
    // This allows the form to still work even if validation server is unavailable
    console.warn('Validation endpoint unavailable, continuing without real-time validation:', error);
    return {};
  }
};

/**
 * Validate full booking (ModelState + custom validation + room availability)
 */
export const validateBooking = async (
  booking: BookingViewModel
): Promise<{ isValid: boolean; errors: ValidationErrors }> => {
  try {
    const response = await fetch(`${VALIDATION_API_BASE_URL}/ValidateBooking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      // If validation server is unavailable, allow submission (will be validated by MVC endpoint)
      console.warn('Validation endpoint not available, skipping validation:', response.status);
      return { isValid: true, errors: {} };
    }

    const result: ApiResult<ValidationErrors> = await response.json();
    
    if (result.status === 0) {
      return { isValid: true, errors: {} };
    }
    
    return { isValid: false, errors: result.response || {} };
  } catch (error) {
    // If validation server is down, allow submission - MVC endpoint will validate
    console.warn('Validation endpoint unavailable, allowing submission (will be validated by server):', error);
    return { isValid: true, errors: {} };
  }
};

/**
 * Check room availability
 */
export const checkAvailability = async (
  roomId: number,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean | null> => {
  try {
    const params = new URLSearchParams({
      roomId: roomId.toString(),
      date,
      startTime,
      endTime,
    });
    
    const response = await fetch(`${VALIDATION_API_BASE_URL}/CheckAvailability?${params}`);
    
    if (!response.ok) {
      // If availability check fails, return null to indicate unknown status
      console.warn('Availability check endpoint not available:', response.status);
      return null; // Return null to indicate unknown
    }
    
    const result: ApiResult<boolean> = await response.json();
    
    if (result.status === 0 && result.data !== undefined) {
      return result.data;
    }
    
    return false;
  } catch (error) {
    // Network error - return null to indicate we couldn't check
    console.warn('Availability check unavailable:', error);
    return null; // Return null to indicate unknown status
  }
};


