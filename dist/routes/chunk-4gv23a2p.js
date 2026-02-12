import{j as m,k as h}from"./chunk-c3f5ypg0.js";class _ extends m{static baseClass="au-code";static observedAttributes=["language"];#e=null;connectedCallback(){if(super.connectedCallback(),!this.#e&&!this.querySelector(".au-code__content"))this.#e=this.textContent}render(){if(this.querySelector(".au-code__content"))return;let c=this.attr("language","html"),o=this.#e||this.innerHTML,a;if(typeof DOMParser<"u")a=new DOMParser().parseFromString(o,"text/html").documentElement.textContent;else{let i=document.createElement("div");i.innerHTML=o,a=i.textContent}let r=this.#r(a),l=this.#o(r,c),e=l,t=l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),s=this.#t(t,c);this.innerHTML=`
            <div class="au-code__header">
                <span class="au-code__language">${c.toUpperCase()}</span>
                <button class="au-code__copy" title="Copy code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
            <pre class="au-code__pre"><code class="au-code__content">${s}</code></pre>
        `,this.#a(),this.#s(e)}#t(c,o){let a=()=>{let r=[],l=0;return{addMarker:(e,t)=>{let s=l++,i=String.fromCharCode(57600+s),d=String.fromCharCode(57344),p=String.fromCharCode(57345),u=d+i+p;return r.push({marker:u,content:e,className:t}),u},resolveMarkers:(e)=>{for(let{marker:t,content:s,className:i}of r)e=e.replace(t,`<span class="${i}">${s}</span>`);return e}}};if(o==="html"||o==="xml"){let{addMarker:r,resolveMarkers:l}=a(),e=c;return e=e.replace(/(&lt;!--[\s\S]*?--&gt;)/g,(t)=>r(t,"au-code__comment")),e=e.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi,(t)=>r(t,"au-code__keyword")),e=e.replace(/("[^"]*")/g,(t)=>r(t,"au-code__string")),e=e.replace(/(\s)([\w-]+)(=)/g,(t,s,i,d)=>`${s}${r(i,"au-code__attr")}${d}`),e=e.replace(/(&lt;\/?)([\w-]+)/g,(t,s,i)=>`${s}${r(i,"au-code__tag")}`),l(e)}if(o==="javascript"||o==="js"||o==="typescript"||o==="ts"){let{addMarker:r,resolveMarkers:l}=a(),e=c;return e=e.replace(/(\/\*[\s\S]*?\*\/)/g,(t)=>r(t,"au-code__comment")),e=e.replace(/(\/\/.*)/g,(t)=>r(t,"au-code__comment")),e=e.replace(/(`[^`]*`)/g,(t)=>r(t,"au-code__string")),e=e.replace(/('[^']*'|"[^"]*")/g,(t)=>r(t,"au-code__string")),e=e.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/gi,(t)=>r(t,"au-code__number")),e=e.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|async|await|new|this|super|typeof|instanceof|in|of|try|catch|finally|throw|yield|static|get|set)\b/g,(t)=>r(t,"au-code__keyword")),e=e.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g,(t)=>r(t,"au-code__builtin")),e=e.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g,(t,s)=>r(s,"au-code__function")),l(e)}if(o==="css"||o==="scss"||o==="sass"){let{addMarker:r,resolveMarkers:l}=a(),e=c;return e=e.replace(/(\/\*[\s\S]*?\*\/)/g,(t)=>r(t,"au-code__comment")),e=e.replace(/('[^']*'|"[^"]*")/g,(t)=>r(t,"au-code__string")),e=e.replace(/(@[\w-]+)/g,(t)=>r(t,"au-code__keyword")),e=e.replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)\b/g,(t,s,i)=>`${r(s,"au-code__number")}${r(i,"au-code__builtin")}`),e=e.replace(/\b(\d+\.?\d*)\b/g,(t)=>r(t,"au-code__number")),e=e.replace(/(#[0-9a-fA-F]{3,8})\b/g,(t)=>r(t,"au-code__string")),e=e.replace(/\b([\w-]+)\s*:/g,(t,s)=>`${r(s,"au-code__attr")}:`),e=e.replace(/(^|[{,\s])([.#]?[\w-]+)(?=\s*[{,])/gm,(t,s,i)=>`${s}${r(i,"au-code__tag")}`),l(e)}if(o==="json"){let{addMarker:r,resolveMarkers:l}=a(),e=c;return e=e.replace(/("[^"]*")\s*:/g,(t,s)=>`${r(s,"au-code__attr")}:`),e=e.replace(/:\s*("[^"]*")/g,(t,s)=>`: ${r(s,"au-code__string")}`),e=e.replace(/:\s*(-?\d+\.?\d*)/g,(t,s)=>`: ${r(s,"au-code__number")}`),e=e.replace(/\b(true|false|null)\b/g,(t)=>r(t,"au-code__builtin")),l(e)}if(o==="bash"||o==="sh"||o==="shell"){let{addMarker:r,resolveMarkers:l}=a(),e=c;return e=e.replace(/(#.*)/g,(t)=>r(t,"au-code__comment")),e=e.replace(/('[^']*'|"[^"]*")/g,(t)=>r(t,"au-code__string")),e=e.replace(/(\$\{?\w+\}?)/g,(t)=>r(t,"au-code__attr")),e=e.replace(/\b(cd|ls|echo|cat|grep|find|sudo|npm|npx|bun|node|git|curl|wget|mkdir|rm|cp|mv|chmod|chown)\b/g,(t)=>r(t,"au-code__keyword")),e=e.replace(/(\s)(--?[\w-]+)/g,(t,s,i)=>`${s}${r(i,"au-code__builtin")}`),l(e)}return c}#r(c){let o=c.split(`
