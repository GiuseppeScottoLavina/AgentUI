function v(e,n,c={}){let{color:p="currentColor",centered:h=!1}=c,t=e.getBoundingClientRect(),i,o;if(h||!n)i=t.width/2,o=t.height/2;else{let d=n.touches?n.touches[0].clientX:n.clientX,u=n.touches?n.touches[0].clientY:n.clientY;i=d-t.left,o=u-t.top}let s=Math.max(Math.hypot(i,o),Math.hypot(t.width-i,o),Math.hypot(i,t.height-o),Math.hypot(t.width-i,t.height-o))*2,r=document.createElement("span");r.className="au-ripple-wave",r.style.cssText=`
        position: absolute;
        width: ${s}px;
        height: ${s}px;
        left: ${i-s/2}px;
        top: ${o-s/2}px;
        background: ${p};
        border-radius: 50%;
        transform: scale(0);
        opacity: 0.10;
        pointer-events: none;
    `;let l=getComputedStyle(e);if(l.position==="static")e.style.position="relative";if(l.overflow!=="hidden")e.style.overflow="hidden";e.appendChild(r),r.animate([{transform:"scale(0)"},{transform:"scale(1)"}],{duration:300,easing:"cubic-bezier(0.4, 0, 0.2, 1)",fill:"forwards"});let a=()=>{r.animate([{opacity:"0.10"},{opacity:"0"}],{duration:150,easing:"ease-out",fill:"forwards"}).onfinish=()=>r.remove(),e.removeEventListener("pointerup",a),e.removeEventListener("pointerleave",a),e.removeEventListener("pointercancel",a)};return e.addEventListener("pointerup",a,{once:!0}),e.addEventListener("pointerleave",a,{once:!0}),e.addEventListener("pointercancel",a,{once:!0}),r}
export{v as h};
