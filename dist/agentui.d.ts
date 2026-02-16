/**
 * AgentUI v2 TypeScript Definitions
 * Complete types for all components
 */

// ============================================
// CORE
// ============================================

/** Component description returned by AuElement.describe() */
export interface ComponentDescription {
    name: string;
    description: string;
    props?: Record<string, { type: string; values?: string[]; default?: any; description?: string }>;
    events?: string[] | { name: string; detail?: string; description?: string }[];
    methods?: string[];
    slots?: string[];
    examples?: string[];
    tips?: string[];
}

export declare class AuElement extends HTMLElement {
    static observedAttributes: string[];
    static baseClass: string;
    static useContainment: boolean;

    /** Returns machine-readable component metadata for AI agent discovery */
    static describe(): ComponentDescription;

    /** Promise that resolves to `this` after the first render in connectedCallback */
    readonly ready: Promise<this>;
    /** Boolean flag: true after first connectedCallback render */
    readonly isReady: boolean;

    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;

    render(): void;
    update(attr: string, newValue: string | null, oldValue: string | null): void;
    cleanup(): void;

    attr(name: string, defaultValue?: string): string;
    has(name: string): boolean;
    emit(name: string, detail?: any): void;
    listen(target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions): void;
    setTimeout(fn: () => void, delay: number): number;
    setInterval(fn: () => void, delay: number): number;
}

export declare function define(tagName: string, ComponentClass: typeof AuElement): void;

/**
 * Returns a Promise that resolves when all AgentUI components are registered.
 * If already ready, resolves immediately (fast path).
 */
export declare function whenReady(): Promise<void>;

// ============================================
// EVENT BUS (LightBus)
// ============================================
export interface EventBus {
    on(event: string, callback: (data: any) => void): () => void;
    once(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    emit(event: string, data?: any): number;
    emitAsync(event: string, data?: any): Promise<number>;
    signal(event: string, data?: any): void;
    request(peerId: string, handler: string, payload?: any): Promise<any>;
    broadcastRequest(handler: string, payload?: any): Promise<Map<string, any>>;
    handle(name: string, handler: (payload: any) => any): () => void;
    unhandle(name: string): void;
    hasListeners(event: string): boolean;
    destroy(): void;
    setMaxListeners(n: number): void;
    readonly peerId: string;
    readonly peers: string[];
    readonly peerCount: number;
    readonly raw: any;
}

export declare const bus: EventBus;

export declare const UIEvents: {
    TOAST_SHOW: 'ui:toast:show';
    TOAST_DISMISS: 'ui:toast:dismiss';
    MODAL_OPEN: 'ui:modal:open';
    MODAL_CLOSE: 'ui:modal:close';
    THEME_CHANGE: 'ui:theme:change';
    TAB_CHANGE: 'ui:tab:change';
    DROPDOWN_SELECT: 'ui:dropdown:select';
    FORM_SUBMIT: 'ui:form:submit';
    FORM_VALIDATE: 'ui:form:validate';
};

export declare function showToast(message: string, options?: {
    severity?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}): void;

export declare const AGENTUI_VERSION: string;
export declare function isDebugEnabled(): boolean;
export declare function enableDebug(): boolean;
export declare function disableDebug(): void;
export declare function getHealth(): { peerId: string; uptime: number; listeners: number };
export declare function getCapabilities(): { peerId: string; capabilities: string[]; meta: any; version: string };
export declare function addInboundHook(fn: (payload: any) => any): () => void;
export declare function addOutboundHook(fn: (payload: any) => any): () => void;
export declare function registerComponent(tag: string, caps: { signals: string[]; options?: any }): void;
export declare function unregisterComponent(tag: string): void;
export declare function getComponentCapabilities(tag: string): any;
export declare function getRegisteredComponents(): Record<string, any>;
export declare function getComponentsForSignal(signal: string): string[];

// ============================================
// REACTIVE STORE
// ============================================
export interface Store<T extends Record<string, any>> {
    /** Reactive state proxy — read and write properties directly */
    readonly state: T;
    /** Subscribe to changes on a specific key or '*' for all changes */
    subscribe(key: keyof T | '*', callback: (...args: any[]) => void): () => void;
    /** Batch multiple changes — subscribers notified once at the end */
    batch(fn: () => void): void;
    /** Get a plain copy of the current state */
    getState(): T;
    /** Replace state properties and notify affected subscribers */
    setState(newState: Partial<T>): void;
    /** Destroy the store — clears all subscribers */
    destroy(): void;
}

export declare function createStore<T extends Record<string, any>>(
    initialState: T,
    options?: { persist?: string }
): Store<T>;

// ============================================
// VIEW TRANSITIONS 
// ============================================
export declare const supportsViewTransitions: boolean;
export declare function transition(updateCallback: () => void | Promise<void>): Promise<void>;
export declare function transitionNamed(updateCallback: () => void | Promise<void>, options?: { name?: string }): Promise<void>;
export declare function navigateWithTransition(path: string, render: () => void): Promise<void>;

// ============================================
// TASK SCHEDULER 
// ============================================
export declare const supportsScheduler: boolean;
export declare function scheduleTask<T>(callback: () => T, priority?: 'user-blocking' | 'user-visible' | 'background'): Promise<T>;
export declare function yieldToMain(): Promise<void>;
export declare function processWithYield<T>(items: T[], process: (item: T, index: number) => void, chunkSize?: number): Promise<void>;
export declare function runBackground<T>(callback: () => T): Promise<T>;
export declare function runImmediate<T>(callback: () => T): Promise<T>;
export declare function afterPaint(): Promise<void>;

// ============================================
// RENDER UTILITIES
// ============================================
export declare const scheduler: { schedule(callback: () => void): void };
export declare function memo<T extends (...args: any[]) => any>(fn: T, keyFn?: (args: any[]) => string): T;
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay?: number): T;
export declare function throttle<T extends (...args: any[]) => any>(fn: T, limit?: number): T;
export declare function createVisibilityObserver(onVisible: (el: Element) => void, options?: IntersectionObserverInit): { observe(el: Element): void; disconnect(): void };
export declare const domBatch: { read(fn: () => void): void; write(fn: () => void): void };
export declare function processInChunks<T>(items: T[], processFn: (item: T, index: number) => void, chunkSize?: number): Promise<void>;

