/**
 * @fileoverview au-icon - Material Symbols Icon Component
 * 
 * Supports both:
 * 1. Material Symbols font (2500+ icons) - primary
 * 2. Inline SVG fallback for critical icons
 * 
 * Usage: 
 *   <au-icon name="check"></au-icon>           <!-- Material Symbol -->
 *   <au-icon name="check" svg></au-icon>       <!-- Force SVG -->
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';

/** @private Inline SVG paths for critical icons (fallback when font not loaded) */
const SVG_ICONS = {
    // Actions
    check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
    remove: 'M19 13H5v-2h14z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75z',
    delete: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z',
    search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',

    // Navigation
    menu: 'M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z',
    chevron_right: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    chevron_left: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    expand_more: 'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z',
    expand_less: 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    arrow_back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z',
    arrow_forward: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',

    // Status
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z',
    warning: 'M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z',
    check_circle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z',
    cancel: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z',

    // UI
    settings: 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    light_mode: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z',
    dark_mode: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
    visibility: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3',
    visibility_off: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z',

    // Drawer/Navigation icons
    download: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z',
    smart_button: 'M22 9v6c0 1.1-.9 2-2 2h-1v-2h1V9H4v6h6v2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-7.5 11 1.09-2.41L18 16.5l-2.41-1.09L14.5 13l-1.09 2.41L11 16.5l2.41 1.09L14.5 20zm2.5-5 .62-1.38L19 14l-1.38-.62L17 12l-.62 1.38L15 14l1.38.62L17 16zm-2.5 5 1.09-2.41L18 16.5l-2.41-1.09L14.5 13l-1.09 2.41L11 16.5l2.41 1.09L14.5 20z',
    text_fields: 'M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z',
    check_box: 'M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    toggle_on: 'M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
    radio_button_checked: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
    arrow_drop_down_circle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 12-4-4h8l-4 4z',
    view_carousel: 'M7 19h10V4H7v15zm-5-2h4V6H2v11zM18 6v11h4V6h-4z',
    grid_view: 'M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z',
    tab: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z',
    notifications: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
    open_in_new: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    hourglass_empty: 'M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5-4-4V4h8v3.5l-4 4z',
    account_circle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z',
    fiber_manual_record: 'M12 12m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0',
    label: 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z',
    emoji_emotions: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
    business: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
    input: 'M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z',
    category: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
    widgets: 'M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z',
    smart_toy: 'M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z',
    notification_important: 'M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-6 6c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm1-15.06c1.77.52 3 2.14 3 4.06v5.5l1 1v.5H7v-.5l1-1V11c0-1.92 1.23-3.54 3-4.06V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v.94zM13 11h-2v6h2v-6zm0-4h-2v2h2V7z',

    // Enterprise icons
    folder_managed: 'M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2.06 11L15 15.28 12.06 17l.78-3.33-2.59-2.24 3.41-.29L15 8l1.34 3.14 3.41.29-2.59 2.24.78 3.33z',
    shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
    apps: 'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z',
    monitoring: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 12h2v5H7v-5zm4-3h2v8h-2V9zm4-3h2v11h-2V6z',
    confirmation_number: 'M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z',
    verified: 'M23 11.99l-2.44-2.79.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 11.99l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69zM10.09 16.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z',
    login: 'M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z',

    // Structural/utility icons
    alt_route: 'M9.78 11.16l-1.42 1.42c-.68-.69-1.34-1.58-1.79-2.94l1.94-.49c.32.89.77 1.5 1.27 2.01zM11 6L7 2 3 6h3.02c.02.81.08 1.54.19 2.17l1.94-.49C8.08 7.2 8.03 6.63 8.02 6H11zm10 0l-4-4-4 4h2.99c-.1 3.68-1.28 4.75-2.54 5.88-.5.44-1.01.92-1.45 1.55-.34-.49-.73-.88-1.13-1.24l-1.41 1.41c.93.85 1.54 1.54 1.54 3.4v5h2v-5c0-2.02.71-2.66 1.79-3.63 1.38-1.24 3.08-2.78 3.2-7.37H21z',
    animation: 'M15 2c-2.71 0-5.05 1.54-6.22 3.78-1.28.67-2.34 1.72-3 3C3.54 9.95 2 12.29 2 15c0 3.87 3.13 7 7 7 2.71 0 5.05-1.54 6.22-3.78 1.28-.67 2.34-1.72 3-3C20.46 14.05 22 11.71 22 9c0-3.87-3.13-7-7-7zM9 20c-2.76 0-5-2.24-5-5 0-1.12.37-2.16 1-3 0 3.87 3.13 7 7 7-.84.63-1.88 1-3 1zm3-3c-2.76 0-5-2.24-5-5 0-1.12.37-2.16 1-3 0 3.86 3.13 6.99 7 7-.84.63-1.88 1-3 1zm4.7-3.3c-.53.19-1.1.3-1.7.3-2.76 0-5-2.24-5-5 0-.6.11-1.17.3-1.7.53-.19 1.1-.3 1.7-.3 2.76 0 5 2.24 5 5 0 .6-.11 1.17-.3 1.7zM19 12c0-3.86-3.13-6.99-7-7 .84-.63 1.87-1 3-1 2.76 0 5 2.24 5 5 0 1.12-.37 2.16-1 3z',
    devices: 'M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z',
    filter_center_focus: 'M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    image: 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z',
    repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
    timer: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.87 7-7 7z'
};

