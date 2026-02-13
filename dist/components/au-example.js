import{j as v}from"./chunk-bxze911z.js";import{n as _,o as $}from"./chunk-x9cky97m.js";class z extends _{static baseClass="au-example";static observedAttributes=["title"];#q=!1;render(){let K=this.attr("title","Example"),D=this.querySelector('[slot="demo"]'),F=this.querySelector('[slot="code"]'),J=D?D.innerHTML:"",Q=F?F.textContent:D?D.innerHTML:"";if(D)D.remove();if(F)F.remove();let G=this.#D(Q),V=v(G);this.innerHTML=`
            <div class="au-example__card">
                <div class="au-example__header">
                    <span class="au-example__title">${K}</span>
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
                    ${J}
                </div>
                <div class="au-example__code" style="display: none;">
                    <au-code language="html">${V}</au-code>
                </div>
            </div>
        `,this.#F()}#D(K){let D=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]),F=new Set(["a","abbr","b","bdo","br","cite","code","dfn","em","i","kbd","q","s","samp","small","span","strong","sub","sup","u","var"]),J="",Q=0,G="    ",P=K.replace(/>\s+</g,"><").replace(/\s+/g," ").trim().split(/(<[^>]+>)/g).filter((U)=>U.trim());for(let U=0;U<P.length;U++){let q=P[U].trim();if(!q)continue;let W=q.startsWith("<"),X=q.startsWith("</"),j=q.endsWith("/>")||W&&D.has(q.match(/<\/?(\w+)/)?.[1]?.toLowerCase());if(X)Q=Math.max(0,Q-1);let Y=W?q.match(/<\/?(\w+)/)?.[1]?.toLowerCase():null,Z=Y&&F.has(Y);if(W)if(!Z||X){if(J&&!J.endsWith(`
`))J+=`
`;J+=G.repeat(Q)+q}else J+=q;else J+=q;if(W&&!X&&!j&&!Z)Q++}return J.trim()}#F(){this.style.display="block",this.style.marginBottom="24px";let K=this.querySelector(".au-example__card");if(K)K.style.background="var(--md-sys-color-surface)",K.style.border="1px solid var(--md-sys-color-outline-variant)",K.style.borderRadius="var(--md-sys-shape-corner-large)";let D=this.querySelector(".au-example__header");if(D)D.style.display="flex",D.style.justifyContent="space-between",D.style.alignItems="center",D.style.padding="12px 16px",D.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",D.style.background="var(--md-sys-color-surface-container-low)",D.style.borderRadius="var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0";let F=this.querySelector(".au-example__title");if(F)F.style.fontWeight="500",F.style.fontSize="var(--md-sys-typescale-title-small-size)",F.style.color="var(--md-sys-color-on-surface)",F.style.minWidth="0",F.style.overflow="hidden",F.style.textOverflow="ellipsis",F.style.whiteSpace="nowrap";let J=this.querySelector(".au-example__actions");if(J)J.style.display="flex",J.style.gap="4px";this.querySelectorAll(".au-example__btn").forEach((q)=>{q.style.background="transparent",q.style.border="none",q.style.cursor="pointer",q.style.padding="8px",q.style.borderRadius="50%",q.style.color="var(--md-sys-color-on-surface-variant)",q.style.display="flex",q.style.alignItems="center",q.style.justifyContent="center",q.style.transition="all 0.2s ease"});let G=this.querySelector(".au-example__demo");if(G){G.style.boxSizing="border-box",G.style.width="100%",G.style.maxWidth="100%",G.style.padding="24px",G.style.display="flex",G.style.flexWrap="wrap",G.style.gap="16px",G.style.alignItems="center",G.style.justifyContent="flex-start";let q=new Set(["AU-STACK","AU-GRID","AU-LAYOUT"]);Array.from(G.children).forEach((W)=>{if(!q.has(W.tagName))W.style.flexShrink="0"})}let V=this.querySelector(".au-example__code");if(V)V.style.borderTop="1px solid var(--md-sys-color-outline-variant)";let P=this.querySelector(".au-example__code au-code");if(P){P.style.borderTopLeftRadius="0",P.style.borderTopRightRadius="0",P.style.maxHeight="400px",P.style.overflow="auto";let q=P.querySelector(".au-code__header");if(q)q.style.borderRadius="0"}let U=document.createElement("style");if(U.textContent=`
            .au-example__btn:hover {
                background: var(--md-sys-color-surface-container-high) !important;
                color: var(--md-sys-color-primary) !important;
            }
            .au-example__btn.active {
                background: var(--md-sys-color-primary-container) !important;
                color: var(--md-sys-color-on-primary-container) !important;
            }
        `,!document.querySelector("#au-example-styles"))U.id="au-example-styles",document.head.appendChild(U)}handleAction(K,D,F){if(K==="code"){let J=this.querySelector(".au-example__code");if(J){if(this.#q=!this.#q,J.style.display=this.#q?"block":"none",D.classList.toggle("active",this.#q),this.#q)requestAnimationFrame(()=>{requestAnimationFrame(()=>{let Q=this.closest(".au-layout-main")||document.querySelector(".au-layout-main")||document.documentElement,G=J.getBoundingClientRect(),V=Q.getBoundingClientRect?.()||{top:0,bottom:window.innerHeight};if(G.bottom>V.bottom){let P=G.bottom-V.bottom+20;Q.scrollBy({top:P,behavior:"smooth"})}})})}}else if(K==="link")this.#G(D)}async#G(K){let D=window.location.href;try{await navigator.clipboard.writeText(D),K.style.color="var(--md-sys-color-primary)",this.setTimeout(()=>{K.style.color=""},2000)}catch(F){console.error("Copy failed:",F)}}}$("au-example",z);export{z as AuExample};