// ============================================
// ROUTER & HTTP
// ============================================

export interface Router {
    on(path: string, handler: (params: Record<string, string>) => void): Router;
    notFound(handler: (path: string) => void): Router;
    navigate(path: string): void;
    start(): Router;
    readonly current: string;
}

export declare const Router: Router;

export interface Http {
    baseURL: string;
    setBaseURL(url: string): void;
    setHeader(key: string, value: string): void;
    get<T = any>(url: string, options?: RequestInit): Promise<T>;
    post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>;
    put<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>;
    delete<T = any>(url: string, options?: RequestInit): Promise<T>;
}

export declare const http: Http;
export declare class HttpError extends Error {
    status: number;
    statusText: string;
    body: string;
}



// ============================================
// THEME
// ============================================
export interface Theme {
    set(mode: 'light' | 'dark' | 'auto'): void;
    toggle(): void;
    get(): 'light' | 'dark';
    readonly current: 'light' | 'dark';
}

export declare const Theme: Theme;

// ============================================
// AGENT API
// ============================================
export declare function getAuComponentTree(): any;
export declare function findByLabel(label: string): HTMLElement | null;
export declare function enableVisualMarkers(): void;
export declare function disableVisualMarkers(): void;
export declare function getMarkerMap(): Map<string, HTMLElement>;
export declare function getMarkerElement(id: string): HTMLElement | null;
export declare function getMCPActions(): any[];
export declare function getErrors(): any[];
export declare function clearErrors(): void;

// ============================================
// COMPONENTS — Layout
// ============================================
export declare class AuStack extends AuElement { }
export declare class AuGrid extends AuElement { }
export declare class AuContainer extends AuElement { }
export declare class AuLayout extends AuElement { }
export declare class AuPage extends AuElement { }
export declare class AuNavbar extends AuElement { }
export declare class AuNavbarBrand extends AuElement { }
export declare class AuNavbarLinks extends AuElement { }
export declare class AuNavbarActions extends AuElement { }
export declare class AuNavItem extends AuElement { }
export declare class AuSidebar extends AuElement { open(): void; close(): void; toggle(): void; }
export declare class AuSidebarItem extends AuElement { }
export declare class AuDrawer extends AuElement { toggle(): void; }
export declare class AuDrawerItem extends AuElement { }
export declare class AuBottomNav extends AuElement { }
export declare class AuDivider extends AuElement { }

