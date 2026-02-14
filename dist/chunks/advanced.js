import{u as T,x as A}from"./chunk-p1wb5tk8.js";import{B as Z,C as _,D as S,E as F,F as z}from"./chunk-qrza7c1t.js";class R extends Z{static baseClass="au-virtual-list";static cssFile=null;static observedAttributes=["item-height","buffer"];#Q=[];#W=(X)=>z`<div>${X}</div>`;#Y=0;#X=0;#$=0;#G=null;#U=null;set items(X){this.#Q=X||[],this.#J()}get items(){return this.#Q}set renderItem(X){this.#W=X,this.#J()}connectedCallback(){super.connectedCallback()}render(){let X=parseInt(this.attr("item-height","50"));this.innerHTML=`
            <div class="au-virtual-list__viewport" style="
                height: 100%;
                overflow-y: auto;
                position: relative;
            ">
                <div class="au-virtual-list__content" style="
                    position: relative;
                ">
                    <div class="au-virtual-list__items"></div>
                </div>
            </div>
        `,this.#G=this.querySelector(".au-virtual-list__viewport"),this.#U=this.querySelector(".au-virtual-list__content");let Q=A(()=>{this.#Y=this.#G.scrollTop,this.#J()},16);this.listen(this.#G,"scroll",Q),this.style.display="block",this.style.height="400px",this.style.overflow="hidden",this.#J()}#J(){if(!this.#G||!this.#Q.length)return;let X=parseInt(this.attr("item-height","50")),Q=parseInt(this.attr("buffer","5")),J=this.#G.clientHeight,$=this.#Q.length*X;this.#U.style.height=`${$}px`;let G=Math.max(0,Math.floor(this.#Y/X)-Q),W=Math.ceil(J/X)+Q*2,Y=Math.min(this.#Q.length,G+W);if(G!==this.#X||Y!==this.#$)this.#X=G,this.#$=Y,this.#K()}async#K(){let X=parseInt(this.attr("item-height","50")),Q=this.querySelector(".au-virtual-list__items");if(!Q)return;let J=this.#Q.slice(this.#X,this.#$),$=50;if(J.length>$&&"scheduler"in window){let W=[];for(let Y=0;Y<J.length;Y+=$){let U=J.slice(Y,Y+$);if(W.push(...U.map((O,K)=>{let q=this.#X+Y+K;return`
                        <div class="au-virtual-list__item" style="
                            position: absolute;
                            top: ${q*X}px;
                            left: 0;
                            right: 0;
                            height: ${X}px;
                        " data-index="${q}" data-au-state="visible">
                            ${this.#W(O,q)}
                        </div>
                    `})),Y+$<J.length)await scheduler.yield()}Q.innerHTML=W.join("")}else Q.innerHTML=J.map((W,Y)=>{let U=this.#X+Y;return`
                    <div class="au-virtual-list__item" style="
                        position: absolute;
                        top: ${U*X}px;
                        left: 0;
                        right: 0;
                        height: ${X}px;
                    " data-index="${U}" data-au-state="visible">
                        ${this.#W(W,U)}
                    </div>
                `}).join("")}scrollToIndex(X){let Q=parseInt(this.attr("item-height","50"));this.#G.scrollTop=X*Q}}_("au-virtual-list",R);class x extends Z{static baseClass="au-lazy";static observedAttributes=["root-margin","threshold"];#Q=null;#W=!1;connectedCallback(){super.connectedCallback();let X=this.attr("root-margin","200px"),Q=parseFloat(this.attr("threshold","0"));this.#Q=new IntersectionObserver((J)=>{if(J[0].isIntersecting&&!this.#W)this.#Y()},{rootMargin:X,threshold:Q}),this.#Q.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.#Q?.disconnect()}render(){let X=this.querySelector('[slot="placeholder"]');if(X)X.style.display="block";let Q=this.querySelector("template");if(Q)Q.style.display="none"}#Y(){this.#W=!0,this.#Q?.disconnect();let X=this.querySelector("template"),Q=this.querySelector('[slot="placeholder"]');if(X){let J=X.content.cloneNode(!0);this.appendChild(J),X.remove()}if(Q)Q.remove();this.emit("au-loaded"),this.classList.add("is-loaded")}load(){if(!this.#W)this.#Y()}}_("au-lazy",x);class j extends Z{static baseClass="au-repeat";static observedAttributes=[];#Q=[];#W=(X,Q)=>Q;#Y=(X)=>z`<div>${JSON.stringify(X)}</div>`;#X=new Map;set items(X){let Q=this.#Q;this.#Q=X||[],T.schedule(()=>this.#$(Q))}get items(){return this.#Q}set keyFn(X){this.#W=X}set renderItem(X){this.#Y=X}render(){this.style.display="contents"}#$(X){let Q=new Set,J=document.createDocumentFragment();for(let G=0;G<this.#Q.length;G++){let W=this.#W(this.#Q[G],G);Q.add(W)}for(let[G,W]of this.#X)if(!Q.has(G))W.remove(),this.#X.delete(G);let $=null;for(let G=0;G<this.#Q.length;G++){let W=this.#Q[G],Y=this.#W(W,G),U=this.#X.get(Y);if(!U){let O=document.createElement("div");O.innerHTML=this.#Y(W,G),U=O.firstElementChild||O,U.dataset.muKey=Y,this.#X.set(Y,U)}else{let O=this.#Y(W,G);if(U.outerHTML!==O){let K=document.createElement("div");K.innerHTML=O;let q=K.firstElementChild||K;q.dataset.muKey=Y,U.replaceWith(q),this.#X.set(Y,q),U=q}}if($){if(U.previousElementSibling!==$)$.after(U)}else if(this.firstElementChild!==U)this.prepend(U);$=U}}getElement(X){return this.#X.get(X)}refresh(){this.#X.clear(),this.innerHTML="",T.schedule(()=>this.#$([]))}}_("au-repeat",j);class B extends Z{static baseClass="au-code";static observedAttributes=["language"];#Q=null;connectedCallback(){if(super.connectedCallback(),!this.#Q&&!this.querySelector(".au-code__content"))this.#Q=this.textContent}render(){if(this.querySelector(".au-code__content"))return;let X=this.attr("language","html"),Q=this.#Q||this.innerHTML,J;if(typeof DOMParser<"u")J=new DOMParser().parseFromString(Q,"text/html").documentElement.textContent;else{let O=document.createElement("div");O.innerHTML=Q,J=O.textContent}let $=this.#Y(J),G=this.#X($,X),W=G,Y=G.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),U=this.#W(Y,X);this.innerHTML=z`
            <div class="au-code__header">
                <span class="au-code__language">${X.toUpperCase()}</span>
                <button class="au-code__copy" title="Copy code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
            <pre class="au-code__pre"><code class="au-code__content">${F(U)}</code></pre>
        `,this.#$(),this.#G(W)}#W(X,Q){let J=()=>{let $=[],G=0;return{addMarker:(U,O)=>{let K=G++,q=String.fromCharCode(57600+K),P=String.fromCharCode(57344),L=String.fromCharCode(57345),V=P+q+L;return $.push({marker:V,content:U,className:O}),V},resolveMarkers:(U)=>{for(let{marker:O,content:K,className:q}of $)U=U.replace(O,`<span class="${q}">${K}</span>`);return U}}};if(Q==="html"||Q==="xml"){let{addMarker:$,resolveMarkers:G}=J(),W=X;return W=W.replace(/(&lt;!--[\s\S]*?--&gt;)/g,(Y)=>$(Y,"au-code__comment")),W=W.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi,(Y)=>$(Y,"au-code__keyword")),W=W.replace(/("[^"]*")/g,(Y)=>$(Y,"au-code__string")),W=W.replace(/(\s)([\w-]+)(=)/g,(Y,U,O,K)=>`${U}${$(O,"au-code__attr")}${K}`),W=W.replace(/(&lt;\/?)([\w-]+)/g,(Y,U,O)=>`${U}${$(O,"au-code__tag")}`),G(W)}if(Q==="javascript"||Q==="js"||Q==="typescript"||Q==="ts"){let{addMarker:$,resolveMarkers:G}=J(),W=X;return W=W.replace(/(\/\*[\s\S]*?\*\/)/g,(Y)=>$(Y,"au-code__comment")),W=W.replace(/(\/\/.*)/g,(Y)=>$(Y,"au-code__comment")),W=W.replace(/(`[^`]*`)/g,(Y)=>$(Y,"au-code__string")),W=W.replace(/('[^']*'|"[^"]*")/g,(Y)=>$(Y,"au-code__string")),W=W.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/gi,(Y)=>$(Y,"au-code__number")),W=W.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|async|await|new|this|super|typeof|instanceof|in|of|try|catch|finally|throw|yield|static|get|set)\b/g,(Y)=>$(Y,"au-code__keyword")),W=W.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g,(Y)=>$(Y,"au-code__builtin")),W=W.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g,(Y,U)=>$(U,"au-code__function")),G(W)}if(Q==="css"||Q==="scss"||Q==="sass"){let{addMarker:$,resolveMarkers:G}=J(),W=X;return W=W.replace(/(\/\*[\s\S]*?\*\/)/g,(Y)=>$(Y,"au-code__comment")),W=W.replace(/('[^']*'|"[^"]*")/g,(Y)=>$(Y,"au-code__string")),W=W.replace(/(@[\w-]+)/g,(Y)=>$(Y,"au-code__keyword")),W=W.replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)\b/g,(Y,U,O)=>`${$(U,"au-code__number")}${$(O,"au-code__builtin")}`),W=W.replace(/\b(\d+\.?\d*)\b/g,(Y)=>$(Y,"au-code__number")),W=W.replace(/(#[0-9a-fA-F]{3,8})\b/g,(Y)=>$(Y,"au-code__string")),W=W.replace(/\b([\w-]+)\s*:/g,(Y,U)=>`${$(U,"au-code__attr")}:`),W=W.replace(/(^|[{,\s])([.#]?[\w-]+)(?=\s*[{,])/gm,(Y,U,O)=>`${U}${$(O,"au-code__tag")}`),G(W)}if(Q==="json"){let{addMarker:$,resolveMarkers:G}=J(),W=X;return W=W.replace(/("[^"]*")\s*:/g,(Y,U)=>`${$(U,"au-code__attr")}:`),W=W.replace(/:\s*("[^"]*")/g,(Y,U)=>`: ${$(U,"au-code__string")}`),W=W.replace(/:\s*(-?\d+\.?\d*)/g,(Y,U)=>`: ${$(U,"au-code__number")}`),W=W.replace(/\b(true|false|null)\b/g,(Y)=>$(Y,"au-code__builtin")),G(W)}if(Q==="bash"||Q==="sh"||Q==="shell"){let{addMarker:$,resolveMarkers:G}=J(),W=X;return W=W.replace(/(#.*)/g,(Y)=>$(Y,"au-code__comment")),W=W.replace(/('[^']*'|"[^"]*")/g,(Y)=>$(Y,"au-code__string")),W=W.replace(/(\$\{?\w+\}?)/g,(Y)=>$(Y,"au-code__attr")),W=W.replace(/\b(cd|ls|echo|cat|grep|find|sudo|npm|npx|bun|node|git|curl|wget|mkdir|rm|cp|mv|chmod|chown)\b/g,(Y)=>$(Y,"au-code__keyword")),W=W.replace(/(\s)(--?[\w-]+)/g,(Y,U,O)=>`${U}${$(O,"au-code__builtin")}`),G(W)}return X}#Y(X){let Q=X.split(`
