const primaryOrange = "#FF6A00";
const lightOrange = "#FFF4F0";
const darkOrange = "#E55A00";
const accentBlue = "#2563EB";
const lightBlue = "#EFF6FF";
const darkBlue = "#1D4ED8";
const charcoalBlack = "#1A1A1A";
const softBlack = "#2D2D2D";
const lightGray = "#F8F9FA";
const mediumGray = "#6B7280";

// Default colors object for direct access
const colors = {
  text: charcoalBlack,
  textSecondary: softBlack,
  textMuted: mediumGray,
  background: "#FFFFFF",
  backgroundSecondary: lightGray,
  backgroundTertiary: "#F3F4F6",
  primary: primaryOrange,
  primaryLight: lightOrange,
  primaryDark: darkOrange,
  secondary: accentBlue,
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
};

const Colors = {
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
    secondary: accentBlue,
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
  dark: {
    text: "#FFFFFF",
    textSecondary: "#E5E7EB",
    textMuted: "#9CA3AF",
    background: "#111827",
    backgroundSecondary: "#1F2937",
    backgroundTertiary: "#374151",
    primary: primaryOrange,
    primaryLight: lightOrange,
    primaryDark: darkOrange,
    secondary: accentBlue,
    secondaryLight: lightBlue,
    secondaryDark: darkBlue,
    accent: accentBlue,
    accentLight: lightBlue,
    accentDark: darkBlue,
    border: "#374151",
    borderLight: "#4B5563",
    success: "#10B981",
    successDark: "#059669",
    warning: "#F59E0B",
    error: "#EF4444",
    info: accentBlue,
    tint: primaryOrange,
    tabIconDefault: "#6B7280",
    tabIconSelected: primaryOrange,
    shadow: "rgba(0, 0, 0, 0.3)",
    overlay: "rgba(0, 0, 0, 0.7)",
    mpesa: "#00A651",
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

export default colors;
export { Colors };