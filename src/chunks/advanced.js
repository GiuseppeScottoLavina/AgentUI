/**
 * @fileoverview AgentUI Advanced Chunk
 * Performance and advanced components
 */

export { AuVirtualList } from '../components/au-virtual-list.js';
export { AuLazy } from '../components/au-lazy.js';
export { AuIf } from '../components/au-if.js';
export { AuRepeat } from '../components/au-repeat.js';
export { AuShow } from '../components/au-show.js';
export { AuPortal } from '../components/au-portal.js';
export { AuIntersection } from '../components/au-intersection.js';
export { AuMedia } from '../components/au-media.js';
export { AuTransition } from '../components/au-transition.js';
export { AuTimer } from '../components/au-timer.js';

// Documentation components (dev only)
export { AuCode } from '../components/au-code.js';
export { AuApiTable } from '../components/au-api-table.js';
export { AuExample } from '../components/au-example.js';
export { AuDocPage } from '../components/au-doc-page.js';

// HTTP and Router (advanced)
export { Router } from '../core/router.js';
export { http, HttpError } from '../core/http.js';

// Auto-register
import '../components/au-virtual-list.js';
import '../components/au-lazy.js';
import '../components/au-if.js';
import '../components/au-repeat.js';
import '../components/au-show.js';
import '../components/au-portal.js';
import '../components/au-intersection.js';
import '../components/au-media.js';
import '../components/au-transition.js';
import '../components/au-timer.js';
import '../components/au-code.js';
import '../components/au-api-table.js';
import '../components/au-example.js';
import '../components/au-doc-page.js';
