/**
 * @fileoverview AgentUI Advanced Chunk
 * Performance and advanced components
 */

export { AuVirtualList } from '../components/au-virtual-list.js';
export { AuLazy } from '../components/au-lazy.js';
export { AuRepeat } from '../components/au-repeat.js';

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
import '../components/au-repeat.js';
import '../components/au-code.js';
import '../components/au-api-table.js';
import '../components/au-example.js';
import '../components/au-doc-page.js';
