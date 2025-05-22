/**
 * ComponentInterface
 * 
 * Defines the standard API that all components should implement.
 * This ensures consistency across components and makes integration easier.
 */

/**
 * Base component interface that all screen components should implement
 */
export class ComponentInterface {
  /**
   * Initialize the component
   * @param {HTMLElement} container - DOM element to render the component into
   * @param {Object} options - Initialization options
   * @returns {Promise} - Promise that resolves when initialization is complete
   */
  async initialize(container, options = {}) {
    throw new Error('initialize() method must be implemented by component');
  }

  /**
   * Render the component
   * @returns {Promise} - Promise that resolves when rendering is complete
   */
  async render() {
    throw new Error('render() method must be implemented by component');
  }

  /**
   * Destroy the component and clean up resources
   * @returns {Promise} - Promise that resolves when destruction is complete
   */
  async destroy() {
    throw new Error('destroy() method must be implemented by component');
  }

  /**
   * Get the current state of the component
   * @returns {Object} - Component state
   */
  getState() {
    throw new Error('getState() method must be implemented by component');
  }

  /**
   * Set the state of the component
   * @param {Object} newState - New state to set
   * @returns {Promise} - Promise that resolves when state is updated
   */
  async setState(newState) {
    throw new Error('setState() method must be implemented by component');
  }
}

/**
 * Component adapter that wraps a React component to implement the ComponentInterface
 */
export class ReactComponentAdapter extends ComponentInterface {
  /**
   * Create a new ReactComponentAdapter
   * @param {React.Component} Component - React component to adapt
   * @param {Object} props - Initial props for the component
   */
  constructor(Component, props = {}) {
    super();
    this.Component = Component;
    this.props = props;
    this.container = null;
    this.instance = null;
    this.root = null;
  }

  /**
   * Initialize the component
   * @param {HTMLElement} container - DOM element to render the component into
   * @param {Object} options - Initialization options
   * @returns {Promise} - Promise that resolves when initialization is complete
   */
  async initialize(container, options = {}) {
    this.container = container;
    this.props = {
      ...this.props,
      ...options
    };
    
    return Promise.resolve();
  }

  /**
   * Render the component
   * @returns {Promise} - Promise that resolves when rendering is complete
   */
  async render() {
    if (!this.container) {
      throw new Error('Component must be initialized before rendering');
    }
    
    const { createRoot } = await import('react-dom/client');
    const { createElement } = await import('react');
    
    this.root = createRoot(this.container);
    this.root.render(createElement(this.Component, this.props));
    
    return Promise.resolve();
  }

  /**
   * Destroy the component and clean up resources
   * @returns {Promise} - Promise that resolves when destruction is complete
   */
  async destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    
    this.container = null;
    this.instance = null;
    
    return Promise.resolve();
  }

  /**
   * Get the current state of the component
   * @returns {Object} - Component state
   */
  getState() {
    if (this.instance && typeof this.instance.getState === 'function') {
      return this.instance.getState();
    }
    
    return {};
  }

  /**
   * Set the state of the component
   * @param {Object} newState - New state to set
   * @returns {Promise} - Promise that resolves when state is updated
   */
  async setState(newState) {
    if (this.instance && typeof this.instance.setState === 'function') {
      this.instance.setState(newState);
    } else {
      this.props = {
        ...this.props,
        ...newState
      };
      
      if (this.root) {
        await this.render();
      }
    }
    
    return Promise.resolve();
  }
}

/**
 * Create a component adapter for a React component
 * @param {React.Component} Component - React component to adapt
 * @param {Object} props - Initial props for the component
 * @returns {ReactComponentAdapter} - Component adapter
 */
export function createReactAdapter(Component, props = {}) {
  return new ReactComponentAdapter(Component, props);
}

export default {
  ComponentInterface,
  ReactComponentAdapter,
  createReactAdapter
};

