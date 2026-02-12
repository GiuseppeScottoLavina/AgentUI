function V(k,w,K={}){let{color:N="currentColor",centered:P=!1}=K,q=k.getBoundingClientRect(),A,B;if(P||!w)A=q.width/2,B=q.height/2;else{let Q=w.touches?w.touches[0].clientX:w.clientX,U=w.touches?w.touches[0].clientY:w.clientY;A=Q-q.left,B=U-q.top}let G=Math.max(Math.hypot(A,B),Math.hypot(q.width-A,B),Math.hypot(A,q.height-B),Math.hypot(q.width-A,q.height-B))*2,D=document.createElement("span");D.className="au-ripple-wave",D.style.cssText=`
        position: absolute;
        width: ${G}px;
        height: ${G}px;
        left: ${A-G/2}px;
        top: ${B-G/2}px;
        background: ${N};
        border-radius: 50%;
        transform: scale(0);
        opacity: 0.10;
        pointer-events: none;
    `;let J=getComputedStyle(k);if(J.position==="static")k.style.position="relative";if(J.overflow!=="hidden")k.style.overflow="hidden";k.appendChild(D),D.animate([{transform:"scale(0)"},{transform:"scale(1)"}],{duration:300,easing:"cubic-bezier(0.4, 0, 0.2, 1)",fill:"forwards"});let F=()=>{D.animate([{opacity:"0.10"},{opacity:"0"}],{duration:150,easing:"ease-out",fill:"forwards"}).onfinish=()=>D.remove(),k.removeEventListener("pointerup",F),k.removeEventListener("pointerleave",F),k.removeEventListener("pointercancel",F)};return k.addEventListener("pointerup",F,{once:!0}),k.addEventListener("pointerleave",F,{once:!0}),k.addEventListener("pointercancel",F,{once:!0}),D}
export{V as c};
