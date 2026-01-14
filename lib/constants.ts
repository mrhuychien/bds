// =====================================================
// Vietnamese Real Estate Constants
// =====================================================

export const PROPERTY_TYPES = {
  nha_pho: 'Nhà phố',
  can_ho: 'Căn hộ',
  dat_nen: 'Đất nền',
  biet_thu: 'Biệt thự',
  mat_bang: 'Mặt bằng',
  nha_xuong: 'Nhà xưởng',
} as const

export type PropertyType = keyof typeof PROPERTY_TYPES

export const PROPERTY_STATUS = {
  available: 'Đang bán',
  deposited: 'Đã cọc',
  sold: 'Đã bán',
  rented: 'Đã thuê',
} as const

export type PropertyStatus = keyof typeof PROPERTY_STATUS

export const LISTING_TYPES = {
  sale: 'Bán',
  rent: 'Cho thuê',
} as const

export type ListingType = keyof typeof LISTING_TYPES

export const DIRECTIONS = {
  dong: 'Đông',
  tay: 'Tây',
  nam: 'Nam',
  bac: 'Bắc',
  dong_nam: 'Đông Nam',
  dong_bac: 'Đông Bắc',
  tay_nam: 'Tây Nam',
  tay_bac: 'Tây Bắc',
} as const

export type Direction = keyof typeof DIRECTIONS

export const LEGAL_STATUS = {
  so_do: 'Sổ đỏ',
  so_hong: 'Sổ hồng',
  hop_dong: 'Hợp đồng',
  dang_cho: 'Đang chờ sổ',
} as const

export type LegalStatus = keyof typeof LEGAL_STATUS

export const CUSTOMER_TYPES = {
  buyer: 'Người mua',
  seller: 'Người bán',
  investor: 'Nhà đầu tư',
  renter: 'Người thuê',
} as const

export type CustomerType = keyof typeof CUSTOMER_TYPES

export const CUSTOMER_STATUS = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  viewing: 'Đang xem nhà',
  negotiating: 'Đang đàm phán',
  closed: 'Đã chốt',
  lost: 'Mất khách',
} as const

export type CustomerStatus = keyof typeof CUSTOMER_STATUS

export const CUSTOMER_PRIORITY = {
  hot: { label: 'Nóng', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  warm: { label: 'Ấm', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  normal: { label: 'Bình thường', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  cold: { label: 'Lạnh', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
} as const

export type CustomerPriority = keyof typeof CUSTOMER_PRIORITY

export const INTERACTION_TYPES = {
  call: 'Gọi điện',
  zalo: 'Zalo',
  viewing: 'Xem nhà',
  note: 'Ghi chú',
  email: 'Email',
} as const

export type InteractionType = keyof typeof INTERACTION_TYPES

// Common property features
export const COMMON_FEATURES = [
  'Hẻm xe hơi',
  'Mặt tiền',
  'Gần trường học',
  'Gần bệnh viện',
  'Gần chợ',
  'Gần công viên',
  'View sông',
  'View thành phố',
  'Có thang máy',
  'Có hầm để xe',
  'Có sân vườn',
  'Có hồ bơi',
  'An ninh 24/7',
  'Nội thất cao cấp',
  'Nội thất cơ bản',
  'Nhà trống',
] as const

// Price range presets (in VNĐ)
export const PRICE_RANGES = [
  { label: 'Dưới 1 tỷ', min: 0, max: 1_000_000_000 },
  { label: '1 - 3 tỷ', min: 1_000_000_000, max: 3_000_000_000 },
  { label: '3 - 5 tỷ', min: 3_000_000_000, max: 5_000_000_000 },
  { label: '5 - 10 tỷ', min: 5_000_000_000, max: 10_000_000_000 },
  { label: '10 - 20 tỷ', min: 10_000_000_000, max: 20_000_000_000 },
  { label: 'Trên 20 tỷ', min: 20_000_000_000, max: null },
] as const

// Area range presets (in m²)
export const AREA_RANGES = [
  { label: 'Dưới 50 m²', min: 0, max: 50 },
  { label: '50 - 100 m²', min: 50, max: 100 },
  { label: '100 - 200 m²', min: 100, max: 200 },
  { label: '200 - 500 m²', min: 200, max: 500 },
  { label: 'Trên 500 m²', min: 500, max: null },
] as const

// Major cities and districts in Vietnam
export const PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Khánh Hòa',
  'Bà Rịa - Vũng Tàu',
  'Quảng Ninh',
] as const

// HCM Districts
export const HCM_DISTRICTS = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'Thủ Đức',
  'Bình Tân',
  'Nhà Bè',
  'Hóc Môn',
  'Củ Chi',
  'Cần Giờ',
  'Bình Chánh',
] as const

// Watermark templates
export const WATERMARK_TEMPLATES = {
  style_1: 'Cơ bản',
  style_2: 'Chuyên nghiệp',
  style_3: 'Tối giản',
} as const

export const WATERMARK_POSITIONS = {
  top_left: 'Trên trái',
  top_right: 'Trên phải',
  bottom_left: 'Dưới trái',
  bottom_right: 'Dưới phải',
  center: 'Giữa',
} as const
