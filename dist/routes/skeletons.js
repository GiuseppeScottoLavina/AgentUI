import"./chunk-asp8xy7f.js";import"./chunk-jn8zd153.js";import"./chunk-ce0w0142.js";import"./chunk-wvr0ptzf.js";import"./chunk-s1kj67sf.js";import{i as n,j as l}from"./chunk-afwem87e.js";class o extends n{static baseClass="au-skeleton";static observedAttributes=["variant","width","height","size","lines"];render(){if(this.querySelector(".au-skeleton__line")||this.style.animation)return;let t=this.attr("variant","rect"),s=this.attr("width","100%"),a=this.attr("height","20px"),r=this.attr("size","40px"),i=parseInt(this.attr("lines","1"));if(this.style.display="block",t==="text"&&i>1)this.innerHTML=Array(i).fill(0).map((e,h)=>`<div class="au-skeleton__line" style="
                    height: 16px;
                    margin-bottom: 8px;
                    width: ${h===i-1?"70%":"100%"};
                    background: var(--md-sys-color-surface-container-highest);
                    border-radius: 4px;
                    animation: au-skeleton-pulse 1.5s ease-in-out infinite;
                "></div>`).join("");else this.style.width=t==="circle"?r:s,this.style.height=t==="circle"?r:a,this.style.borderRadius=t==="circle"?"50%":"4px",this.style.background="var(--md-sys-color-surface-container-highest)",this.style.animation="au-skeleton-pulse 1.5s ease-in-out infinite";if(!document.getElementById("au-skeleton-styles")){let e=document.createElement("style");e.id="au-skeleton-styles",e.textContent=`
                @keyframes au-skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `,document.head.appendChild(e)}}update(t,s,a){this.render()}}l("au-skeleton",o);
