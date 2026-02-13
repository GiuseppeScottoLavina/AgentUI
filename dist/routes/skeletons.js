import"./chunk-eqjr5k03.js";import"./chunk-tzc0tesv.js";import"./chunk-8x90x950.js";import"./chunk-kma5vhbb.js";import"./chunk-pz61rjy1.js";import"./chunk-hkvze3xv.js";import{j as n,k as o}from"./chunk-9rtqr92f.js";class l extends n{static baseClass="au-skeleton";static observedAttributes=["variant","width","height","size","lines"];render(){if(this.querySelector(".au-skeleton__line")||this.style.animation)return;let t=this.attr("variant","rect"),s=this.attr("width","100%"),a=this.attr("height","20px"),r=this.attr("size","40px"),i=parseInt(this.attr("lines","1"));if(this.style.display="block",t==="text"&&i>1)this.innerHTML=Array(i).fill(0).map((e,h)=>`<div class="au-skeleton__line" style="
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
            `,document.head.appendChild(e)}}update(t,s,a){this.render()}}o("au-skeleton",l);
