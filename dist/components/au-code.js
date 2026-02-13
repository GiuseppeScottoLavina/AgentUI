import{n as _,o as $}from"./chunk-x9cky97m.js";class q extends _{static baseClass="au-code";static observedAttributes=["language"];#z=null;connectedCallback(){if(super.connectedCallback(),!this.#z&&!this.querySelector(".au-code__content"))this.#z=this.textContent}render(){if(this.querySelector(".au-code__content"))return;let R=this.attr("language","html"),J=this.#z||this.innerHTML,P;if(typeof DOMParser<"u")P=new DOMParser().parseFromString(J,"text/html").documentElement.textContent;else{let Q=document.createElement("div");Q.innerHTML=J,P=Q.textContent}let G=this.#G(P),O=this.#J(G,R),z=O,F=O.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),K=this.#F(F,R);this.innerHTML=`
            <div class="au-code__header">
                <span class="au-code__language">${R.toUpperCase()}</span>
                <button class="au-code__copy" title="Copy code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
            <pre class="au-code__pre"><code class="au-code__content">${K}</code></pre>
        `,this.#K(),this.#O(z)}#F(R,J){let P=()=>{let G=[],O=0;return{addMarker:(K,Q)=>{let U=O++,Z=String.fromCharCode(57600+U),X=String.fromCharCode(57344),Y=String.fromCharCode(57345),W=X+Z+Y;return G.push({marker:W,content:K,className:Q}),W},resolveMarkers:(K)=>{for(let{marker:Q,content:U,className:Z}of G)K=K.replace(Q,`<span class="${Z}">${U}</span>`);return K}}};if(J==="html"||J==="xml"){let{addMarker:G,resolveMarkers:O}=P(),z=R;return z=z.replace(/(&lt;!--[\s\S]*?--&gt;)/g,(F)=>G(F,"au-code__comment")),z=z.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi,(F)=>G(F,"au-code__keyword")),z=z.replace(/("[^"]*")/g,(F)=>G(F,"au-code__string")),z=z.replace(/(\s)([\w-]+)(=)/g,(F,K,Q,U)=>`${K}${G(Q,"au-code__attr")}${U}`),z=z.replace(/(&lt;\/?)([\w-]+)/g,(F,K,Q)=>`${K}${G(Q,"au-code__tag")}`),O(z)}if(J==="javascript"||J==="js"||J==="typescript"||J==="ts"){let{addMarker:G,resolveMarkers:O}=P(),z=R;return z=z.replace(/(\/\*[\s\S]*?\*\/)/g,(F)=>G(F,"au-code__comment")),z=z.replace(/(\/\/.*)/g,(F)=>G(F,"au-code__comment")),z=z.replace(/(`[^`]*`)/g,(F)=>G(F,"au-code__string")),z=z.replace(/('[^']*'|"[^"]*")/g,(F)=>G(F,"au-code__string")),z=z.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/gi,(F)=>G(F,"au-code__number")),z=z.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|async|await|new|this|super|typeof|instanceof|in|of|try|catch|finally|throw|yield|static|get|set)\b/g,(F)=>G(F,"au-code__keyword")),z=z.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g,(F)=>G(F,"au-code__builtin")),z=z.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g,(F,K)=>G(K,"au-code__function")),O(z)}if(J==="css"||J==="scss"||J==="sass"){let{addMarker:G,resolveMarkers:O}=P(),z=R;return z=z.replace(/(\/\*[\s\S]*?\*\/)/g,(F)=>G(F,"au-code__comment")),z=z.replace(/('[^']*'|"[^"]*")/g,(F)=>G(F,"au-code__string")),z=z.replace(/(@[\w-]+)/g,(F)=>G(F,"au-code__keyword")),z=z.replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)\b/g,(F,K,Q)=>`${G(K,"au-code__number")}${G(Q,"au-code__builtin")}`),z=z.replace(/\b(\d+\.?\d*)\b/g,(F)=>G(F,"au-code__number")),z=z.replace(/(#[0-9a-fA-F]{3,8})\b/g,(F)=>G(F,"au-code__string")),z=z.replace(/\b([\w-]+)\s*:/g,(F,K)=>`${G(K,"au-code__attr")}:`),z=z.replace(/(^|[{,\s])([.#]?[\w-]+)(?=\s*[{,])/gm,(F,K,Q)=>`${K}${G(Q,"au-code__tag")}`),O(z)}if(J==="json"){let{addMarker:G,resolveMarkers:O}=P(),z=R;return z=z.replace(/("[^"]*")\s*:/g,(F,K)=>`${G(K,"au-code__attr")}:`),z=z.replace(/:\s*("[^"]*")/g,(F,K)=>`: ${G(K,"au-code__string")}`),z=z.replace(/:\s*(-?\d+\.?\d*)/g,(F,K)=>`: ${G(K,"au-code__number")}`),z=z.replace(/\b(true|false|null)\b/g,(F)=>G(F,"au-code__builtin")),O(z)}if(J==="bash"||J==="sh"||J==="shell"){let{addMarker:G,resolveMarkers:O}=P(),z=R;return z=z.replace(/(#.*)/g,(F)=>G(F,"au-code__comment")),z=z.replace(/('[^']*'|"[^"]*")/g,(F)=>G(F,"au-code__string")),z=z.replace(/(\$\{?\w+\}?)/g,(F)=>G(F,"au-code__attr")),z=z.replace(/\b(cd|ls|echo|cat|grep|find|sudo|npm|npx|bun|node|git|curl|wget|mkdir|rm|cp|mv|chmod|chown)\b/g,(F)=>G(F,"au-code__keyword")),z=z.replace(/(\s)(--?[\w-]+)/g,(F,K,Q)=>`${K}${G(Q,"au-code__builtin")}`),O(z)}return R}#G(R){let J=R.split(`
