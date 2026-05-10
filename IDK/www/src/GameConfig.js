/**
 * Copyright 2025 Diego Ovalle / DAOR Studios
 * SPDX-License-Identifier: Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * GameConfig.js
 * IDK Game — DAOR Studios
 *
 * Central platform detection and UI scale constants.
 * Import this in any scene to get consistent sizing across
 * the mobile (Capacitor) and web (browser) builds.
 *
 * Usage:
 *   import Platform from '../GameConfig.js';
 *   this.add.rectangle(x, y, Platform.BTN_W, Platform.BTN_H, 0x1a5c1a);
 */

// Capacitor injects window.Capacitor before any page scripts run.
// isNativePlatform() returns true on Android/iOS, false in the browser preview.
const IS_MOBILE =
    typeof window !== 'undefined' &&
    window.Capacitor !== undefined &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform();

const Platform = {
    IS_MOBILE,

    // ── Font sizes ────────────────────────────────────────────────────────
    // Mobile uses larger fonts for finger-friendly readability.
    // Web can be a bit tighter since the mouse is precise.
    FONT_TITLE:  IS_MOBILE ? '96px'  : '72px',
    FONT_XL:     IS_MOBILE ? '52px'  : '40px',
    FONT_LG:     IS_MOBILE ? '38px'  : '30px',
    FONT_MD:     IS_MOBILE ? '30px'  : '24px',
    FONT_SM:     IS_MOBILE ? '24px'  : '19px',

    // ── Button sizes ──────────────────────────────────────────────────────
    // Mobile buttons need to be large enough for comfortable thumb taps.
    // Web buttons can be smaller since a mouse has pixel precision.
    BTN_H:       IS_MOBILE ? 100  : 70,
    BTN_W:       IS_MOBILE ? 480  : 340,
    BTN_W_WIDE:  IS_MOBILE ? 600  : 420,

    // ── Icon / image scales ───────────────────────────────────────────────
    ICON_SCALE:  IS_MOBILE ? 2.5  : 1.8,

    // ── Stroke widths ─────────────────────────────────────────────────────
    STROKE:      IS_MOBILE ? 3    : 2,

    // ── Show platform-specific controls ───────────────────────────────────
    // Quit button only makes sense in the native Android build.
    SHOW_QUIT:   IS_MOBILE,

    /**
     * Quit the app (Android native only).
     * Requires @capacitor/app: npm install @capacitor/app
     * If the plugin is not installed this fails silently.
     */
    quit() {
        try {
            if (IS_MOBILE && window.Capacitor?.Plugins?.App) {
                window.Capacitor.Plugins.App.exitApp();
            } else {
                // Browser fallback — usually blocked, but harmless
                window.close();
            }
        } catch (e) {
            console.warn('Quit not available:', e);
        }
    }
};

export default Platform;
