/**
 * Device Detection Utility
 * 
 * This utility detects the current device type and screen size,
 * and provides methods for responsive design adaptation.
 */

const DeviceDetection = (function() {
    // Device types
    const DEVICE_TYPES = {
        DESKTOP: 'desktop',
        TABLET: 'tablet',
        MOBILE: 'mobile'
    };

    // Screen size breakpoints (in pixels)
    const BREAKPOINTS = {
        MOBILE_MAX: 575,
        TABLET_MIN: 576,
        TABLET_MAX: 991,
        DESKTOP_MIN: 992
    };

    // Current device information
    let currentDevice = {
        type: null,
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    /**
     * Detect the current device type based on screen width
     * @returns {string} Device type (desktop, tablet, or mobile)
     */
    function detectDeviceType() {
        const width = window.innerWidth;
        
        if (width <= BREAKPOINTS.MOBILE_MAX) {
            return DEVICE_TYPES.MOBILE;
        } else if (width >= BREAKPOINTS.TABLET_MIN && width <= BREAKPOINTS.TABLET_MAX) {
            return DEVICE_TYPES.TABLET;
        } else {
            return DEVICE_TYPES.DESKTOP;
        }
    }

    /**
     * Update the current device information
     */
    function updateDeviceInfo() {
        currentDevice.width = window.innerWidth;
        currentDevice.height = window.innerHeight;
        currentDevice.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        currentDevice.type = detectDeviceType();
        
        // Update HTML element with device type for CSS targeting
        document.documentElement.setAttribute('data-device', currentDevice.type);
        document.documentElement.setAttribute('data-orientation', currentDevice.orientation);
        
        // Dispatch custom event for device change
        const event = new CustomEvent('devicechange', { detail: currentDevice });
        window.dispatchEvent(event);
        
        return currentDevice;
    }

    /**
     * Load device-specific CSS file
     * @param {string} deviceType - The device type (desktop, tablet, or mobile)
     */
    function loadDeviceCSS(deviceType) {
        // Remove any previously loaded device-specific CSS
        const existingLinks = document.querySelectorAll('link[data-device-css]');
        existingLinks.forEach(link => link.remove());
        
        // Create and append the new device-specific CSS link
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/device-${deviceType}.css`;
        link.setAttribute('data-device-css', deviceType);
        document.head.appendChild(link);
    }

    /**
     * Check if the device is offline
     * @returns {boolean} True if the device is offline
     */
    function isOffline() {
        return !navigator.onLine;
    }

    /**
     * Update the UI based on online/offline status
     */
    function updateOnlineStatus() {
        if (isOffline()) {
            document.body.classList.add('offline-mode');
        } else {
            document.body.classList.remove('offline-mode');
        }
        
        // Dispatch custom event for online status change
        const event = new CustomEvent('onlinestatuschange', { detail: { online: navigator.onLine } });
        window.dispatchEvent(event);
    }

    // Initialize device detection
    function init() {
        // Set initial device info
        updateDeviceInfo();
        
        // Load device-specific CSS
        loadDeviceCSS(currentDevice.type);
        
        // Set initial online status
        updateOnlineStatus();
        
        // Add event listeners for screen size changes
        window.addEventListener('resize', function() {
            const previousType = currentDevice.type;
            const newInfo = updateDeviceInfo();
            
            // If device type changed, load the appropriate CSS
            if (previousType !== newInfo.type) {
                loadDeviceCSS(newInfo.type);
            }
        });
        
        // Add event listeners for online/offline status
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    // Public API
    return {
        init: init,
        getDeviceInfo: function() { return {...currentDevice}; },
        isDesktop: function() { return currentDevice.type === DEVICE_TYPES.DESKTOP; },
        isTablet: function() { return currentDevice.type === DEVICE_TYPES.TABLET; },
        isMobile: function() { return currentDevice.type === DEVICE_TYPES.MOBILE; },
        isTouch: function() { return currentDevice.touchEnabled; },
        isOffline: isOffline,
        DEVICE_TYPES: DEVICE_TYPES
    };
})();

// Initialize device detection when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    DeviceDetection.init();
});