`);while(Q.length>0&&Q[0].trim()==="")Q.shift();while(Q.length>0&&Q[Q.length-1].trim()==="")Q.pop();if(Q.length===0)return"";let J=1/0;for(let $ of Q){if($.trim()==="")continue;let G=$.match(/^(\s*)/),W=G?G[1].length:0;J=Math.min(J,W)}if(J===1/0||J===0)return Q.join(`
`);return Q.map(($)=>{if($.trim()==="")return"";return $.slice(J)}).join(`
`)}#X(X,Q){let $=X.split(`
`),G=[],W=0;for(let Y=0;Y<$.length;Y++){let U=$[Y].trim();if(U===""){G.push("");continue}let O=0,K=0;if(Q==="html"){let P=(U.match(/<[a-zA-Z][^>]*(?<!\/)\s*>/g)||[]).length,L=(U.match(/<\/[^>]+>/g)||[]).length,V=(U.match(/<[^>]+\/>/g)||[]).length;O=P-V,K=L}else{let P=!1,L="";for(let V=0;V<U.length;V++){let D=U[V],f=V>0?U[V-1]:"";if((D==='"'||D==="'"||D==="`")&&f!=="\\"){if(!P)P=!0,L=D;else if(D===L)P=!1}if(!P){if(D==="{"||D==="["||D==="(")O++;if(D==="}"||D==="]"||D===")")K++}}}if((Q==="html"?U.startsWith("</"):/^[}\]\)]/.test(U))&&K>0)W=Math.max(0,W-1),K--;G.push("    ".repeat(W)+U),W=Math.max(0,W+O-K)}return G.join(`
`)}#$(){if(this.style.display="block",this.style.background="var(--md-sys-color-surface-container-highest)",this.closest("au-example"))this.style.borderTopLeftRadius="0",this.style.borderTopRightRadius="0",this.style.borderBottomLeftRadius="var(--md-sys-shape-corner-medium)",this.style.borderBottomRightRadius="var(--md-sys-shape-corner-medium)";else this.style.borderRadius="var(--md-sys-shape-corner-medium)";this.style.overflow="hidden",this.style.fontFamily="'Fira Code', 'Consolas', monospace",this.style.fontSize="13px";let Q=this.querySelector(".au-code__header");if(Q)Q.style.display="flex",Q.style.justifyContent="space-between",Q.style.alignItems="center",Q.style.padding="8px 16px",Q.style.background="var(--md-sys-color-surface-container)",Q.style.borderBottom="1px solid var(--md-sys-color-outline-variant)";let J=this.querySelector(".au-code__language");if(J)J.style.fontSize="11px",J.style.fontWeight="600",J.style.color="var(--md-sys-color-primary)",J.style.letterSpacing="0.5px";let $=this.querySelector(".au-code__copy");if($)$.style.background="transparent",$.style.border="none",$.style.cursor="pointer",$.style.color="var(--md-sys-color-on-surface-variant)",$.style.padding="4px",$.style.borderRadius="4px",$.style.display="flex",$.style.transition="all 0.2s ease";let G=this.querySelector(".au-code__pre");if(G)G.style.margin="0",G.style.padding="16px",G.style.overflow="auto",G.style.maxHeight="400px";let W=this.querySelector(".au-code__content");if(W)W.style.color="var(--md-sys-color-on-surface)";let Y=document.createElement("style");Y.textContent=`
            .au-code__tag { color: var(--md-sys-color-primary); }
            .au-code__attr { color: var(--md-sys-color-tertiary); }
            .au-code__string { color: var(--md-sys-color-secondary); }
            .au-code__keyword { color: var(--md-sys-color-primary); font-weight: 500; }
            .au-code__comment { color: var(--md-sys-color-outline); font-style: italic; }
            .au-code__number { color: var(--md-sys-color-error); }
            .au-code__function { color: var(--md-sys-color-tertiary); }
            .au-code__builtin { color: var(--md-sys-color-primary); font-weight: 500; }
            .au-code__copy:hover { 
                background: var(--md-sys-color-primary-container) !important;
                color: var(--md-sys-color-on-primary-container) !important;
            }
            .au-code__copy:active {
                background: var(--md-sys-color-primary) !important;
                color: var(--md-sys-color-on-primary) !important;
                transform: scale(0.95);
            }
            .au-code__copy.copied {
                background: #c8e6c9 !important;
                color: #1b5e20 !important;
            }
        `;let U=document.getElementById("au-code-styles");if(U)U.remove();Y.id="au-code-styles",document.head.appendChild(Y)}#G(X){let Q=this.querySelector(".au-code__copy");if(Q)this.listen(Q,"click",async()=>{try{await navigator.clipboard.writeText(X.trim()),Q.classList.add("copied"),Q.innerHTML=`
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    `,this.setTimeout(()=>{Q.classList.remove("copied"),Q.innerHTML=`
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        `},2000)}catch(J){console.error("Copy failed:",J)}})}}_("au-code",B);class I extends Z{static baseClass="au-api-table";static observedAttributes=["type"];render(){let X=this.attr("type","attributes"),Q=Array.from(this.querySelectorAll("au-api-row")),J={attributes:["Name","Type","Default","Description"],properties:["Name","Type","Description"],methods:["Name","Signature","Description"],events:["Name","Detail","Description"],tokens:["Token","Default","Description"]},$=J[X]||J.attributes,G=Q.map((W)=>({name:W.getAttribute("name")||"",type:W.getAttribute("type")||"",default:W.getAttribute("default")||"-",signature:W.getAttribute("signature")||"",detail:W.getAttribute("detail")||"",description:W.textContent.trim()}));this.innerHTML=`
            <table class="au-api-table__table">
                <thead>
                    <tr>
                        ${$.map((W)=>`<th>${W}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${G.map((W)=>this.#Q(X,W)).join("")}
                </tbody>
            </table>
        `,this.#W()}#Q(X,Q){switch(X){case"attributes":return z`<tr>
                    <td><code>${Q.name}</code></td>
                    <td><code class="type">${Q.type}</code></td>
                    <td><code class="default">${Q.default}</code></td>
                    <td>${Q.description}</td>
                </tr>`;case"properties":return z`<tr>
                    <td><code>${Q.name}</code></td>
                    <td><code class="type">${Q.type}</code></td>
                    <td>${Q.description}</td>
                </tr>`;case"methods":return z`<tr>
                    <td><code>${Q.name}</code></td>
                    <td><code class="signature">${Q.signature}</code></td>
                    <td>${Q.description}</td>
                </tr>`;case"events":return z`<tr>
                    <td><code>${Q.name}</code></td>
                    <td><code class="detail">${Q.detail}</code></td>
                    <td>${Q.description}</td>
                </tr>`;case"tokens":return z`<tr>
                    <td><code>${Q.name}</code></td>
                    <td><code class="default">${Q.default}</code></td>
                    <td>${Q.description}</td>
                </tr>`;default:return""}}#W(){this.style.display="block",this.style.overflowX="auto",this.style.marginBottom="24px";let X=this.querySelector(".au-api-table__table");if(X)X.style.width="100%",X.style.borderCollapse="collapse",X.style.fontSize="var(--md-sys-typescale-body-medium-size)";this.querySelectorAll("th").forEach((Y)=>{Y.style.textAlign="left",Y.style.padding="16px",Y.style.height="56px",Y.style.background="var(--md-sys-color-surface-container)",Y.style.fontWeight="500",Y.style.color="var(--md-sys-color-on-surface)",Y.style.borderBottom="1px solid var(--md-sys-color-outline-variant)"}),this.querySelectorAll("td").forEach((Y)=>{Y.style.padding="16px",Y.style.minHeight="52px",Y.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",Y.style.verticalAlign="middle",Y.style.lineHeight="1.5"}),this.querySelectorAll("code").forEach((Y)=>{Y.style.fontFamily="'Fira Code', monospace",Y.style.fontSize="13px",Y.style.padding="2px 6px",Y.style.borderRadius="4px",Y.style.background="var(--md-sys-color-surface-container-highest)"}),this.querySelectorAll("code.type, code.detail").forEach((Y)=>{Y.style.color="var(--md-sys-color-primary)"}),this.querySelectorAll("code.default").forEach((Y)=>{Y.style.color="var(--md-sys-color-secondary)"})}}class M extends Z{static baseClass="au-api-row";static observedAttributes=["name","type","default","signature","detail"];render(){}}_("au-api-table",I);_("au-api-row",M);class E extends Z{static baseClass="au-example";static observedAttributes=["title"];#Q=!1;render(){let X=this.attr("title","Example"),Q=this.querySelector('[slot="demo"]'),J=this.querySelector('[slot="code"]'),$=Q?Q.innerHTML:"",G=J?J.textContent:Q?Q.innerHTML:"";if(Q)Q.remove();if(J)J.remove();let W=this.#W(G),Y=S(W);this.innerHTML=z`
            <div class="au-example__card">
                <div class="au-example__header">
                    <span class="au-example__title">${X}</span>
                    <div class="au-example__actions">
                        <button class="au-example__btn" data-action="link" title="Copy link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                            </svg>
                        </button>
                        <button class="au-example__btn" data-action="code" title="View source">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="16 18 22 12 16 6"/>
                                <polyline points="8 6 2 12 8 18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="au-example__demo">
                    ${F($)}
                </div>
                <div class="au-example__code" style="display: none;">
                    <au-code language="html">${F(Y)}</au-code>
                </div>
            </div>
        `,this.#Y()}#W(X){let Q=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]),J=new Set(["a","abbr","b","bdo","br","cite","code","dfn","em","i","kbd","q","s","samp","small","span","strong","sub","sup","u","var"]),$="",G=0,W="    ",U=X.replace(/>\s+</g,"><").replace(/\s+/g," ").trim().split(/(<[^>]+>)/g).filter((O)=>O.trim());for(let O=0;O<U.length;O++){let K=U[O].trim();if(!K)continue;let q=K.startsWith("<"),P=K.startsWith("</"),L=K.endsWith("/>")||q&&Q.has(K.match(/<\/?(\w+)/)?.[1]?.toLowerCase());if(P)G=Math.max(0,G-1);let V=q?K.match(/<\/?(\w+)/)?.[1]?.toLowerCase():null,D=V&&J.has(V);if(q)if(!D||P){if($&&!$.endsWith(`
`))$+=`
`;$+=W.repeat(G)+K}else $+=K;else $+=K;if(q&&!P&&!L&&!D)G++}return $.trim()}#Y(){this.style.display="block",this.style.marginBottom="24px";let X=this.querySelector(".au-example__card");if(X)X.style.background="var(--md-sys-color-surface)",X.style.border="1px solid var(--md-sys-color-outline-variant)",X.style.borderRadius="var(--md-sys-shape-corner-large)";let Q=this.querySelector(".au-example__header");if(Q)Q.style.display="flex",Q.style.justifyContent="space-between",Q.style.alignItems="center",Q.style.padding="12px 16px",Q.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",Q.style.background="var(--md-sys-color-surface-container-low)",Q.style.borderRadius="var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0";let J=this.querySelector(".au-example__title");if(J)J.style.fontWeight="500",J.style.fontSize="var(--md-sys-typescale-title-small-size)",J.style.color="var(--md-sys-color-on-surface)",J.style.minWidth="0",J.style.overflow="hidden",J.style.textOverflow="ellipsis",J.style.whiteSpace="nowrap";let $=this.querySelector(".au-example__actions");if($)$.style.display="flex",$.style.gap="4px";this.querySelectorAll(".au-example__btn").forEach((K)=>{K.style.background="transparent",K.style.border="none",K.style.cursor="pointer",K.style.padding="8px",K.style.borderRadius="50%",K.style.color="var(--md-sys-color-on-surface-variant)",K.style.display="flex",K.style.alignItems="center",K.style.justifyContent="center",K.style.transition="all 0.2s ease"});let W=this.querySelector(".au-example__demo");if(W){W.style.boxSizing="border-box",W.style.width="100%",W.style.maxWidth="100%",W.style.padding="24px",W.style.display="flex",W.style.flexWrap="wrap",W.style.gap="16px",W.style.alignItems="center",W.style.justifyContent="flex-start";let K=new Set(["AU-STACK","AU-GRID","AU-LAYOUT"]);Array.from(W.children).forEach((q)=>{if(!K.has(q.tagName))q.style.flexShrink="0"})}let Y=this.querySelector(".au-example__code");if(Y)Y.style.borderTop="1px solid var(--md-sys-color-outline-variant)";let U=this.querySelector(".au-example__code au-code");if(U){U.style.borderTopLeftRadius="0",U.style.borderTopRightRadius="0",U.style.maxHeight="400px",U.style.overflow="auto";let K=U.querySelector(".au-code__header");if(K)K.style.borderRadius="0"}let O=document.createElement("style");if(O.textContent=`
            .au-example__btn:hover {
                background: var(--md-sys-color-surface-container-high) !important;
                color: var(--md-sys-color-primary) !important;
            }
            .au-example__btn.active {
                background: var(--md-sys-color-primary-container) !important;
                color: var(--md-sys-color-on-primary-container) !important;
            }
        `,!document.querySelector("#au-example-styles"))O.id="au-example-styles",document.head.appendChild(O)}handleAction(X,Q,J){if(X==="code"){let $=this.querySelector(".au-example__code");if($){if(this.#Q=!this.#Q,$.style.display=this.#Q?"block":"none",Q.classList.toggle("active",this.#Q),this.#Q)requestAnimationFrame(()=>{requestAnimationFrame(()=>{let G=this.closest(".au-layout-main")||document.querySelector(".au-layout-main")||document.documentElement,W=$.getBoundingClientRect(),Y=G.getBoundingClientRect?.()||{top:0,bottom:window.innerHeight};if(W.bottom>Y.bottom){let U=W.bottom-Y.bottom+20;G.scrollBy({top:U,behavior:"smooth"})}})})}}else if(X==="link")this.#X(Q)}async#X(X){let Q=window.location.href;try{await navigator.clipboard.writeText(Q),X.style.color="var(--md-sys-color-primary)",this.setTimeout(()=>{X.style.color=""},2000)}catch(J){console.error("Copy failed:",J)}}}_("au-example",E);class H extends Z{static baseClass="au-doc-page";static observedAttributes=["title","selector","description"];#Q=0;connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.#W())}render(){let X=this.attr("title","Component"),Q=this.attr("selector",""),J=this.attr("description",""),$=this.querySelector('[slot="overview"]'),G=this.querySelector('[slot="api"]'),W=this.querySelector('[slot="styling"]'),Y=this.querySelector('[slot="examples"]'),U=$?$.innerHTML:"",O=G?G.innerHTML:"",K=W?W.innerHTML:"",q=Y?Y.innerHTML:"";this.innerHTML=z`
            <h1 class="page-title">${X}</h1>
            <p class="page-subtitle">
                ${Q?z`<code>&lt;${Q}&gt;</code> `:""}${J}
            </p>

            <au-tabs active="0" class="au-doc-page__tabs" style="margin-bottom: 24px;">
                <au-tab>OVERVIEW</au-tab>
                <au-tab>API</au-tab>
                <au-tab>STYLING</au-tab>
                <au-tab>EXAMPLES</au-tab>
            </au-tabs>

            <div class="au-doc-page__content au-doc-page__overview">
                ${F(U)}
            </div>
            <div class="au-doc-page__content au-doc-page__api" style="display: none;">
                ${F(O)}
            </div>
            <div class="au-doc-page__content au-doc-page__styling" style="display: none;">
                ${F(K)}
            </div>
            <div class="au-doc-page__content au-doc-page__examples" style="display: none;">
                ${F(q)}
            </div>
        `,this.style.display="block"}#W(){let X=this.querySelector(".au-doc-page__tabs"),Q=this.querySelectorAll(".au-doc-page__content");if(X)this.listen(X,"au-tab-change",(J)=>{this.#Q=J.detail.index,Q.forEach(($,G)=>{$.style.display=G===this.#Q?"block":"none"})})}}_("au-doc-page",H);class w{#Q=[];#W=null;#Y="";#X=null;on(X,Q){let J=X.replace(/:[a-zA-Z]+/g,"([^/]+)").replace(/\//g,"\\/"),$=(X.match(/:[a-zA-Z]+/g)||[]).map((G)=>G.slice(1));return this.#Q.push({path:X,pattern:new RegExp(`^${J}$`),paramNames:$,handler:Q}),this}notFound(X){return this.#W=X,this}navigate(X){window.location.hash=X}get current(){return this.#Y}start(){return this.#X=()=>{let X=window.location.hash.slice(1)||"/";this.#Y=X;for(let Q of this.#Q){let J=X.match(Q.pattern);if(J){let $={};Q.paramNames.forEach((G,W)=>{$[G]=J[W+1]}),Q.handler($);return}}if(this.#W)this.#W(X)},window.addEventListener("hashchange",this.#X),this.#X(),this}destroy(){if(this.#X)window.removeEventListener("hashchange",this.#X),this.#X=null;this.#Q=[],this.#W=null,this.#Y=""}}var v=new w;var C={baseURL:"",headers:{"Content-Type":"application/json"},setBaseURL(X){this.baseURL=X},setHeader(X,Q){this.headers[X]=Q},async get(X,Q={}){return this.request(X,{...Q,method:"GET"})},async post(X,Q,J={}){return this.request(X,{...J,method:"POST",body:Q})},async put(X,Q,J={}){return this.request(X,{...J,method:"PUT",body:Q})},async delete(X,Q={}){return this.request(X,{...Q,method:"DELETE"})},async request(X,Q={}){let J=this.baseURL+X,$={method:Q.method||"GET",headers:{...this.headers,...Q.headers}};if(Q.body)$.body=JSON.stringify(Q.body);try{let G=await fetch(J,$);if(!G.ok)throw new N(G.status,G.statusText,await G.text());if(G.headers.get("content-type")?.includes("application/json"))return G.json();return G.text()}catch(G){if(G instanceof N)throw G;throw new N(0,"Network Error",G.message)}}};class N extends Error{constructor(X,Q,J){super(`HTTP ${X}: ${Q}`);this.status=X,this.statusText=Q,this.body=J}}export{C as http,v as Router,N as HttpError,R as AuVirtualList,j as AuRepeat,x as AuLazy,E as AuExample,H as AuDocPage,B as AuCode,I as AuApiTable};
