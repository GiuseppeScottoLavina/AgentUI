/**
 * @fileoverview au-avatar - User Avatar Component
 * 
 * Usage: 
 * <au-avatar src="/path/to/image.jpg" alt="John Doe" size="md"></au-avatar>
 * <au-avatar initials="JD" size="lg"></au-avatar>
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuAvatar extends AuElement {
    static baseClass = 'au-avatar';
    static cssFile = null; // CSS is inline/JS only
    static observedAttributes = ['src', 'alt', 'initials', 'size'];


    render() {
        const src = this.attr('src', '');
        const alt = this.attr('alt', '');
        const initials = this.attr('initials', '');
        const size = this.attr('size', 'md');

        const sizeMap = { sm: '32px', md: '40px', lg: '56px', xl: '80px' };
        const fontSize = { sm: '12px', md: '14px', lg: '20px', xl: '28px' };

        this.style.width = sizeMap[size] || size;
        this.style.height = sizeMap[size] || size;
        this.style.borderRadius = '50%';
        this.style.display = 'inline-flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.style.overflow = 'hidden';
        this.style.background = 'var(--md-sys-color-primary-container)';
        this.style.color = 'var(--md-sys-color-on-primary-container)';
        this.style.fontSize = fontSize[size] || '14px';
        this.style.fontWeight = '600';

        this.innerHTML = ''; // Clear existing content

        let generatedInitials = '';
        if (alt) {
            const words = alt.split(' ');
            generatedInitials = words.map(w => w[0]).join('').toUpperCase().slice(0, 2);
        }

        if (src) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = alt; // Safe: setting property, not attribute string
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            img.onerror = () => {
                // Fallback to initials if image fails
                this.innerHTML = '';
                this.#renderInitials(initials, generatedInitials);
            };
            this.appendChild(img);
        } else {
            this.#renderInitials(initials, generatedInitials);
        }
    }

    #renderInitials(initials, generatedInitials) {
        // Initials are derived from short string manipulation, relatively low risk,
        // but let's be safe and use textContent for the span.

        if (initials) {
            const span = document.createElement('span');
            span.textContent = initials.toUpperCase().slice(0, 2);
            this.appendChild(span);
        } else if (generatedInitials) {
            const span = document.createElement('span');
            span.textContent = generatedInitials;
            this.appendChild(span);
        } else {
            // Default user icon
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '60%');
            svg.setAttribute('height', '60%');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('fill', 'currentColor');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 0 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z');

            svg.appendChild(path);
            this.appendChild(svg);
        }
    }

    update(attr, newValue, oldValue) {
        this.render();
    }
}

define('au-avatar', AuAvatar);
