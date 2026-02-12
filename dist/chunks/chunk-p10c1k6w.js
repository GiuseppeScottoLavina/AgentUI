function V(k,q,F={}){let{color:K="currentColor",centered:P=!1}=F,w=k.getBoundingClientRect(),A,B;if(P||!q)A=w.width/2,B=w.height/2;else{let Q=q.touches?q.touches[0].clientX:q.clientX,U=q.touches?q.touches[0].clientY:q.clientY;A=Q-w.left,B=U-w.top}let J=Math.max(Math.hypot(A,B),Math.hypot(w.width-A,B),Math.hypot(A,w.height-B),Math.hypot(w.width-A,w.height-B))*2,D=document.createElement("span");D.className="au-ripple-wave",D.style.cssText=`
        position: absolute;
        width: ${J}px;
        height: ${J}px;
        left: ${A-J/2}px;
        top: ${B-J/2}px;
        background: ${K};
        border-radius: 50%;
        transform: scale(0);
        opacity: 0.10;
        pointer-events: none;
    `;let N=getComputedStyle(k);if(N.position==="static")k.style.position="relative";if(N.overflow!=="hidden")k.style.overflow="hidden";k.appendChild(D),D.animate([{transform:"scale(0)"},{transform:"scale(1)"}],{duration:300,easing:"cubic-bezier(0.4, 0, 0.2, 1)",fill:"forwards"});let G=()=>{D.animate([{opacity:"0.10"},{opacity:"0"}],{duration:150,easing:"ease-out",fill:"forwards"}).onfinish=()=>D.remove(),k.removeEventListener("pointerup",G),k.removeEventListener("pointerleave",G),k.removeEventListener("pointercancel",G)};return k.addEventListener("pointerup",G,{once:!0}),k.addEventListener("pointerleave",G,{once:!0}),k.addEventListener("pointercancel",G,{once:!0}),D}function W(k,q={}){let F=(K)=>{if(k.hasAttribute("disabled"))return;V(k,K,q)};return k.addEventListener("pointerdown",F),()=>{k.removeEventListener("pointerdown",F)}}var Z=(k)=>class extends k{#k=null;initRipple(q=this,F={}){this.#k=W(q,F)}disconnectedCallback(){if(this.#k)this.#k(),this.#k=null;super.disconnectedCallback?.()}};
export{V as a,W as b,Z as c};
