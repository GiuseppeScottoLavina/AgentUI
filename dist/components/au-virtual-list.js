import{i as Q}from"./chunk-hwrk9hgf.js";import{o as P}from"./chunk-0f7ph7sp.js";import{p as N,q as O}from"./chunk-aeetm00j.js";class U extends N{static baseClass="au-virtual-list";static cssFile=null;static observedAttributes=["item-height","buffer"];#k=[];#D=(k)=>P`<div>${k}</div>`;#G=0;#y=0;#F=0;#q=null;#J=null;set items(k){this.#k=k||[],this.#z()}get items(){return this.#k}set renderItem(k){this.#D=k,this.#z()}connectedCallback(){super.connectedCallback()}render(){let k=parseInt(this.attr("item-height","50"));this.innerHTML=`
            <div class="au-virtual-list__viewport" style="
                height: 100%;
                overflow-y: auto;
                position: relative;
            ">
                <div class="au-virtual-list__content" style="
                    position: relative;
                ">
                    <div class="au-virtual-list__items"></div>
                </div>
            </div>
        `,this.#q=this.querySelector(".au-virtual-list__viewport"),this.#J=this.querySelector(".au-virtual-list__content");let y=Q(()=>{this.#G=this.#q.scrollTop,this.#z()},16);this.listen(this.#q,"scroll",y),this.style.display="block",this.style.height="400px",this.style.overflow="hidden",this.#z()}#z(){if(!this.#q||!this.#k.length)return;let k=parseInt(this.attr("item-height","50")),y=parseInt(this.attr("buffer","5")),z=this.#q.clientHeight,D=this.#k.length*k;this.#J.style.height=`${D}px`;let J=Math.max(0,Math.floor(this.#G/k)-y),F=Math.ceil(z/k)+y*2,q=Math.min(this.#k.length,J+F);if(J!==this.#y||q!==this.#F)this.#y=J,this.#F=q,this.#K()}async#K(){let k=parseInt(this.attr("item-height","50")),y=this.querySelector(".au-virtual-list__items");if(!y)return;let z=this.#k.slice(this.#y,this.#F),D=50;if(z.length>D&&"scheduler"in window){let F=[];for(let q=0;q<z.length;q+=D){let G=z.slice(q,q+D);if(F.push(...G.map((M,W)=>{let K=this.#y+q+W;return`
                        <div class="au-virtual-list__item" style="
                            position: absolute;
                            top: ${K*k}px;
                            left: 0;
                            right: 0;
                            height: ${k}px;
                        " data-index="${K}" data-au-state="visible">
                            ${this.#D(M,K)}
                        </div>
                    `})),q+D<z.length)await scheduler.yield()}y.innerHTML=F.join("")}else y.innerHTML=z.map((F,q)=>{let G=this.#y+q;return`
                    <div class="au-virtual-list__item" style="
                        position: absolute;
                        top: ${G*k}px;
                        left: 0;
                        right: 0;
                        height: ${k}px;
                    " data-index="${G}" data-au-state="visible">
                        ${this.#D(F,G)}
                    </div>
                `}).join("")}scrollToIndex(k){let y=parseInt(this.attr("item-height","50"));this.#q.scrollTop=k*y}}O("au-virtual-list",U);export{U as AuVirtualList};
