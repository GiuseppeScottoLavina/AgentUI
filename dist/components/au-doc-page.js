import{n as k,o as J}from"./chunk-0f7ph7sp.js";import{p as O,q as Q}from"./chunk-aeetm00j.js";class R extends O{static baseClass="au-doc-page";static observedAttributes=["title","selector","description"];#k=0;connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.#q())}render(){let q=this.attr("title","Component"),z=this.attr("selector",""),I=this.attr("description",""),B=this.querySelector('[slot="overview"]'),F=this.querySelector('[slot="api"]'),K=this.querySelector('[slot="styling"]'),N=this.querySelector('[slot="examples"]'),U=B?B.innerHTML:"",V=F?F.innerHTML:"",W=K?K.innerHTML:"",X=N?N.innerHTML:"";this.innerHTML=J`
            <h1 class="page-title">${q}</h1>
            <p class="page-subtitle">
                ${z?J`<code>&lt;${z}&gt;</code> `:""}${I}
            </p>

            <au-tabs active="0" class="au-doc-page__tabs" style="margin-bottom: 24px;">
                <au-tab>OVERVIEW</au-tab>
                <au-tab>API</au-tab>
                <au-tab>STYLING</au-tab>
                <au-tab>EXAMPLES</au-tab>
            </au-tabs>

            <div class="au-doc-page__content au-doc-page__overview">
                ${k(U)}
            </div>
            <div class="au-doc-page__content au-doc-page__api" style="display: none;">
                ${k(V)}
            </div>
            <div class="au-doc-page__content au-doc-page__styling" style="display: none;">
                ${k(W)}
            </div>
            <div class="au-doc-page__content au-doc-page__examples" style="display: none;">
                ${k(X)}
            </div>
        `,this.style.display="block"}#q(){let q=this.querySelector(".au-doc-page__tabs"),z=this.querySelectorAll(".au-doc-page__content");if(q)this.listen(q,"au-tab-change",(I)=>{this.#k=I.detail.index,z.forEach((B,F)=>{B.style.display=F===this.#k?"block":"none"})})}}Q("au-doc-page",R);export{R as AuDocPage};