`);while(J.length>0&&J[0].trim()==="")J.shift();while(J.length>0&&J[J.length-1].trim()==="")J.pop();if(J.length===0)return"";let P=1/0;for(let G of J){if(G.trim()==="")continue;let O=G.match(/^(\s*)/),z=O?O[1].length:0;P=Math.min(P,z)}if(P===1/0||P===0)return J.join(`
`);return J.map((G)=>{if(G.trim()==="")return"";return G.slice(P)}).join(`
`)}#J(R,J){let G=R.split(`
`),O=[],z=0;for(let F=0;F<G.length;F++){let K=G[F].trim();if(K===""){O.push("");continue}let Q=0,U=0;if(J==="html"){let X=(K.match(/<[a-zA-Z][^>]*(?<!\/)\s*>/g)||[]).length,Y=(K.match(/<\/[^>]+>/g)||[]).length,W=(K.match(/<[^>]+\/>/g)||[]).length;Q=X-W,U=Y}else{let X=!1,Y="";for(let W=0;W<K.length;W++){let V=K[W],w=W>0?K[W-1]:"";if((V==='"'||V==="'"||V==="`")&&w!=="\\"){if(!X)X=!0,Y=V;else if(V===Y)X=!1}if(!X){if(V==="{"||V==="["||V==="(")Q++;if(V==="}"||V==="]"||V===")")U++}}}if((J==="html"?K.startsWith("</"):/^[}\]\)]/.test(K))&&U>0)z=Math.max(0,z-1),U--;O.push("    ".repeat(z)+K),z=Math.max(0,z+Q-U)}return O.join(`
`)}#K(){if(this.style.display="block",this.style.background="var(--md-sys-color-surface-container-highest)",this.closest("au-example"))this.style.borderTopLeftRadius="0",this.style.borderTopRightRadius="0",this.style.borderBottomLeftRadius="var(--md-sys-shape-corner-medium)",this.style.borderBottomRightRadius="var(--md-sys-shape-corner-medium)";else this.style.borderRadius="var(--md-sys-shape-corner-medium)";this.style.overflow="hidden",this.style.fontFamily="'Fira Code', 'Consolas', monospace",this.style.fontSize="13px";let J=this.querySelector(".au-code__header");if(J)J.style.display="flex",J.style.justifyContent="space-between",J.style.alignItems="center",J.style.padding="8px 16px",J.style.background="var(--md-sys-color-surface-container)",J.style.borderBottom="1px solid var(--md-sys-color-outline-variant)";let P=this.querySelector(".au-code__language");if(P)P.style.fontSize="11px",P.style.fontWeight="600",P.style.color="var(--md-sys-color-primary)",P.style.letterSpacing="0.5px";let G=this.querySelector(".au-code__copy");if(G)G.style.background="transparent",G.style.border="none",G.style.cursor="pointer",G.style.color="var(--md-sys-color-on-surface-variant)",G.style.padding="4px",G.style.borderRadius="4px",G.style.display="flex",G.style.transition="all 0.2s ease";let O=this.querySelector(".au-code__pre");if(O)O.style.margin="0",O.style.padding="16px",O.style.overflow="auto",O.style.maxHeight="400px";let z=this.querySelector(".au-code__content");if(z)z.style.color="var(--md-sys-color-on-surface)";let F=document.createElement("style");F.textContent=`
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
        `;let K=document.getElementById("au-code-styles");if(K)K.remove();F.id="au-code-styles",document.head.appendChild(F)}#O(R){let J=this.querySelector(".au-code__copy");if(J)this.listen(J,"click",async()=>{try{await navigator.clipboard.writeText(R.trim()),J.classList.add("copied"),J.innerHTML=`
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    `,this.setTimeout(()=>{J.classList.remove("copied"),J.innerHTML=`
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        `},2000)}catch(P){console.error("Copy failed:",P)}})}}$("au-code",q);export{q as AuCode};
