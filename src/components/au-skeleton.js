/**
 * @fileoverview au-skeleton - Skeleton Loader Component
 * 
 * Usage: 
 * <au-skeleton width="200px" height="20px"></au-skeleton>
 * <au-skeleton variant="circle" size="40px"></au-skeleton>
 * <au-skeleton variant="text" lines="3"></au-skeleton>
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuSkeleton extends AuElement {
    static baseClass = 'au-skeleton';
    static observedAttributes = ['variant', 'width', 'height', 'size', 'lines'];


    render() {
        // Idempotent: skip if already rendered (has skeleton line or animation)
        if (this.querySelector('.au-skeleton__line') || this.style.animation) {
            return;
        }

        const variant = this.attr('variant', 'rect');
        const width = this.attr('width', '100%');
        const height = this.attr('height', '20px');
        const size = this.attr('size', '40px');
        const lines = parseInt(this.attr('lines', '1'));

        this.style.display = 'block';

        if (variant === 'text' && lines > 1) {
            // Multiple text lines
            this.innerHTML = Array(lines).fill(0).map((_, i) =>
                `<div class="au-skeleton__line" style="
                    height: 16px;
                    margin-bottom: 8px;
                    width: ${i === lines - 1 ? '70%' : '100%'};
                    background: var(--md-sys-color-surface-container-highest);
                    border-radius: 4px;
                    animation: au-skeleton-pulse 1.5s ease-in-out infinite;
                "></div>`
            ).join('');
        } else {
            this.style.width = variant === 'circle' ? size : width;
            this.style.height = variant === 'circle' ? size : height;
            this.style.borderRadius = variant === 'circle' ? '50%' : '4px';
            this.style.background = 'var(--md-sys-color-surface-container-highest)';
            this.style.animation = 'au-skeleton-pulse 1.5s ease-in-out infinite';
        }

        // Add keyframes if not exist
        if (!document.getElementById('au-skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'au-skeleton-styles';
            style.textContent = `
                @keyframes au-skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    update(attr, newValue, oldValue) {
        this.render();
    }
}

define('au-skeleton', AuSkeleton);
