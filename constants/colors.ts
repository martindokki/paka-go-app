const primaryOrange = "#FF6B35";
const lightOrange = "#FFF4F0";
const darkOrange = "#E55A2B";
const accentBlue = "#2563EB";
const lightBlue = "#EFF6FF";
const darkBlue = "#1D4ED8";
const charcoalBlack = "#1A1A1A";
const softBlack = "#2D2D2D";
const lightGray = "#F8F9FA";
const mediumGray = "#6B7280";

export default {
  light: {
    text: charcoalBlack,
    textSecondary: softBlack,
    textMuted: mediumGray,
    background: "#FFFFFF",
    backgroundSecondary: lightGray,
    backgroundTertiary: "#F3F4F6",
    primary: primaryOrange,
    primaryLight: lightOrange,
    primaryDark: darkOrange,
    secondary: accentBlue, // Added secondary color
    secondaryLight: lightBlue,
    secondaryDark: darkBlue,
    accent: accentBlue,
    accentLight: lightBlue,
    accentDark: darkBlue,
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
    success: "#10B981",
    successDark: "#059669",
    warning: "#F59E0B",
    error: "#EF4444",
    info: accentBlue,
    tint: primaryOrange,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: primaryOrange,
    shadow: "rgba(0, 0, 0, 0.1)",
    overlay: "rgba(0, 0, 0, 0.5)",
    mpesa: "#00A651", // M-Pesa green
    mpesaLight: "#E8F5E8",
    // Status colors
    pending: "#F59E0B",
    assigned: "#3B82F6",
    picked_up: "#8B5CF6",
    in_transit: "#06B6D4",
    delivered: "#10B981",
    cancelled: "#EF4444",
  },
};