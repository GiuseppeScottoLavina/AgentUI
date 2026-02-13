import{n as J,o as K}from"./chunk-x9cky97m.js";class N extends J{static baseClass="au-doc-page";static observedAttributes=["title","selector","description"];#h=0;connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.#k())}render(){let h=this.attr("title","Component"),k=this.attr("selector",""),B=this.attr("description",""),q=this.querySelector('[slot="overview"]'),z=this.querySelector('[slot="api"]'),F=this.querySelector('[slot="styling"]'),I=this.querySelector('[slot="examples"]'),O=q?q.innerHTML:"",Q=z?z.innerHTML:"",R=F?F.innerHTML:"",U=I?I.innerHTML:"";this.innerHTML=`
            <h1 class="page-title">${h}</h1>
            <p class="page-subtitle">
                ${k?`<code>&lt;${k}&gt;</code> `:""}${B}
            </p>

            <au-tabs active="0" class="au-doc-page__tabs" style="margin-bottom: 24px;">
                <au-tab>OVERVIEW</au-tab>
                <au-tab>API</au-tab>
                <au-tab>STYLING</au-tab>
                <au-tab>EXAMPLES</au-tab>
            </au-tabs>

            <div class="au-doc-page__content au-doc-page__overview">
                ${O}
            </div>
            <div class="au-doc-page__content au-doc-page__api" style="display: none;">
                ${Q}
            </div>
            <div class="au-doc-page__content au-doc-page__styling" style="display: none;">
                ${R}
            </div>
            <div class="au-doc-page__content au-doc-page__examples" style="display: none;">
                ${U}
            </div>
        `,this.style.display="block"}#k(){let h=this.querySelector(".au-doc-page__tabs"),k=this.querySelectorAll(".au-doc-page__content");if(h)this.listen(h,"au-tab-change",(B)=>{this.#h=B.detail.index,k.forEach((q,z)=>{q.style.display=z===this.#h?"block":"none"})})}}K("au-doc-page",N);export{N as AuDocPage};
