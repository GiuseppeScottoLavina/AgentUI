import{j as k}from"./chunk-bxze911z.js";import{n as q,o as z}from"./chunk-x9cky97m.js";class B extends q{static baseClass="au-textarea";static cssFile="input";static observedAttributes=["placeholder","rows","disabled","readonly","name"];#g=null;render(){if(!this.querySelector(".au-textarea__field")){let g=k(this.attr("placeholder","")),D=this.attr("rows","4"),G=this.has("disabled")?"disabled":"",I=this.has("readonly")?"readonly":"",J=k(this.attr("name",""));this.innerHTML=`
                <textarea 
                    class="au-textarea__field"
                    placeholder="${g}"
                    aria-label="${g||"Text area"}"
                    rows="${D}"
                    name="${J}"
                    ${G}
                    ${I}
                ></textarea>
            `,this.style.display="block",this.style.position="relative"}this.#g=this.querySelector("textarea"),this.#g.style.width="100%",this.#g.style.padding="12px 16px",this.#g.style.fontSize="var(--md-sys-typescale-body-large-size, 16px)",this.#g.style.fontFamily="inherit",this.#g.style.border="1px solid var(--md-sys-color-outline)",this.#g.style.borderRadius="var(--md-sys-shape-corner-small, 4px)",this.#g.style.background="var(--md-sys-color-surface-container-highest, var(--md-sys-color-surface))",this.#g.style.color="var(--md-sys-color-on-surface)",this.#g.style.resize="vertical",this.#g.style.transition="border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)",this.#g.style.outline="none",this.#g.style.boxSizing="border-box",this.listen(this.#g,"focus",()=>{this.#g.style.borderColor="var(--md-sys-color-primary)",this.#g.style.boxShadow="inset 0 0 0 1px var(--md-sys-color-primary)"}),this.listen(this.#g,"blur",()=>{this.#g.style.borderColor="var(--md-sys-color-outline)",this.#g.style.boxShadow="none"}),this.listen(this.#g,"input",(g)=>{this.emit("au-input",{value:g.target.value})}),this.listen(this.#g,"change",(g)=>{this.emit("au-change",{value:g.target.value})})}get value(){return this.#g?.value||""}set value(g){if(this.#g)this.#g.value=g}focus(){this.#g?.focus()}}z("au-textarea",B);export{B as AuTextarea};
