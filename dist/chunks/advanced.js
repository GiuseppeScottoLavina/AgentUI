import{s as j,v as H}from"./chunk-br8thrbp.js";import{z as F}from"./chunk-yx9gxd59.js";import{A as z,B as Z}from"./chunk-vnx9x0yp.js";class L extends z{static baseClass="au-virtual-list";static cssFile=null;static observedAttributes=["item-height","buffer"];#Q=[];#W=(X)=>`<div>${F(X)}</div>`;#Y=0;#X=0;#$=0;#G=null;#U=null;set items(X){this.#Q=X||[],this.#J()}get items(){return this.#Q}set renderItem(X){this.#W=X,this.#J()}connectedCallback(){super.connectedCallback()}render(){let X=parseInt(this.attr("item-height","50"));this.innerHTML=`
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
        `,this.#G=this.querySelector(".au-virtual-list__viewport"),this.#U=this.querySelector(".au-virtual-list__content");let W=H(()=>{this.#Y=this.#G.scrollTop,this.#J()},16);this.listen(this.#G,"scroll",W),this.style.display="block",this.style.height="400px",this.style.overflow="hidden",this.#J()}#J(){if(!this.#G||!this.#Q.length)return;let X=parseInt(this.attr("item-height","50")),W=parseInt(this.attr("buffer","5")),G=this.#G.clientHeight,$=this.#Q.length*X;this.#U.style.height=`${$}px`;let J=Math.max(0,Math.floor(this.#Y/X)-W),Q=Math.ceil(G/X)+W*2,Y=Math.min(this.#Q.length,J+Q);if(J!==this.#X||Y!==this.#$)this.#X=J,this.#$=Y,this.#K()}async#K(){let X=parseInt(this.attr("item-height","50")),W=this.querySelector(".au-virtual-list__items");if(!W)return;let G=this.#Q.slice(this.#X,this.#$),$=50;if(G.length>$&&"scheduler"in window){let Q=[];for(let Y=0;Y<G.length;Y+=$){let U=G.slice(Y,Y+$);if(Q.push(...U.map((O,K)=>{let q=this.#X+Y+K;return`
                        <div class="au-virtual-list__item" style="
                            position: absolute;
                            top: ${q*X}px;
                            left: 0;
                            right: 0;
                            height: ${X}px;
                        " data-index="${q}" data-au-state="visible">
                            ${this.#W(O,q)}
                        </div>
                    `})),Y+$<G.length)await scheduler.yield()}W.innerHTML=Q.join("")}else W.innerHTML=G.map((Q,Y)=>{let U=this.#X+Y;return`
                    <div class="au-virtual-list__item" style="
                        position: absolute;
                        top: ${U*X}px;
                        left: 0;
                        right: 0;
                        height: ${X}px;
                    " data-index="${U}" data-au-state="visible">
                        ${this.#W(Q,U)}
                    </div>
                `}).join("")}scrollToIndex(X){let W=parseInt(this.attr("item-height","50"));this.#G.scrollTop=X*W}}Z("au-virtual-list",L);class R extends z{static baseClass="au-lazy";static observedAttributes=["root-margin","threshold"];#Q=null;#W=!1;connectedCallback(){super.connectedCallback();let X=this.attr("root-margin","200px"),W=parseFloat(this.attr("threshold","0"));this.#Q=new IntersectionObserver((G)=>{if(G[0].isIntersecting&&!this.#W)this.#Y()},{rootMargin:X,threshold:W}),this.#Q.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.#Q?.disconnect()}render(){let X=this.querySelector('[slot="placeholder"]');if(X)X.style.display="block";let W=this.querySelector("template");if(W)W.style.display="none"}#Y(){this.#W=!0,this.#Q?.disconnect();let X=this.querySelector("template"),W=this.querySelector('[slot="placeholder"]');if(X){let G=X.content.cloneNode(!0);this.appendChild(G),X.remove()}if(W)W.remove();this.emit("au-loaded"),this.classList.add("is-loaded")}load(){if(!this.#W)this.#Y()}}Z("au-lazy",R);class x extends z{static baseClass="au-repeat";static observedAttributes=[];#Q=[];#W=(X,W)=>W;#Y=(X)=>`<div>${F(JSON.stringify(X))}</div>`;#X=new Map;set items(X){let W=this.#Q;this.#Q=X||[],j.schedule(()=>this.#$(W))}get items(){return this.#Q}set keyFn(X){this.#W=X}set renderItem(X){this.#Y=X}render(){this.style.display="contents"}#$(X){let W=new Set,G=document.createDocumentFragment();for(let J=0;J<this.#Q.length;J++){let Q=this.#W(this.#Q[J],J);W.add(Q)}for(let[J,Q]of this.#X)if(!W.has(J))Q.remove(),this.#X.delete(J);let $=null;for(let J=0;J<this.#Q.length;J++){let Q=this.#Q[J],Y=this.#W(Q,J),U=this.#X.get(Y);if(!U){let O=document.createElement("div");O.innerHTML=this.#Y(Q,J),U=O.firstElementChild||O,U.dataset.muKey=Y,this.#X.set(Y,U)}else{let O=this.#Y(Q,J);if(U.outerHTML!==O){let K=document.createElement("div");K.innerHTML=O;let q=K.firstElementChild||K;q.dataset.muKey=Y,U.replaceWith(q),this.#X.set(Y,q),U=q}}if($){if(U.previousElementSibling!==$)$.after(U)}else if(this.firstElementChild!==U)this.prepend(U);$=U}}getElement(X){return this.#X.get(X)}refresh(){this.#X.clear(),this.innerHTML="",j.schedule(()=>this.#$([]))}}Z("au-repeat",x);class B extends z{static baseClass="au-code";static observedAttributes=["language"];#Q=null;connectedCallback(){if(super.connectedCallback(),!this.#Q&&!this.querySelector(".au-code__content"))this.#Q=this.textContent}render(){if(this.querySelector(".au-code__content"))return;let X=this.attr("language","html"),W=this.#Q||this.innerHTML,G;if(typeof DOMParser<"u")G=new DOMParser().parseFromString(W,"text/html").documentElement.textContent;else{let O=document.createElement("div");O.innerHTML=W,G=O.textContent}let $=this.#Y(G),J=this.#X($,X),Q=J,Y=J.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),U=this.#W(Y,X);this.innerHTML=`
            <div class="au-code__header">
                <span class="au-code__language">${X.toUpperCase()}</span>
                <button class="au-code__copy" title="Copy code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
            <pre class="au-code__pre"><code class="au-code__content">${U}</code></pre>
        `,this.#$(),this.#G(Q)}#W(X,W){let G=()=>{let $=[],J=0;return{addMarker:(U,O)=>{let K=J++,q=String.fromCharCode(57600+K),P=String.fromCharCode(57344),N=String.fromCharCode(57345),V=P+q+N;return $.push({marker:V,content:U,className:O}),V},resolveMarkers:(U)=>{for(let{marker:O,content:K,className:q}of $)U=U.replace(O,`<span class="${q}">${K}</span>`);return U}}};if(W==="html"||W==="xml"){let{addMarker:$,resolveMarkers:J}=G(),Q=X;return Q=Q.replace(/(&lt;!--[\s\S]*?--&gt;)/g,(Y)=>$(Y,"au-code__comment")),Q=Q.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi,(Y)=>$(Y,"au-code__keyword")),Q=Q.replace(/("[^"]*")/g,(Y)=>$(Y,"au-code__string")),Q=Q.replace(/(\s)([\w-]+)(=)/g,(Y,U,O,K)=>`${U}${$(O,"au-code__attr")}${K}`),Q=Q.replace(/(&lt;\/?)([\w-]+)/g,(Y,U,O)=>`${U}${$(O,"au-code__tag")}`),J(Q)}if(W==="javascript"||W==="js"||W==="typescript"||W==="ts"){let{addMarker:$,resolveMarkers:J}=G(),Q=X;return Q=Q.replace(/(\/\*[\s\S]*?\*\/)/g,(Y)=>$(Y,"au-code__comment")),Q=Q.replace(/(\/\/.*)/g,(Y)=>$(Y,"au-code__comment")),Q=Q.replace(/(`[^`]*`)/g,(Y)=>$(Y,"au-code__string")),Q=Q.replace(/('[^']*'|"[^"]*")/g,(Y)=>$(Y,"au-code__string")),Q=Q.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/gi,(Y)=>$(Y,"au-code__number")),Q=Q.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|async|await|new|this|super|typeof|instanceof|in|of|try|catch|finally|throw|yield|static|get|set)\b/g,(Y)=>$(Y,"au-code__keyword")),Q=Q.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g,(Y)=>$(Y,"au-code__builtin")),Q=Q.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g,(Y,U)=>$(U,"au-code__function")),J(Q)}if(W==="css"||W==="scss"||W==="sass"){let{addMarker:$,resolveMarkers:J}=G(),Q=X;return Q=Q.replace(/(\/\*[\s\S]*?\*\/)/g,(Y)=>$(Y,"au-code__comment")),Q=Q.replace(/('[^']*'|"[^"]*")/g,(Y)=>$(Y,"au-code__string")),Q=Q.replace(/(@[\w-]+)/g,(Y)=>$(Y,"au-code__keyword")),Q=Q.replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)\b/g,(Y,U,O)=>`${$(U,"au-code__number")}${$(O,"au-code__builtin")}`),Q=Q.replace(/\b(\d+\.?\d*)\b/g,(Y)=>$(Y,"au-code__number")),Q=Q.replace(/(#[0-9a-fA-F]{3,8})\b/g,(Y)=>$(Y,"au-code__string")),Q=Q.replace(/\b([\w-]+)\s*:/g,(Y,U)=>`${$(U,"au-code__attr")}:`),Q=Q.replace(/(^|[{,\s])([.#]?[\w-]+)(?=\s*[{,])/gm,(Y,U,O)=>`${U}${$(O,"au-code__tag")}`),J(Q)}if(W==="json"){let{addMarker:$,resolveMarkers:J}=G(),Q=X;return Q=Q.replace(/("[^"]*")\s*:/g,(Y,U)=>`${$(U,"au-code__attr")}:`),Q=Q.replace(/:\s*("[^"]*")/g,(Y,U)=>`: ${$(U,"au-code__string")}`),Q=Q.replace(/:\s*(-?\d+\.?\d*)/g,(Y,U)=>`: ${$(U,"au-code__number")}`),Q=Q.replace(/\b(true|false|null)\b/g,(Y)=>$(Y,"au-code__builtin")),J(Q)}if(W==="bash"||W==="sh"||W==="shell"){let{addMarker:$,resolveMarkers:J}=G(),Q=X;return Q=Q.replace(/(#.*)/g,(Y)=>$(Y,"au-code__comment")),Q=Q.replace(/('[^']*'|"[^"]*")/g,(Y)=>$(Y,"au-code__string")),Q=Q.replace(/(\$\{?\w+\}?)/g,(Y)=>$(Y,"au-code__attr")),Q=Q.replace(/\b(cd|ls|echo|cat|grep|find|sudo|npm|npx|bun|node|git|curl|wget|mkdir|rm|cp|mv|chmod|chown)\b/g,(Y)=>$(Y,"au-code__keyword")),Q=Q.replace(/(\s)(--?[\w-]+)/g,(Y,U,O)=>`${U}${$(O,"au-code__builtin")}`),J(Q)}return X}#Y(X){let W=X.split(`
