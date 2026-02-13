import{b as v}from"./chunk-zv0xkssz.js";import"./chunk-7zmjcdss.js";import"./chunk-1tav5abh.js";import"./chunk-ae6bkfs5.js";import"./chunk-jx56kmd9.js";import"./chunk-eqjr5k03.js";import"./chunk-tzc0tesv.js";import"./chunk-8x90x950.js";import{i as d}from"./chunk-kma5vhbb.js";import"./chunk-pz61rjy1.js";import"./chunk-hkvze3xv.js";import{j as u,k as n}from"./chunk-9rtqr92f.js";class o extends u{static baseClass="au-virtual-list";static cssFile=null;static observedAttributes=["item-height","buffer"];#t=[];#l=(t)=>`<div>${d(t)}</div>`;#r=0;#e=0;#h=0;#i=null;#a=null;set items(t){this.#t=t||[],this.#s()}get items(){return this.#t}set renderItem(t){this.#l=t,this.#s()}connectedCallback(){super.connectedCallback()}render(){let t=parseInt(this.attr("item-height","50"));this.innerHTML=`
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
        `,this.#i=this.querySelector(".au-virtual-list__viewport"),this.#a=this.querySelector(".au-virtual-list__content");let i=v(()=>{this.#r=this.#i.scrollTop,this.#s()},16);this.listen(this.#i,"scroll",i),this.style.display="block",this.style.height="400px",this.style.overflow="hidden",this.#s()}#s(){if(!this.#i||!this.#t.length)return;let t=parseInt(this.attr("item-height","50")),i=parseInt(this.attr("buffer","5")),h=this.#i.clientHeight,r=this.#t.length*t;this.#a.style.height=`${r}px`;let s=Math.max(0,Math.floor(this.#r/t)-i),e=Math.ceil(h/t)+i*2,l=Math.min(this.#t.length,s+e);if(s!==this.#e||l!==this.#h)this.#e=s,this.#h=l,this.#u()}async#u(){let t=parseInt(this.attr("item-height","50")),i=this.querySelector(".au-virtual-list__items");if(!i)return;let h=this.#t.slice(this.#e,this.#h),r=50;if(h.length>r&&"scheduler"in window){let s=[];for(let e=0;e<h.length;e+=r){let l=h.slice(e,e+r);if(s.push(...l.map((g,y)=>{let a=this.#e+e+y;return`
                        <div class="au-virtual-list__item" style="
                            position: absolute;
                            top: ${a*t}px;
                            left: 0;
                            right: 0;
                            height: ${t}px;
                        " data-index="${a}" data-au-state="visible">
                            ${this.#l(g,a)}
                        </div>
                    `})),e+r<h.length)await scheduler.yield()}i.innerHTML=s.join("")}else i.innerHTML=h.map((s,e)=>{let l=this.#e+e;return`
                    <div class="au-virtual-list__item" style="
                        position: absolute;
                        top: ${l*t}px;
                        left: 0;
                        right: 0;
                        height: ${t}px;
                    " data-index="${l}" data-au-state="visible">
                        ${this.#l(s,l)}
                    </div>
                `}).join("")}scrollToIndex(t){let i=parseInt(this.attr("item-height","50"));this.#i.scrollTop=t*i}}n("au-virtual-list",o);