// P2.4 perf fix: Only actual aliases (was 45 identity entries + 6 aliases = wasted memory)
// Identity mappings (check → check, close → close, etc.) are useless — removed.
const ICON_ALIASES = {
    success: 'check_circle',
    sun: 'light_mode',
    moon: 'dark_mode',
    user: 'person',
    plus: 'add',
    minus: 'remove'
};

// Exhaustive list of known icon names (for validation only)
const KNOWN_ICONS = new Set([
    'check', 'close', 'add', 'remove', 'edit', 'delete', 'search', 'menu',
    'chevron_right', 'chevron_left', 'expand_more', 'expand_less', 'home',
    'arrow_back', 'arrow_forward', 'info', 'warning', 'error', 'check_circle',
    'cancel', 'settings', 'person', 'light_mode', 'dark_mode', 'visibility',
    'visibility_off', 'download', 'smart_button', 'text_fields', 'check_box',
    'toggle_on', 'radio_button_checked', 'arrow_drop_down_circle', 'view_carousel',
    'grid_view', 'tab', 'notifications', 'open_in_new', 'hourglass_empty',
    'account_circle', 'fiber_manual_record', 'label', 'emoji_emotions',
    'business', 'input', 'category', 'widgets', 'smart_toy',
    'notification_important', 'folder_managed', 'shield', 'apps', 'monitoring',
    'confirmation_number', 'verified', 'login',
    'alt_route', 'animation', 'devices', 'filter_center_focus', 'image',
    'repeat', 'timer',
    // All aliases resolve too
    ...Object.keys(ICON_ALIASES)
]);

// Named size → pixel mapping
const SIZE_MAP = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 };

/**
 * Material Symbols icon component with font and SVG fallback.
 *
 * @class
 * @extends AuElement
 * @element au-icon
 */
export class AuIcon extends AuElement {
    static baseClass = 'au-icon';
    static cssFile = 'icon';
    /** @type {string[]} */
    static observedAttributes = ['name', 'size', 'svg', 'filled', 'font'];


    /** @override */
    render() {
        const name = this.attr('name', 'info');
        const sizeAttr = this.attr('size', '24');
        const size = SIZE_MAP[sizeAttr] || parseInt(sizeAttr, 10) || 24;
        const forceFont = this.has('font'); // New: force font instead of SVG
        const filled = this.has('filled');

        // Accessibility: set role and aria-hidden (decorative by default)
        this.setAttribute('role', 'img');
        this.setAttribute('aria-hidden', 'true');

        // Resolve aliases (P2.4: was a no-op — SYMBOL_NAMES[name] ? name : name  always returned name)
        const resolvedName = ICON_ALIASES[name] || name;
        const svgPath = SVG_ICONS[resolvedName] || SVG_ICONS[name];

        // SVG first (default) - eliminates 254KB font dependency for common icons
        // Only fall back to font if: 1) force font attr, or 2) no SVG exists
        if (!forceFont && svgPath) {
            this.innerHTML = `
                <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="${svgPath}"></path>
                </svg>
            `;
            return;
        }

        // Fall back to Material Symbols font (for rare icons not in SVG set)
        const symbolName = ICON_ALIASES[name] || name;

        // Log warning for unknown icon names (AI agent readiness)
        if (!KNOWN_ICONS.has(name) && !SVG_ICONS[name]) {
            this.logError('UNKNOWN_ICON', `Icon name "${name}" not found in predefined icons. Using font fallback.`);
        }

        // Auto-inject Google Fonts when a non-bundled icon is used (AI-First: zero-config)
        if (!AuIcon._fontInjected) {
            AuIcon._fontInjected = true;
            const fontUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
            if (!document.querySelector(`link[href="${fontUrl}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = fontUrl;
                document.head.appendChild(link);
            }
        }

        this.innerHTML = html`<span class="material-symbols-outlined" aria-hidden="true">${symbolName}</span>`;

        // Apply size and fill
        const span = this.querySelector('span');
        if (span) {
            span.style.fontSize = `${size}px`;
            if (filled) {
                span.style.fontVariationSettings = "'FILL' 1";
            }
        }
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.render();
    }
}

// Export icon names for reference
export const IconNames = [...KNOWN_ICONS];
export const SvgIconNames = Object.keys(SVG_ICONS);

define('au-icon', AuIcon);
