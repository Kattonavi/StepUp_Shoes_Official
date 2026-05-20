// ============================================================
// StepUp — Tipos TypeScript globales
// Alineados con los DTOs reales del backend (campos en inglés).
// ============================================================

// --- Respuesta genérica de la API ---

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string | null
  errors?: string[]
  timestamp?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// --- Roles y estado de usuario ---

export type Role = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DELETED'

// --- AuthUser — del endpoint /auth/me y /auth/login ---

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: Role
  status: UserStatus
}

// --- Auth requests/responses ---

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  user: AuthUser
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// --- AdminUser — del endpoint /users (UserResponse del backend) ---

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: Role
  status: UserStatus
  lastLoginAt: string | null
  blockedAt: string | null
  createdAt: string
  updatedAt: string
}

// --- Requests de usuarios admin ---

export interface CreateUserRequest {
  email: string
  password: string
  fullName: string
  role: Role
}

/** Solo actualiza fullName — rol y status tienen endpoints PATCH dedicados */
export interface UpdateUserRequest {
  fullName: string
}

export interface UpdateUserRoleRequest {
  role: Role
}

export interface UpdateUserStatusRequest {
  status: UserStatus
}

export interface AdminUserFilters {
  page?: number
  size?: number
}

// ============================================================
// CATEGORÍAS (campos en inglés, alineados con CategoryResponse)
// ============================================================

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  position: number
  active: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// --- Requests de categoría ---

export interface CreateCategoryRequest {
  name: string
  slug?: string
  icon?: string
  description?: string
  position?: number
  active?: boolean
}

/** UpdateCategoryRequest NO incluye active — usar PATCH /status */
export interface UpdateCategoryRequest {
  name: string
  slug?: string
  icon?: string
  description?: string
  position?: number
}

export interface UpdateCategoryStatusRequest {
  active: boolean
}

export interface AdminCategoryFilters {
  includeInactive?: boolean
  includeDeleted?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

// ============================================================
// PRODUCTOS (campos en inglés, alineados con backend DTOs)
// ============================================================

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'HIDDEN' | 'DELETED'
export type StockStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'ON_REQUEST'

// --- Resumen de producto (devuelto por listados: GET /products y GET /products/admin) ---

export interface ProductSummary {
  id: string
  name: string
  slug: string
  categoryId: string | null
  categoryName: string | null
  price: number
  oldPrice: number | null
  discountPercentage: number | null
  status: ProductStatus
  stockStatus: StockStatus
  isNew: boolean
  isOnSale: boolean
  isFeatured: boolean
  visible: boolean
  mainImageUrl: string | null
  createdAt: string
}

// --- Imagen de producto (en respuestas de detalle) ---

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  position: number
  mainImage: boolean
}

// --- Talla/tamaño de producto ---

export interface ProductSize {
  id: string
  size: string
  stockQuantity: number
  available: boolean
}

