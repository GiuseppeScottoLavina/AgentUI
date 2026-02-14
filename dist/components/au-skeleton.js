import{p as G,q as H}from"./chunk-aeetm00j.js";class J extends G{static baseClass="au-skeleton";static observedAttributes=["variant","width","height","size","lines"];render(){if(this.querySelector(".au-skeleton__line")||this.style.animation)return;let b=this.attr("variant","rect"),C=this.attr("width","100%"),D=this.attr("height","20px"),F=this.attr("size","40px"),B=parseInt(this.attr("lines","1"));if(this.style.display="block",b==="text"&&B>1)this.innerHTML=Array(B).fill(0).map((q,K)=>`<div class="au-skeleton__line" style="
                    height: 16px;
                    margin-bottom: 8px;
                    width: ${K===B-1?"70%":"100%"};
                    background: var(--md-sys-color-surface-container-highest);
                    border-radius: 4px;
                    animation: au-skeleton-pulse 1.5s ease-in-out infinite;
                "></div>`).join("");else this.style.width=b==="circle"?F:C,this.style.height=b==="circle"?F:D,this.style.borderRadius=b==="circle"?"50%":"4px",this.style.background="var(--md-sys-color-surface-container-highest)",this.style.animation="au-skeleton-pulse 1.5s ease-in-out infinite";if(!document.getElementById("au-skeleton-styles")){let q=document.createElement("style");q.id="au-skeleton-styles",q.textContent=`
                @keyframes au-skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `,document.head.appendChild(q)}}update(b,C,D){this.render()}}H("au-skeleton",J);export{J as AuSkeleton};
