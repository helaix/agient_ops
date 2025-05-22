/**
 * EventBus
 * 
 * A simple event bus for cross-component communication.
 * Components can subscribe to events and publish events to communicate with each other.
 */

class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to be called when event is published
   * @param {Object} context - Context to bind the callback to
   * @returns {Function} - Unsubscribe function
   */
  subscribe(event, callback, context = null) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    const subscribers = this.subscribers.get(event);
    const subscriber = { callback, context };
    subscribers.push(subscriber);

    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to subscribers
   */
  publish(event, data) {
    if (!this.subscribers.has(event)) {
      return;
    }

    const subscribers = this.subscribers.get(event);
    subscribers.forEach(subscriber => {
      try {
        if (subscriber.context) {
          subscriber.callback.call(subscriber.context, data);
        } else {
          subscriber.callback(data);
        }
      } catch (error) {
        console.error(`Error in event subscriber for "${event}":`, error);
      }
    });
  }

  /**
   * Clear all subscribers for an event
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }

  /**
   * Get the number of subscribers for an event
   * @param {string} event - Event name
   * @returns {number} - Number of subscribers
   */
  getSubscriberCount(event) {
    if (!this.subscribers.has(event)) {
      return 0;
    }
    return this.subscribers.get(event).length;
  }
}

// Create and export a singleton instance
const eventBus = new EventBus();
export default eventBus;