`);while(o.length>0&&o[0].trim()==="")o.shift();while(o.length>0&&o[o.length-1].trim()==="")o.pop();if(o.length===0)return"";let a=1/0;for(let r of o){if(r.trim()==="")continue;let l=r.match(/^(\s*)/),e=l?l[1].length:0;a=Math.min(a,e)}if(a===1/0||a===0)return o.join(`
`);return o.map((r)=>{if(r.trim()==="")return"";return r.slice(a)}).join(`
`)}#o(c,o){let a=c.split(`
`),r=[],l=0;for(let e=0;e<a.length;e++){let t=a[e].trim();if(t===""){r.push("");continue}let s=0,i=0;if(o==="html"){let d=(t.match(/<[a-zA-Z][^>]*(?<!\/)\s*>/g)||[]).length,p=(t.match(/<\/[^>]+>/g)||[]).length,u=(t.match(/<[^>]+\/>/g)||[]).length;s=d-u,i=p}else{let d=!1,p="";for(let u=0;u<t.length;u++){let n=t[u],y=u>0?t[u-1]:"";if((n==='"'||n==="'"||n==="`")&&y!=="\\"){if(!d)d=!0,p=n;else if(n===p)d=!1}if(!d){if(n==="{"||n==="["||n==="(")s++;if(n==="}"||n==="]"||n===")")i++}}}if((o==="html"?t.startsWith("</"):/^[}\]\)]/.test(t))&&i>0)l=Math.max(0,l-1),i--;r.push("    ".repeat(l)+t),l=Math.max(0,l+s-i)}return r.join(`
`)}#a(){if(this.style.display="block",this.style.background="var(--md-sys-color-surface-container-highest)",this.closest("au-example"))this.style.borderTopLeftRadius="0",this.style.borderTopRightRadius="0",this.style.borderBottomLeftRadius="var(--md-sys-shape-corner-medium)",this.style.borderBottomRightRadius="var(--md-sys-shape-corner-medium)";else this.style.borderRadius="var(--md-sys-shape-corner-medium)";this.style.overflow="hidden",this.style.fontFamily="'Fira Code', 'Consolas', monospace",this.style.fontSize="13px";let c=this.querySelector(".au-code__header");if(c)c.style.display="flex",c.style.justifyContent="space-between",c.style.alignItems="center",c.style.padding="8px 16px",c.style.background="var(--md-sys-color-surface-container)",c.style.borderBottom="1px solid var(--md-sys-color-outline-variant)";let o=this.querySelector(".au-code__language");if(o)o.style.fontSize="11px",o.style.fontWeight="600",o.style.color="var(--md-sys-color-primary)",o.style.letterSpacing="0.5px";let a=this.querySelector(".au-code__copy");if(a)a.style.background="transparent",a.style.border="none",a.style.cursor="pointer",a.style.color="var(--md-sys-color-on-surface-variant)",a.style.padding="4px",a.style.borderRadius="4px",a.style.display="flex",a.style.transition="all 0.2s ease";let r=this.querySelector(".au-code__pre");if(r)r.style.margin="0",r.style.padding="16px",r.style.overflow="auto",r.style.maxHeight="400px";let l=this.querySelector(".au-code__content");if(l)l.style.color="var(--md-sys-color-on-surface)";let e=document.createElement("style");e.textContent=`
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
        `;let t=document.getElementById("au-code-styles");if(t)t.remove();e.id="au-code-styles",document.head.appendChild(e)}#s(c){let o=this.querySelector(".au-code__copy");if(o)this.listen(o,"click",async()=>{try{await navigator.clipboard.writeText(c.trim()),o.classList.add("copied"),o.innerHTML=`
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    `,this.setTimeout(()=>{o.classList.remove("copied"),o.innerHTML=`
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        `},2000)}catch(a){console.error("Copy failed:",a)}})}}h("au-code",_);
