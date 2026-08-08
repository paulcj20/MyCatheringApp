import '@testing-library/jest-dom/vitest';

// jsdom does not implement IntersectionObserver, which framer-motion's
// `whileInView` relies on. Without this stub, any component using
// `whileInView` (e.g. via motion.div viewport props) throws during render
// under jsdom.
class IntersectionObserverMock {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