// --- Producto completo (devuelto por GET /products/{id} y GET /products/slug/{slug}) ---

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  price: number
  oldPrice: number | null
  discountPercentage: number | null
  status: ProductStatus
  stockStatus: StockStatus
  isNew: boolean
  isOnSale: boolean
  isFeatured: boolean
  visible: boolean
  seoTitle: string | null
  seoDescription: string | null
  displayOrder: number | null
  images: ProductImage[]
  sizes: ProductSize[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// --- Requests de imagen y talla ---

export interface ProductImageRequest {
  url: string
  altText?: string
  position?: number
  mainImage?: boolean
}

export interface ProductSizeRequest {
  size: string
  stockQuantity?: number
  available?: boolean
}

// --- Requests de producto ---

export interface CreateProductRequest {
  name: string
  slug?: string
  description?: string
  categoryId: string
  price: number
  oldPrice?: number
  discountPercentage?: number
  status?: ProductStatus
  stockStatus?: StockStatus
  isNew?: boolean
  isOnSale?: boolean
  isFeatured?: boolean
  visible?: boolean
  seoTitle?: string
  seoDescription?: string
  displayOrder?: number
  images?: ProductImageRequest[]
  sizes?: ProductSizeRequest[]
}

export type UpdateProductRequest = CreateProductRequest

export interface UpdateProductVisibilityRequest {
  visible: boolean
}

export interface UpdateProductStatusRequest {
  status: ProductStatus
}

export interface UpdateProductStockRequest {
  stockStatus: StockStatus
  sizes?: ProductSizeRequest[]
}

// --- Filtros de catálogo público ---

export type ProductSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'featured'

export interface ProductFilters {
  categorySlug?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  stockStatus?: StockStatus
  isNew?: boolean
  isOnSale?: boolean
  isFeatured?: boolean
  sort?: ProductSortOption
  page?: number
  size?: number
}

// --- Filtros admin de productos ---

export interface AdminProductFilters {
  includeDeleted?: boolean
  page?: number
  size?: number
}

// ============================================================
// OTROS MÓDULOS (Mensajes, Analíticas, Settings, Control Center)
// ============================================================

export interface Message {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  mensaje: string
  productId: string | null
  leido: boolean
  notasInternas: string | null
  createdAt: string
}

export type EventType = 'PRODUCT_VIEW' | 'CATEGORY_VIEW' | 'WHATSAPP_CLICK' | 'PAGE_VIEW'

export interface AnalyticsEvent {
  tipo: EventType
  entidadId?: string
}

export interface AnalyticsDashboard {
  viewsHoy: number
  viewsMes: number
  whatsappClicksHoy: number
  mensajesNuevos: number
  productosActivos: number
  topProductos: Array<{
    productId: string
    nombre: string
    vistas: number
  }>
}

export interface StoreSettings {
  id: string
  nombre: string
  logoUrl: string | null
  whatsapp: string | null
  mensajeBaseWhatsapp: string | null
  redesSociales: Record<string, string>
  textoHome: string | null
  seoTitle: string | null
  seoDescription: string | null
  ogImageUrl: string | null
  enMantenimiento: boolean
  updatedAt: string
}

// ============================================================
// CONTROL CENTER — alineados con backend DTOs del ControlCenterController
// ============================================================

// --- Enums ---

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SOFT_DELETE'
  | 'RESTORE'
  | 'STATUS_CHANGE'
  | 'ROLE_CHANGE'
  | 'VISIBILITY_CHANGE'
  | 'STOCK_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'REFRESH_TOKEN'
  | 'SYSTEM_SEED'
  | 'SYSTEM_EVENT'

export type AuditableEntityType =
  | 'USER'
  | 'PRODUCT'
  | 'CATEGORY'
  | 'PRODUCT_IMAGE'
  | 'PRODUCT_SIZE'
  | 'STORE_SETTINGS'
  | 'MESSAGE'
  | 'SYSTEM'

export type SnapshotReason =
  | 'BEFORE_UPDATE'
  | 'AFTER_UPDATE'
  | 'BEFORE_DELETE'
  | 'AFTER_RESTORE'
  | 'MANUAL'
  | 'SYSTEM'

// --- Audit Logs ---

export interface AuditLog {
  id: string
  actorUserId: string | null
  actorEmail: string | null
  actorRole: string | null
  action: AuditAction
  entityType: AuditableEntityType
  entityId: string | null
  description: string | null
  createdAt: string
}

export interface AuditLogDetail extends AuditLog {
  ipAddressHash: string | null
  userAgent: string | null
  snapshots: EntitySnapshot[]
}

// --- Entity Snapshots ---

export interface EntitySnapshot {
  id: string
  auditLogId: string | null
  entityType: AuditableEntityType
  entityId: string
  snapshotReason: SnapshotReason
  hasBeforeData: boolean
  hasAfterData: boolean
  createdAt: string
}

export interface EntitySnapshotDetail extends EntitySnapshot {
  /** JSON string — parse con JSON.parse() */
  beforeData: string | null
  /** JSON string — parse con JSON.parse() */
  afterData: string | null
}

// --- Deleted Items ---

export interface DeletedItem {
  entityType: AuditableEntityType
  entityId: string
  entityName: string | null
  deletedAt: string
  deletedBy: string | null
  latestSnapshotId: string | null
}

// --- Restore Actions ---

export interface RestoreAction {
  id: string
  snapshotId: string
  restoredByUserId: string | null
  restoredByEmail: string | null
  entityType: AuditableEntityType
  entityId: string
  reason: string | null
  createdAt: string
}

// --- Filters ---

export interface AuditLogFilters {
  action?: AuditAction
  entityType?: AuditableEntityType
  entityId?: string
  actorUserId?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface SnapshotFilters {
  entityType?: AuditableEntityType
  entityId?: string
  reason?: SnapshotReason
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface DeletedItemFilters {
  entityType?: AuditableEntityType
  page?: number
  size?: number
}

// ============================================================
// DASHBOARD — alineados con DashboardSummaryResponse del backend
// ============================================================

export interface ChartDataPoint {
  label: string
  value: number
}

export interface DashboardProductsMetrics {
  total: number
  active: number
  draft: number
  hidden: number
  deleted: number
  featured: number
  isNew: number
  onSale: number
  outOfStock: number
  available: number
  onRequest: number
  notVisible: number
}

export interface DashboardCategoriesMetrics {
  total: number
  active: number
  inactive: number
  deleted: number
}

export interface DashboardUsersMetrics {
  total: number
  active: number
  blocked: number
  inactive: number
  owners: number
  admins: number
  editors: number
  viewers: number
}

export interface RecentAuditLogItem {
  id: string
  actorEmail: string | null
  actorRole: string | null
  action: AuditAction
  entityType: AuditableEntityType
  entityId: string | null
  description: string | null
  createdAt: string
}

export interface RecentProductItem {
  id: string
  name: string
  slug: string
  status: ProductStatus
  stockStatus: StockStatus
  price: number
  createdAt: string
  updatedAt: string
}

export interface DashboardActivityMetrics {
  recentLogs: RecentAuditLogItem[]
  recentProducts: RecentProductItem[]
}

// ============================================================
// MENSAJES — alineados con MessageResponse / MessageDetailResponse del backend
// ============================================================

export type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'DELETED'
export type MessageSource = 'CONTACT_FORM' | 'PRODUCT_INQUIRY' | 'WHATSAPP_CTA' | 'ADMIN_CREATED' | 'SYSTEM'

export interface Message {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  subject: string | null
  source: MessageSource
  status: MessageStatus
  productId: string | null
  productName: string | null
  createdAt: string
  readAt: string | null
}

export interface MessageDetail extends Message {
  content: string
  internalNotes: string | null
  updatedAt: string
  readBy: string | null
  archivedAt: string | null
  archivedBy: string | null
  deletedAt: string | null
}

export interface CreateMessageRequest {
  fullName: string
  email?: string
  phone?: string
  subject?: string
  content: string
  productId?: string
  source?: MessageSource
}

export interface UpdateMessageNotesRequest {
  internalNotes: string | null
}

export interface MessageFilters {
  status?: MessageStatus
  source?: MessageSource
  search?: string
  productId?: string
  from?: string
  to?: string
  includeDeleted?: boolean
  page?: number
  size?: number
}

export interface UnreadCountResponse {
  count: number
}

export interface DashboardSummary {
  products: DashboardProductsMetrics
  categories: DashboardCategoriesMetrics
  users: DashboardUsersMetrics
  activity: DashboardActivityMetrics
  productsByStatus: ChartDataPoint[]
  productsByStockStatus: ChartDataPoint[]
  usersByRole: ChartDataPoint[]
  auditLogsLast7Days: ChartDataPoint[]
}
