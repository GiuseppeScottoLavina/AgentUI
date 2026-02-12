import{n as B}from"./chunk-y03bwgrc.js";class C extends B{static get observedAttributes(){return["logo","duration","delay","spinner"]}static baseClass="au-splash";static cssFile="splash";static useContainment=!1;constructor(){super();this._startTime=Date.now(),this._hidden=!1}connectedCallback(){super.connectedCallback(),this._injectCriticalCSS(),this.render(),this.listen(document,"au-ready",()=>this._hide(),{once:!0});let k=parseInt(this.getAttribute("max-wait"))||1e4;this.setTimeout(()=>{if(!this._hidden)console.warn("[au-splash] Timeout waiting for au-ready, hiding anyway"),this._hide()},k)}_injectCriticalCSS(){if(document.getElementById("au-splash-critical"))return;let k=document.createElement("style");k.id="au-splash-critical",k.textContent=`
            au-splash {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 24px;
                background: var(--md-sys-color-surface, #FFFBFE);
                z-index: 99999;
                opacity: 1;
                transition: opacity var(--au-splash-duration, 300ms) ease-out;
            }
            au-splash.au-splash--hidden {
                opacity: 0;
                pointer-events: none;
            }
            au-splash .au-splash__spinner {
                width: 48px;
                height: 48px;
                border: 4px solid var(--md-sys-color-primary, #6750A4);
                border-top-color: transparent;
                border-radius: 50%;
                animation: au-splash-spin 1s linear infinite;
            }
            au-splash .au-splash__logo {
                max-width: 120px;
                max-height: 120px;
                object-fit: contain;
            }
            @keyframes au-splash-spin {
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                au-splash { transition: none; }
                au-splash .au-splash__spinner { animation: none; opacity: 0.6; }
            }
            [data-theme="dark"] au-splash,
            :root[data-theme="dark"] au-splash {
                background: var(--md-sys-color-surface, #141218);
            }
        `,document.head.insertBefore(k,document.head.firstChild)}render(){let k=this.getAttribute("logo"),q=this.getAttribute("spinner")!=="false",z=parseInt(this.getAttribute("duration"))||300;this.style.setProperty("--au-splash-duration",`${z}ms`),this.innerHTML=`
            ${k?`<img class="au-splash__logo" src="${k}" alt="Loading...">`:""}
            ${q?'<div class="au-splash__spinner" role="progressbar" aria-label="Loading"></div>':""}
        `}_hide(){if(this._hidden)return;this._hidden=!0;let k=parseInt(this.getAttribute("delay"))||0,q=Date.now()-this._startTime,z=Math.max(0,k-q);this.setTimeout(()=>{let F=parseInt(this.getAttribute("duration"))||300;this.classList.add("au-splash--hidden"),this.setTimeout(()=>{this.remove()},F)},z)}}if(!customElements.get("au-splash"))customElements.define("au-splash",C);export{C as AuSplash};