`);while(W.length>0&&W[0].trim()==="")W.shift();while(W.length>0&&W[W.length-1].trim()==="")W.pop();if(W.length===0)return"";let G=1/0;for(let $ of W){if($.trim()==="")continue;let J=$.match(/^(\s*)/),Q=J?J[1].length:0;G=Math.min(G,Q)}if(G===1/0||G===0)return W.join(`
`);return W.map(($)=>{if($.trim()==="")return"";return $.slice(G)}).join(`
`)}#X(X,W){let $=X.split(`
`),J=[],Q=0;for(let Y=0;Y<$.length;Y++){let U=$[Y].trim();if(U===""){J.push("");continue}let O=0,K=0;if(W==="html"){let P=(U.match(/<[a-zA-Z][^>]*(?<!\/)\s*>/g)||[]).length,N=(U.match(/<\/[^>]+>/g)||[]).length,V=(U.match(/<[^>]+\/>/g)||[]).length;O=P-V,K=N}else{let P=!1,N="";for(let V=0;V<U.length;V++){let _=U[V],w=V>0?U[V-1]:"";if((_==='"'||_==="'"||_==="`")&&w!=="\\"){if(!P)P=!0,N=_;else if(_===N)P=!1}if(!P){if(_==="{"||_==="["||_==="(")O++;if(_==="}"||_==="]"||_===")")K++}}}if((W==="html"?U.startsWith("</"):/^[}\]\)]/.test(U))&&K>0)Q=Math.max(0,Q-1),K--;J.push("    ".repeat(Q)+U),Q=Math.max(0,Q+O-K)}return J.join(`
`)}#$(){if(this.style.display="block",this.style.background="var(--md-sys-color-surface-container-highest)",this.closest("au-example"))this.style.borderTopLeftRadius="0",this.style.borderTopRightRadius="0",this.style.borderBottomLeftRadius="var(--md-sys-shape-corner-medium)",this.style.borderBottomRightRadius="var(--md-sys-shape-corner-medium)";else this.style.borderRadius="var(--md-sys-shape-corner-medium)";this.style.overflow="hidden",this.style.fontFamily="'Fira Code', 'Consolas', monospace",this.style.fontSize="13px";let W=this.querySelector(".au-code__header");if(W)W.style.display="flex",W.style.justifyContent="space-between",W.style.alignItems="center",W.style.padding="8px 16px",W.style.background="var(--md-sys-color-surface-container)",W.style.borderBottom="1px solid var(--md-sys-color-outline-variant)";let G=this.querySelector(".au-code__language");if(G)G.style.fontSize="11px",G.style.fontWeight="600",G.style.color="var(--md-sys-color-primary)",G.style.letterSpacing="0.5px";let $=this.querySelector(".au-code__copy");if($)$.style.background="transparent",$.style.border="none",$.style.cursor="pointer",$.style.color="var(--md-sys-color-on-surface-variant)",$.style.padding="4px",$.style.borderRadius="4px",$.style.display="flex",$.style.transition="all 0.2s ease";let J=this.querySelector(".au-code__pre");if(J)J.style.margin="0",J.style.padding="16px",J.style.overflow="auto",J.style.maxHeight="400px";let Q=this.querySelector(".au-code__content");if(Q)Q.style.color="var(--md-sys-color-on-surface)";let Y=document.createElement("style");Y.textContent=`
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
        `;let U=document.getElementById("au-code-styles");if(U)U.remove();Y.id="au-code-styles",document.head.appendChild(Y)}#G(X){let W=this.querySelector(".au-code__copy");if(W)this.listen(W,"click",async()=>{try{await navigator.clipboard.writeText(X.trim()),W.classList.add("copied"),W.innerHTML=`
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    `,this.setTimeout(()=>{W.classList.remove("copied"),W.innerHTML=`
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        `},2000)}catch(G){console.error("Copy failed:",G)}})}}Z("au-code",B);class I extends z{static baseClass="au-api-table";static observedAttributes=["type"];render(){let X=this.attr("type","attributes"),W=Array.from(this.querySelectorAll("au-api-row")),G={attributes:["Name","Type","Default","Description"],properties:["Name","Type","Description"],methods:["Name","Signature","Description"],events:["Name","Detail","Description"],tokens:["Token","Default","Description"]},$=G[X]||G.attributes,J=W.map((Q)=>({name:Q.getAttribute("name")||"",type:Q.getAttribute("type")||"",default:Q.getAttribute("default")||"-",signature:Q.getAttribute("signature")||"",detail:Q.getAttribute("detail")||"",description:Q.textContent.trim()}));this.innerHTML=`
            <table class="au-api-table__table">
                <thead>
                    <tr>
                        ${$.map((Q)=>`<th>${Q}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${J.map((Q)=>this.#Q(X,Q)).join("")}
                </tbody>
            </table>
        `,this.#W()}#Q(X,W){let G={name:F(W.name),type:F(W.type),default:F(W.default),signature:F(W.signature),detail:F(W.detail),description:F(W.description)};switch(X){case"attributes":return`<tr>
                    <td><code>${G.name}</code></td>
                    <td><code class="type">${G.type}</code></td>
                    <td><code class="default">${G.default}</code></td>
                    <td>${G.description}</td>
                </tr>`;case"properties":return`<tr>
                    <td><code>${G.name}</code></td>
                    <td><code class="type">${G.type}</code></td>
                    <td>${G.description}</td>
                </tr>`;case"methods":return`<tr>
                    <td><code>${G.name}</code></td>
                    <td><code class="signature">${G.signature}</code></td>
                    <td>${G.description}</td>
                </tr>`;case"events":return`<tr>
                    <td><code>${G.name}</code></td>
                    <td><code class="detail">${G.detail}</code></td>
                    <td>${G.description}</td>
                </tr>`;case"tokens":return`<tr>
                    <td><code>${G.name}</code></td>
                    <td><code class="default">${G.default}</code></td>
                    <td>${G.description}</td>
                </tr>`;default:return""}}#W(){this.style.display="block",this.style.overflowX="auto",this.style.marginBottom="24px";let X=this.querySelector(".au-api-table__table");if(X)X.style.width="100%",X.style.borderCollapse="collapse",X.style.fontSize="var(--md-sys-typescale-body-medium-size)";this.querySelectorAll("th").forEach((Y)=>{Y.style.textAlign="left",Y.style.padding="16px",Y.style.height="56px",Y.style.background="var(--md-sys-color-surface-container)",Y.style.fontWeight="500",Y.style.color="var(--md-sys-color-on-surface)",Y.style.borderBottom="1px solid var(--md-sys-color-outline-variant)"}),this.querySelectorAll("td").forEach((Y)=>{Y.style.padding="16px",Y.style.minHeight="52px",Y.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",Y.style.verticalAlign="middle",Y.style.lineHeight="1.5"}),this.querySelectorAll("code").forEach((Y)=>{Y.style.fontFamily="'Fira Code', monospace",Y.style.fontSize="13px",Y.style.padding="2px 6px",Y.style.borderRadius="4px",Y.style.background="var(--md-sys-color-surface-container-highest)"}),this.querySelectorAll("code.type, code.detail").forEach((Y)=>{Y.style.color="var(--md-sys-color-primary)"}),this.querySelectorAll("code.default").forEach((Y)=>{Y.style.color="var(--md-sys-color-secondary)"})}}class A extends z{static baseClass="au-api-row";static observedAttributes=["name","type","default","signature","detail"];render(){}}Z("au-api-table",I);Z("au-api-row",A);class E extends z{static baseClass="au-example";static observedAttributes=["title"];#Q=!1;render(){let X=this.attr("title","Example"),W=this.querySelector('[slot="demo"]'),G=this.querySelector('[slot="code"]'),$=W?W.innerHTML:"",J=G?G.textContent:W?W.innerHTML:"";if(W)W.remove();if(G)G.remove();let Q=this.#W(J),Y=F(Q);this.innerHTML=`
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
                    ${$}
                </div>
                <div class="au-example__code" style="display: none;">
                    <au-code language="html">${Y}</au-code>
                </div>
            </div>
        `,this.#Y()}#W(X){let W=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]),G=new Set(["a","abbr","b","bdo","br","cite","code","dfn","em","i","kbd","q","s","samp","small","span","strong","sub","sup","u","var"]),$="",J=0,Q="    ",U=X.replace(/>\s+</g,"><").replace(/\s+/g," ").trim().split(/(<[^>]+>)/g).filter((O)=>O.trim());for(let O=0;O<U.length;O++){let K=U[O].trim();if(!K)continue;let q=K.startsWith("<"),P=K.startsWith("</"),N=K.endsWith("/>")||q&&W.has(K.match(/<\/?(\w+)/)?.[1]?.toLowerCase());if(P)J=Math.max(0,J-1);let V=q?K.match(/<\/?(\w+)/)?.[1]?.toLowerCase():null,_=V&&G.has(V);if(q)if(!_||P){if($&&!$.endsWith(`
`))$+=`
`;$+=Q.repeat(J)+K}else $+=K;else $+=K;if(q&&!P&&!N&&!_)J++}return $.trim()}#Y(){this.style.display="block",this.style.marginBottom="24px";let X=this.querySelector(".au-example__card");if(X)X.style.background="var(--md-sys-color-surface)",X.style.border="1px solid var(--md-sys-color-outline-variant)",X.style.borderRadius="var(--md-sys-shape-corner-large)";let W=this.querySelector(".au-example__header");if(W)W.style.display="flex",W.style.justifyContent="space-between",W.style.alignItems="center",W.style.padding="12px 16px",W.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",W.style.background="var(--md-sys-color-surface-container-low)",W.style.borderRadius="var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0";let G=this.querySelector(".au-example__title");if(G)G.style.fontWeight="500",G.style.fontSize="var(--md-sys-typescale-title-small-size)",G.style.color="var(--md-sys-color-on-surface)",G.style.minWidth="0",G.style.overflow="hidden",G.style.textOverflow="ellipsis",G.style.whiteSpace="nowrap";let $=this.querySelector(".au-example__actions");if($)$.style.display="flex",$.style.gap="4px";this.querySelectorAll(".au-example__btn").forEach((K)=>{K.style.background="transparent",K.style.border="none",K.style.cursor="pointer",K.style.padding="8px",K.style.borderRadius="50%",K.style.color="var(--md-sys-color-on-surface-variant)",K.style.display="flex",K.style.alignItems="center",K.style.justifyContent="center",K.style.transition="all 0.2s ease"});let Q=this.querySelector(".au-example__demo");if(Q){Q.style.boxSizing="border-box",Q.style.width="100%",Q.style.maxWidth="100%",Q.style.padding="24px",Q.style.display="flex",Q.style.flexWrap="wrap",Q.style.gap="16px",Q.style.alignItems="center",Q.style.justifyContent="flex-start";let K=new Set(["AU-STACK","AU-GRID","AU-LAYOUT"]);Array.from(Q.children).forEach((q)=>{if(!K.has(q.tagName))q.style.flexShrink="0"})}let Y=this.querySelector(".au-example__code");if(Y)Y.style.borderTop="1px solid var(--md-sys-color-outline-variant)";let U=this.querySelector(".au-example__code au-code");if(U){U.style.borderTopLeftRadius="0",U.style.borderTopRightRadius="0",U.style.maxHeight="400px",U.style.overflow="auto";let K=U.querySelector(".au-code__header");if(K)K.style.borderRadius="0"}let O=document.createElement("style");if(O.textContent=`
            .au-example__btn:hover {
                background: var(--md-sys-color-surface-container-high) !important;
                color: var(--md-sys-color-primary) !important;
            }
            .au-example__btn.active {
                background: var(--md-sys-color-primary-container) !important;
                color: var(--md-sys-color-on-primary-container) !important;
            }
        `,!document.querySelector("#au-example-styles"))O.id="au-example-styles",document.head.appendChild(O)}handleAction(X,W,G){if(X==="code"){let $=this.querySelector(".au-example__code");if($){if(this.#Q=!this.#Q,$.style.display=this.#Q?"block":"none",W.classList.toggle("active",this.#Q),this.#Q)requestAnimationFrame(()=>{requestAnimationFrame(()=>{let J=this.closest(".au-layout-main")||document.querySelector(".au-layout-main")||document.documentElement,Q=$.getBoundingClientRect(),Y=J.getBoundingClientRect?.()||{top:0,bottom:window.innerHeight};if(Q.bottom>Y.bottom){let U=Q.bottom-Y.bottom+20;J.scrollBy({top:U,behavior:"smooth"})}})})}}else if(X==="link")this.#X(W)}async#X(X){let W=window.location.href;try{await navigator.clipboard.writeText(W),X.style.color="var(--md-sys-color-primary)",this.setTimeout(()=>{X.style.color=""},2000)}catch(G){console.error("Copy failed:",G)}}}Z("au-example",E);class T extends z{static baseClass="au-doc-page";static observedAttributes=["title","selector","description"];#Q=0;connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.#W())}render(){let X=this.attr("title","Component"),W=this.attr("selector",""),G=this.attr("description",""),$=this.querySelector('[slot="overview"]'),J=this.querySelector('[slot="api"]'),Q=this.querySelector('[slot="styling"]'),Y=this.querySelector('[slot="examples"]'),U=$?$.innerHTML:"",O=J?J.innerHTML:"",K=Q?Q.innerHTML:"",q=Y?Y.innerHTML:"";this.innerHTML=`
            <h1 class="page-title">${X}</h1>
            <p class="page-subtitle">
                ${W?`<code>&lt;${W}&gt;</code> `:""}${G}
            </p>

            <au-tabs active="0" class="au-doc-page__tabs" style="margin-bottom: 24px;">
                <au-tab>OVERVIEW</au-tab>
                <au-tab>API</au-tab>
                <au-tab>STYLING</au-tab>
                <au-tab>EXAMPLES</au-tab>
            </au-tabs>

            <div class="au-doc-page__content au-doc-page__overview">
                ${U}
            </div>
            <div class="au-doc-page__content au-doc-page__api" style="display: none;">
                ${O}
            </div>
            <div class="au-doc-page__content au-doc-page__styling" style="display: none;">
                ${K}
            </div>
            <div class="au-doc-page__content au-doc-page__examples" style="display: none;">
                ${q}
            </div>
        `,this.style.display="block"}#W(){let X=this.querySelector(".au-doc-page__tabs"),W=this.querySelectorAll(".au-doc-page__content");if(X)this.listen(X,"au-tab-change",(G)=>{this.#Q=G.detail.index,W.forEach(($,J)=>{$.style.display=J===this.#Q?"block":"none"})})}}Z("au-doc-page",T);class S{#Q=[];#W=null;#Y="";#X=null;on(X,W){let G=X.replace(/:[a-zA-Z]+/g,"([^/]+)").replace(/\//g,"\\/"),$=(X.match(/:[a-zA-Z]+/g)||[]).map((J)=>J.slice(1));return this.#Q.push({path:X,pattern:new RegExp(`^${G}$`),paramNames:$,handler:W}),this}notFound(X){return this.#W=X,this}navigate(X){window.location.hash=X}get current(){return this.#Y}start(){return this.#X=()=>{let X=window.location.hash.slice(1)||"/";this.#Y=X;for(let W of this.#Q){let G=X.match(W.pattern);if(G){let $={};W.paramNames.forEach((J,Q)=>{$[J]=G[Q+1]}),W.handler($);return}}if(this.#W)this.#W(X)},window.addEventListener("hashchange",this.#X),this.#X(),this}destroy(){if(this.#X)window.removeEventListener("hashchange",this.#X),this.#X=null;this.#Q=[],this.#W=null,this.#Y=""}}var M=new S;var v={baseURL:"",headers:{"Content-Type":"application/json"},setBaseURL(X){this.baseURL=X},setHeader(X,W){this.headers[X]=W},async get(X,W={}){return this.request(X,{...W,method:"GET"})},async post(X,W,G={}){return this.request(X,{...G,method:"POST",body:W})},async put(X,W,G={}){return this.request(X,{...G,method:"PUT",body:W})},async delete(X,W={}){return this.request(X,{...W,method:"DELETE"})},async request(X,W={}){let G=this.baseURL+X,$={method:W.method||"GET",headers:{...this.headers,...W.headers}};if(W.body)$.body=JSON.stringify(W.body);try{let J=await fetch(G,$);if(!J.ok)throw new D(J.status,J.statusText,await J.text());if(J.headers.get("content-type")?.includes("application/json"))return J.json();return J.text()}catch(J){if(J instanceof D)throw J;throw new D(0,"Network Error",J.message)}}};class D extends Error{constructor(X,W,G){super(`HTTP ${X}: ${W}`);this.status=X,this.statusText=W,this.body=G}}export{v as http,M as Router,D as HttpError,L as AuVirtualList,x as AuRepeat,R as AuLazy,E as AuExample,T as AuDocPage,B as AuCode,I as AuApiTable};
