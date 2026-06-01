package com.stepup.storefront.enums;

/**
 * Tipos de evento del storefront. Deben coincidir con el CHECK de
 * storefront_events_type_valid en la migración V22.
 */
public enum StorefrontEventType {
    PRODUCT_VIEW,
    WHATSAPP_CLICK,
    PROMOTION_VIEW,
    PROMOTION_CLICK,
    CATEGORY_VIEW,
    CATALOG_VIEW,
    HOME_VIEW
}
