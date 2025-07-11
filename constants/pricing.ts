// PAKA-Go Pricing Structure

export interface PricingConfig {
  baseFare: number;
  perKilometer: number;
  minimumCharge: number;
  addOns: {
    fragile: number; // percentage
    insurance: number; // percentage
    afterHours: number; // percentage (optional)
    weekend: number; // percentage (optional)
    waitTime: number; // KES per minute after 5 minutes
  };
  driverCommission: {
    min: number; // percentage
    max: number; // percentage
  };
}

export const PRICING_CONFIG: PricingConfig = {
  baseFare: 80,
  perKilometer: 11,
  minimumCharge: 150,
  addOns: {
    fragile: 20, // 20%
    insurance: 20, // 20%
    afterHours: 10, // 10%
    weekend: 10, // 10%
    waitTime: 5, // KES 5 per minute
  },
  driverCommission: {
    min: 15,
    max: 20,
  },
};

export interface PriceCalculationOptions {
  distance: number; // in kilometers
  isFragile?: boolean;
  hasInsurance?: boolean;
  isAfterHours?: boolean;
  isWeekend?: boolean;
  waitTimeMinutes?: number;
}

export interface PriceBreakdown {
  baseFare: number;
  distanceFee: number;
  subtotal: number;
  fragileCharge: number;
  insuranceCharge: number;
  afterHoursCharge: number;
  weekendCharge: number;
  waitTimeCharge: number;
  total: number;
  driverEarnings: number;
  companyCommission: number;
}

export class PricingService {
  static calculatePrice(options: PriceCalculationOptions): PriceBreakdown {
    const { distance, isFragile = false, hasInsurance = false, isAfterHours = false, isWeekend = false, waitTimeMinutes = 0 } = options;
    
    // Base calculation
    const baseFare = PRICING_CONFIG.baseFare;
    const distanceFee = distance * PRICING_CONFIG.perKilometer;
    let subtotal = baseFare + distanceFee;
    
    // Apply minimum charge
    subtotal = Math.max(subtotal, PRICING_CONFIG.minimumCharge);
    
    // Calculate add-ons
    const fragileCharge = isFragile ? Math.round(subtotal * (PRICING_CONFIG.addOns.fragile / 100)) : 0;
    const insuranceCharge = hasInsurance ? Math.round(subtotal * (PRICING_CONFIG.addOns.insurance / 100)) : 0;
    const afterHoursCharge = isAfterHours ? Math.round(subtotal * (PRICING_CONFIG.addOns.afterHours / 100)) : 0;
    const weekendCharge = isWeekend ? Math.round(subtotal * (PRICING_CONFIG.addOns.weekend / 100)) : 0;
    const waitTimeCharge = waitTimeMinutes > 5 ? (waitTimeMinutes - 5) * PRICING_CONFIG.addOns.waitTime : 0;
    
    // Calculate total
    const total = subtotal + fragileCharge + insuranceCharge + afterHoursCharge + weekendCharge + waitTimeCharge;
    
    // Calculate driver earnings (using average commission of 17.5%)
    const commissionRate = (PRICING_CONFIG.driverCommission.min + PRICING_CONFIG.driverCommission.max) / 2;
    const companyCommission = Math.round(total * (commissionRate / 100));
    const driverEarnings = total - companyCommission;
    
    return {
      baseFare,
      distanceFee,
      subtotal,
      fragileCharge,
      insuranceCharge,
      afterHoursCharge,
      weekendCharge,
      waitTimeCharge,
      total: Math.round(total),
      driverEarnings: Math.round(driverEarnings),
      companyCommission,
    };
  }
  
  static isAfterHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 19 || hour < 6; // After 7 PM or before 6 AM
  }
  
  static isWeekend(): boolean {
    const now = new Date();
    const day = now.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }
  
  static formatPriceBreakdown(breakdown: PriceBreakdown): string {
    let result = `Base fare: KSh ${breakdown.baseFare}\n`;
    result += `Distance (${breakdown.distanceFee / PRICING_CONFIG.perKilometer} km): KSh ${breakdown.distanceFee}\n`;
    result += `Subtotal: KSh ${breakdown.subtotal}\n`;
    
    if (breakdown.fragileCharge > 0) {
      result += `Fragile handling (20%): +KSh ${breakdown.fragileCharge}\n`;
    }
    if (breakdown.insuranceCharge > 0) {
      result += `Insurance cover (20%): +KSh ${breakdown.insuranceCharge}\n`;
    }
    if (breakdown.afterHoursCharge > 0) {
      result += `After-hours delivery (10%): +KSh ${breakdown.afterHoursCharge}\n`;
    }
    if (breakdown.weekendCharge > 0) {
      result += `Weekend delivery (10%): +KSh ${breakdown.weekendCharge}\n`;
    }
    if (breakdown.waitTimeCharge > 0) {
      result += `Wait time: +KSh ${breakdown.waitTimeCharge}\n`;
    }
    
    result += `\nTotal: KSh ${breakdown.total}`;
    return result;
  }
}