// ============================================
// COMPONENTS — Form
// ============================================
export declare class AuButton extends AuElement { }
export declare class AuInput extends AuElement { value: string; focus(): void; }
export declare class AuTextarea extends AuElement { value: string; }
export declare class AuForm extends AuElement { getValues(): Record<string, any>; getFormData(): FormData; validate(): boolean; reset(): void; }
export declare class AuSchemaForm extends AuElement { }
export declare class AuDropdown extends AuElement { value: string; open(): void; close(): void; toggle(): void; }
export declare class AuOption extends AuElement { }
export declare class AuCheckbox extends AuElement { checked: boolean; toggle(): void; }
export declare class AuSwitch extends AuElement { on: boolean; toggle(): void; }
export declare class AuRadioGroup extends AuElement { value: string; }
export declare class AuRadio extends AuElement { }
export declare class AuChip extends AuElement { selected: boolean; }
export declare class AuPromptInput extends AuElement { value: string; }

// ============================================
// COMPONENTS — Display
// ============================================
export declare class AuCard extends AuElement { }
export declare class AuTabs extends AuElement { }
export declare class AuTab extends AuElement { }
export declare class AuAlert extends AuElement { dismiss(): void; }
export declare class AuBadge extends AuElement { }
export declare class AuCallout extends AuElement { }
export declare class AuProgress extends AuElement { }
export declare class AuTable extends AuElement { }
export declare class AuThead extends AuElement { }
export declare class AuTbody extends AuElement { }
export declare class AuTr extends AuElement { }
export declare class AuTh extends AuElement { }
export declare class AuTd extends AuElement { }
export declare class AuDataTable extends AuElement { setData(data: any[]): void; getData(): any[]; sortBy(field: string, dir?: string): void; filter(query: string): void; goToPage(n: number): void; getSelectedRows(): any[]; }
export declare class AuAvatar extends AuElement { }
export declare class AuSkeleton extends AuElement { }
export declare class AuCode extends AuElement { }
export declare class AuCodeBlock extends AuElement { }
export declare class AuMessageBubble extends AuElement { }

// ============================================
// COMPONENTS — Feedback
// ============================================
export declare class AuSpinner extends AuElement { }
export declare class AuModal extends AuElement { open(): void; close(): void; }
export declare class AuConfirm extends AuElement { }
export declare class AuToast extends AuElement { dismiss(): void; }
export declare class AuToastContainer extends AuElement { }
export declare class AuTooltip extends AuElement { show(): void; hide(): void; }
export declare class AuErrorBoundary extends AuElement { }
export declare class AuSplash extends AuElement { }

// ============================================
// COMPONENTS — Utility
// ============================================
export declare class AuThemeToggle extends AuElement { }
export declare class AuIcon extends AuElement { }
export declare class AuFetch extends AuElement { }
export declare class AuLazy extends AuElement { load(): void; }
export declare class AuIf extends AuElement { condition: boolean; }
export declare class AuRepeat extends AuElement { items: any[]; keyFn: (item: any, index: number) => any; renderItem: (item: any, index: number) => string; refresh(): void; }
export declare class AuVirtualList extends AuElement { items: any[]; renderItem: (item: any, index: number) => string; scrollToIndex(index: number): void; }
export declare class AuRouter extends AuElement { }
export declare class AuComponentTree extends AuElement { }
export declare class AuAgentToolbar extends AuElement { }

// ============================================
// COMPONENTS — Documentation
// ============================================
export declare class AuDocPage extends AuElement { }
export declare class AuExample extends AuElement { }
export declare class AuApiTable extends AuElement { }
export declare class AuApiRow extends AuElement { }

export declare const IconNames: string[];

// ============================================
// PROGRAMMATIC DIALOGS
// ============================================
export declare function auConfirm(message: string, options?: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning';
    size?: 'sm' | 'md' | 'lg';
}): Promise<boolean>;

export declare const Toast: {
    show(message: string, options?: { severity?: string; duration?: number; position?: string }): AuToast;
};
