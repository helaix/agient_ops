/**
 * Notification System
 * 
 * This module implements adaptive notifications across devices:
 * - Desktop: Non-intrusive sidebar notifications with action buttons
 * - Tablet: Banner notifications with quick actions
 * - Mobile: Standard system notifications with deep links
 */

const NotificationSystem = (function() {
    // Notification types
    const NOTIFICATION_TYPES = {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error'
    };
    
    // Notification icons
    const NOTIFICATION_ICONS = {
        [NOTIFICATION_TYPES.INFO]: 'ℹ️',
        [NOTIFICATION_TYPES.SUCCESS]: '✅',
        [NOTIFICATION_TYPES.WARNING]: '⚠️',
        [NOTIFICATION_TYPES.ERROR]: '❌'
    };
    
    // Notification sounds
    const NOTIFICATION_SOUNDS = {
        [NOTIFICATION_TYPES.INFO]: 'notification-info.mp3',
        [NOTIFICATION_TYPES.SUCCESS]: 'notification-success.mp3',
        [NOTIFICATION_TYPES.WARNING]: 'notification-warning.mp3',
        [NOTIFICATION_TYPES.ERROR]: 'notification-error.mp3'
    };
    
    // Notification containers
    let desktopContainer = null;
    let tabletContainer = null;
    let mobileContainer = null;
    
    // Notification settings
    let settings = {
        desktop: {
            enabled: true,
            sound: true,
            duration: 5000 // 5 seconds
        },
        tablet: {
            enabled: true,
            sound: true,
            duration: 4000 // 4 seconds
        },
        mobile: {
            enabled: true,
            sound: true,
            useNative: true,
            duration: 3000 // 3 seconds
        }
    };
    
    // Notification queue
    let notificationQueue = [];
    let isProcessingQueue = false;
    
    /**
     * Initialize the notification system
     * @param {object} containers - Notification containers for each device type
     * @param {object} userSettings - User notification settings
     */
    function init(containers, userSettings = {}) {
        // Set containers
        desktopContainer = containers.desktop || null;
        tabletContainer = containers.tablet || null;
        mobileContainer = containers.mobile || null;
        
        // Merge user settings
        settings = {
            ...settings,
            ...userSettings
        };
        
        // Request permission for native notifications
        if (settings.mobile.useNative && 'Notification' in window) {
            Notification.requestPermission();
        }
        
        // Listen for device changes
        window.addEventListener('devicechange', function(event) {
            // Update notification containers based on device type
            updateContainers();
        });
        
        // Listen for online/offline events
        window.addEventListener('online', function() {
            // Show reconnected notification
            showNotification({
                title: 'Reconnected',
                message: 'You are back online',
                type: NOTIFICATION_TYPES.SUCCESS,
                autoClose: true
            });
            
            // Process any queued notifications
            processNotificationQueue();
        });
        
        window.addEventListener('offline', function() {
            // Show offline notification
            showNotification({
                title: 'Offline',
                message: 'You are currently offline. Some features may be unavailable.',
                type: NOTIFICATION_TYPES.WARNING,
                autoClose: true
            });
        });
    }
    
    /**
     * Update notification containers based on device type
     */
    function updateContainers() {
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Hide all containers
        if (desktopContainer) desktopContainer.style.display = 'none';
        if (tabletContainer) tabletContainer.style.display = 'none';
        if (mobileContainer) mobileContainer.style.display = 'none';
        
        // Show container for current device
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP && desktopContainer) {
            desktopContainer.style.display = 'block';
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET && tabletContainer) {
            tabletContainer.style.display = 'block';
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.MOBILE && mobileContainer) {
            mobileContainer.style.display = 'block';
        }
    }
    
    /**
     * Show a notification
     * @param {object} notification - The notification object
     * @returns {string} The notification ID
     */
    function showNotification(notification) {
        // Generate notification ID if not provided
        if (!notification.id) {
            notification.id = 'notification_' + Date.now();
        }
        
        // Set timestamp if not provided
        if (!notification.timestamp) {
            notification.timestamp = new Date().toISOString();
        }
        
        // Set default type if not provided
        if (!notification.type) {
            notification.type = NOTIFICATION_TYPES.INFO;
        }
        
        // Add to data model
        DataModel.addNotification(notification);
        
        // If offline, add to queue and return
        if (!navigator.onLine && !notification.offlineSupport) {
            notificationQueue.push(notification);
            return notification.id;
        }
        
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Show notification based on device type
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            showDesktopNotification(notification);
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            showTabletNotification(notification);
        } else {
            showMobileNotification(notification);
        }
        
        // Play sound if enabled
        playNotificationSound(notification.type);
        
        return notification.id;
    }
    
    /**
     * Show desktop notification (sidebar)
     * @param {object} notification - The notification object
     */
    function showDesktopNotification(notification) {
        if (!desktopContainer || !settings.desktop.enabled) {
            return;
        }
        
        // Create notification element
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.id = notification.id;
        
        // Notification icon
        const icon = document.createElement('div');
        icon.className = 'notification-icon';
        icon.textContent = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS[NOTIFICATION_TYPES.INFO];
        element.appendChild(icon);
        
        // Notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const title = document.createElement('div');
        title.className = 'notification-title';
        title.textContent = notification.title;
        content.appendChild(title);
        
        const message = document.createElement('div');
        message.className = 'notification-message';
        message.textContent = notification.message;
        content.appendChild(message);
        
        element.appendChild(content);
        
        // Notification actions
        if (notification.actions && notification.actions.length > 0) {
            const actions = document.createElement('div');
            actions.className = 'notification-actions';
            
            notification.actions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'notification-action';
                button.textContent = action.label;
                
                button.addEventListener('click', function() {
                    if (typeof action.handler === 'function') {
                        action.handler(notification);
                    }
                    
                    // Close notification after action
                    if (action.closeOnClick !== false) {
                        closeNotification(notification.id);
                    }
                });
                
                actions.appendChild(button);
            });
            
            element.appendChild(actions);
        }
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        closeButton.addEventListener('click', function() {
            closeNotification(notification.id);
        });
        
        element.appendChild(closeButton);
        
        // Add to container
        desktopContainer.appendChild(element);
        
        // Auto-close if specified
        if (notification.autoClose !== false) {
            setTimeout(function() {
                closeNotification(notification.id);
            }, settings.desktop.duration);
        }
    }
    
    /**
     * Show tablet notification (banner)
     * @param {object} notification - The notification object
     */
    function showTabletNotification(notification) {
        if (!tabletContainer || !settings.tablet.enabled) {
            return;
        }
        
        // Create notification element
        const element = document.createElement('div');
        element.className = `notification-banner notification-${notification.type}`;
        element.id = notification.id;
        
        // Notification icon
        const icon = document.createElement('div');
        icon.className = 'notification-icon';
        icon.textContent = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS[NOTIFICATION_TYPES.INFO];
        element.appendChild(icon);
        
        // Notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const title = document.createElement('div');
        title.className = 'notification-title';
        title.textContent = notification.title;
        content.appendChild(title);
        
        const message = document.createElement('div');
        message.className = 'notification-message';
        message.textContent = notification.message;
        content.appendChild(message);
        
        element.appendChild(content);
        
        // Quick actions
        if (notification.actions && notification.actions.length > 0) {
            const actions = document.createElement('div');
            actions.className = 'notification-quick-actions';
            
            // Show only the first 2 actions for tablet
            notification.actions.slice(0, 2).forEach(action => {
                const button = document.createElement('button');
                button.className = 'notification-quick-action';
                button.textContent = action.label;
                
                button.addEventListener('click', function() {
                    if (typeof action.handler === 'function') {
                        action.handler(notification);
                    }
                    
                    // Close notification after action
                    if (action.closeOnClick !== false) {
                        closeNotification(notification.id);
                    }
                });
                
                actions.appendChild(button);
            });
            
            element.appendChild(actions);
        }
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close notification');
        
        closeButton.addEventListener('click', function() {
            closeNotification(notification.id);
        });
        
        element.appendChild(closeButton);
        
        // Add to container
        tabletContainer.appendChild(element);
        
        // Auto-close if specified
        if (notification.autoClose !== false) {
            setTimeout(function() {
                closeNotification(notification.id);
            }, settings.tablet.duration);
        }
    }
    
    /**
     * Show mobile notification (system or in-app)
     * @param {object} notification - The notification object
     */
    function showMobileNotification(notification) {
        if (!settings.mobile.enabled) {
            return;
        }
        
        // Try to use native notifications if enabled and supported
        if (settings.mobile.useNative && 'Notification' in window && Notification.permission === 'granted') {
            // Create native notification
            const nativeNotification = new Notification(notification.title, {
                body: notification.message,
                icon: notification.icon || '/img/logo.png',
                tag: notification.id
            });
            
            // Add click handler
            nativeNotification.onclick = function() {
                // Focus window
                window.focus();
                
                // Handle primary action if available
                if (notification.actions && notification.actions.length > 0) {
                    const primaryAction = notification.actions[0];
                    
                    if (typeof primaryAction.handler === 'function') {
                        primaryAction.handler(notification);
                    }
                }
                
                // Close notification
                this.close();
            };
            
            // Auto-close if specified
            if (notification.autoClose !== false) {
                setTimeout(function() {
                    nativeNotification.close();
                }, settings.mobile.duration);
            }
        } else if (mobileContainer) {
            // Fall back to in-app notification
            
            // Create notification element
            const element = document.createElement('div');
            element.className = `mobile-notification notification-${notification.type}`;
            element.id = notification.id;
            
            // Notification icon
            const icon = document.createElement('div');
            icon.className = 'mobile-notification-icon';
            icon.textContent = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS[NOTIFICATION_TYPES.INFO];
            element.appendChild(icon);
            
            // Notification content
            const content = document.createElement('div');
            content.className = 'mobile-notification-content';
            
            const title = document.createElement('div');
            title.className = 'mobile-notification-title';
            title.textContent = notification.title;
            content.appendChild(title);
            
            const message = document.createElement('div');
            message.className = 'mobile-notification-message';
            message.textContent = notification.message;
            content.appendChild(message);
            
            element.appendChild(content);
            
            // Close button
            const closeButton = document.createElement('button');
            closeButton.className = 'mobile-notification-close';
            closeButton.textContent = '×';
            closeButton.setAttribute('aria-label', 'Close notification');
            
            closeButton.addEventListener('click', function() {
                closeNotification(notification.id);
            });
            
            element.appendChild(closeButton);
            
            // Add click handler for primary action
            if (notification.actions && notification.actions.length > 0) {
                const primaryAction = notification.actions[0];
                
                element.addEventListener('click', function(event) {
                    // Ignore clicks on close button
                    if (event.target !== closeButton && !closeButton.contains(event.target)) {
                        if (typeof primaryAction.handler === 'function') {
                            primaryAction.handler(notification);
                        }
                        
                        // Close notification after action
                        if (primaryAction.closeOnClick !== false) {
                            closeNotification(notification.id);
                        }
                    }
                });
                
                // Add pointer cursor to indicate clickable
                element.style.cursor = 'pointer';
            }
            
            // Add to container
            mobileContainer.appendChild(element);
            
            // Auto-close if specified
            if (notification.autoClose !== false) {
                setTimeout(function() {
                    closeNotification(notification.id);
                }, settings.mobile.duration);
            }
        }
    }
    
    /**
     * Close a notification
     * @param {string} id - The notification ID
     */
    function closeNotification(id) {
        // Mark as read in data model
        DataModel.markNotificationAsRead(id);
        
        // Remove from DOM
        const element = document.getElementById(id);
        
        if (element) {
            // Add closing animation
            element.classList.add('notification-closing');
            
            // Remove after animation
            setTimeout(function() {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
    }
    
    /**
     * Play notification sound
     * @param {string} type - The notification type
     */
    function playNotificationSound(type) {
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Check if sound is enabled for this device
        let soundEnabled = false;
        
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            soundEnabled = settings.desktop.sound;
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            soundEnabled = settings.tablet.sound;
        } else {
            soundEnabled = settings.mobile.sound;
        }
        
        if (!soundEnabled) {
            return;
        }
        
        // Get sound file for notification type
        const soundFile = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS[NOTIFICATION_TYPES.INFO];
        
        // Play sound
        const audio = new Audio(`sounds/${soundFile}`);
        audio.play().catch(error => {
            // Ignore errors (common in browsers that require user interaction for audio)
            console.log('Could not play notification sound:', error);
        });
    }
    
    /**
     * Process the notification queue
     */
    function processNotificationQueue() {
        if (isProcessingQueue || notificationQueue.length === 0 || !navigator.onLine) {
            return;
        }
        
        isProcessingQueue = true;
        
        // Process notifications one by one with a delay
        const processNext = function() {
            if (notificationQueue.length === 0) {
                isProcessingQueue = false;
                return;
            }
            
            const notification = notificationQueue.shift();
            showNotification(notification);
            
            // Process next notification after a delay
            setTimeout(processNext, 1000);
        };
        
        processNext();
    }
    
    /**
     * Update notification settings
     * @param {object} newSettings - The new settings
     */
    function updateSettings(newSettings) {
        settings = {
            ...settings,
            ...newSettings
        };
        
        // Save settings to data model
        DataModel.updateSettings({
            notifications: settings
        });
    }
    
    /**
     * Get notification settings
     * @returns {object} The current notification settings
     */
    function getSettings() {
        return {...settings};
    }
    
    /**
     * Get recent notifications
     * @param {number} limit - Maximum number of notifications to return
     * @returns {Array} Array of notification objects
     */
    function getRecentNotifications(limit = 10) {
        return DataModel.getNotifications(limit);
    }
    
    /**
     * Clear all notifications
     */
    function clearAllNotifications() {
        // Clear from data model
        DataModel.clearNotifications();
        
        // Clear from DOM
        if (desktopContainer) {
            desktopContainer.innerHTML = '';
        }
        
        if (tabletContainer) {
            tabletContainer.innerHTML = '';
        }
        
        if (mobileContainer) {
            mobileContainer.innerHTML = '';
        }
    }
    
    /**
     * Create notification center UI
     * @returns {HTMLElement} The notification center element
     */
    function createNotificationCenter() {
        const container = document.createElement('div');
        container.className = 'notification-center';
        
        // Header
        const header = document.createElement('div');
        header.className = 'notification-center-header';
        
        const title = document.createElement('h3');
        title.textContent = 'Notifications';
        
        const clearButton = document.createElement('button');
        clearButton.className = 'clear-notifications-button';
        clearButton.textContent = 'Clear All';
        clearButton.addEventListener('click', clearAllNotifications);
        
        header.appendChild(title);
        header.appendChild(clearButton);
        container.appendChild(header);
        
        // Notification list
        const list = document.createElement('div');
        list.className = 'notification-list';
        
        // Get recent notifications
        const notifications = getRecentNotifications();
        
        if (notifications.length > 0) {
            notifications.forEach(notification => {
                const item = document.createElement('div');
                item.className = `notification-item notification-${notification.type}`;
                
                // Notification icon
                const icon = document.createElement('div');
                icon.className = 'notification-icon';
                icon.textContent = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS[NOTIFICATION_TYPES.INFO];
                item.appendChild(icon);
                
                // Notification content
                const content = document.createElement('div');
                content.className = 'notification-content';
                
                const itemTitle = document.createElement('div');
                itemTitle.className = 'notification-title';
                itemTitle.textContent = notification.title;
                content.appendChild(itemTitle);
                
                const message = document.createElement('div');
                message.className = 'notification-message';
                message.textContent = notification.message;
                content.appendChild(message);
                
                // Timestamp
                const timestamp = document.createElement('div');
                timestamp.className = 'notification-timestamp';
                
                // Format timestamp
                const date = new Date(notification.timestamp);
                timestamp.textContent = date.toLocaleString();
                
                content.appendChild(timestamp);
                item.appendChild(content);
                
                // Mark as read indicator
                if (notification.read) {
                    item.classList.add('notification-read');
                } else {
                    const unreadIndicator = document.createElement('div');
                    unreadIndicator.className = 'unread-indicator';
                    item.appendChild(unreadIndicator);
                }
                
                list.appendChild(item);
            });
        } else {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-notifications-message';
            emptyMessage.textContent = 'No notifications';
            list.appendChild(emptyMessage);
        }
        
        container.appendChild(list);
        
        // Settings
        const settingsSection = document.createElement('div');
        settingsSection.className = 'notification-settings-section';
        
        const settingsTitle = document.createElement('h4');
        settingsTitle.textContent = 'Notification Settings';
        settingsSection.appendChild(settingsTitle);
        
        // Desktop settings
        const desktopSettings = document.createElement('div');
        desktopSettings.className = 'notification-device-settings';
        
        const desktopTitle = document.createElement('h5');
        desktopTitle.textContent = 'Desktop';
        desktopSettings.appendChild(desktopTitle);
        
        const desktopEnabled = document.createElement('div');
        desktopEnabled.className = 'setting-item';
        
        const desktopEnabledLabel = document.createElement('label');
        desktopEnabledLabel.textContent = 'Enable notifications';
        desktopEnabledLabel.setAttribute('for', 'desktop-notifications-enabled');
        
        const desktopEnabledInput = document.createElement('input');
        desktopEnabledInput.type = 'checkbox';
        desktopEnabledInput.id = 'desktop-notifications-enabled';
        desktopEnabledInput.checked = settings.desktop.enabled;
        
        desktopEnabledInput.addEventListener('change', function() {
            updateSettings({
                desktop: {
                    ...settings.desktop,
                    enabled: this.checked
                }
            });
        });
        
        desktopEnabled.appendChild(desktopEnabledLabel);
        desktopEnabled.appendChild(desktopEnabledInput);
        desktopSettings.appendChild(desktopEnabled);
        
        const desktopSound = document.createElement('div');
        desktopSound.className = 'setting-item';
        
        const desktopSoundLabel = document.createElement('label');
        desktopSoundLabel.textContent = 'Play sound';
        desktopSoundLabel.setAttribute('for', 'desktop-notifications-sound');
        
        const desktopSoundInput = document.createElement('input');
        desktopSoundInput.type = 'checkbox';
        desktopSoundInput.id = 'desktop-notifications-sound';
        desktopSoundInput.checked = settings.desktop.sound;
        
        desktopSoundInput.addEventListener('change', function() {
            updateSettings({
                desktop: {
                    ...settings.desktop,
                    sound: this.checked
                }
            });
        });
        
        desktopSound.appendChild(desktopSoundLabel);
        desktopSound.appendChild(desktopSoundInput);
        desktopSettings.appendChild(desktopSound);
        
        settingsSection.appendChild(desktopSettings);
        
        // Mobile settings
        const mobileSettings = document.createElement('div');
        mobileSettings.className = 'notification-device-settings';
        
        const mobileTitle = document.createElement('h5');
        mobileTitle.textContent = 'Mobile';
        mobileSettings.appendChild(mobileTitle);
        
        const mobileEnabled = document.createElement('div');
        mobileEnabled.className = 'setting-item';
        
        const mobileEnabledLabel = document.createElement('label');
        mobileEnabledLabel.textContent = 'Enable notifications';
        mobileEnabledLabel.setAttribute('for', 'mobile-notifications-enabled');
        
        const mobileEnabledInput = document.createElement('input');
        mobileEnabledInput.type = 'checkbox';
        mobileEnabledInput.id = 'mobile-notifications-enabled';
        mobileEnabledInput.checked = settings.mobile.enabled;
        
        mobileEnabledInput.addEventListener('change', function() {
            updateSettings({
                mobile: {
                    ...settings.mobile,
                    enabled: this.checked
                }
            });
        });
        
        mobileEnabled.appendChild(mobileEnabledLabel);
        mobileEnabled.appendChild(mobileEnabledInput);
        mobileSettings.appendChild(mobileEnabled);
        
        const mobileNative = document.createElement('div');
        mobileNative.className = 'setting-item';
        
        const mobileNativeLabel = document.createElement('label');
        mobileNativeLabel.textContent = 'Use system notifications';
        mobileNativeLabel.setAttribute('for', 'mobile-notifications-native');
        
        const mobileNativeInput = document.createElement('input');
        mobileNativeInput.type = 'checkbox';
        mobileNativeInput.id = 'mobile-notifications-native';
        mobileNativeInput.checked = settings.mobile.useNative;
        
        mobileNativeInput.addEventListener('change', function() {
            updateSettings({
                mobile: {
                    ...settings.mobile,
                    useNative: this.checked
                }
            });
            
            // Request permission if enabled
            if (this.checked && 'Notification' in window) {
                Notification.requestPermission();
            }
        });
        
        mobileNative.appendChild(mobileNativeLabel);
        mobileNative.appendChild(mobileNativeInput);
        mobileSettings.appendChild(mobileNative);
        
        settingsSection.appendChild(mobileSettings);
        container.appendChild(settingsSection);
        
        return container;
    }
    
    // Public API
    return {
        init: init,
        showNotification: showNotification,
        closeNotification: closeNotification,
        getRecentNotifications: getRecentNotifications,
        clearAllNotifications: clearAllNotifications,
        updateSettings: updateSettings,
        getSettings: getSettings,
        createNotificationCenter: createNotificationCenter,
        NOTIFICATION_TYPES: NOTIFICATION_TYPES,
        NOTIFICATION_ICONS: NOTIFICATION_ICONS
    };
})();

