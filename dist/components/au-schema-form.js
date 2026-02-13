import{j as K}from"./chunk-bxze911z.js";import{n as g}from"./chunk-x9cky97m.js";class z extends g{static get observedAttributes(){return["submit-label","reset-label","inline","readonly","disabled"]}static baseClass="au-schema-form";static cssFile="schema-form";constructor(){super();this._schema=null,this._values={},this._errors={},this._touched={}}get schema(){return this._schema}set schema(C){if(this._schema=C,this._initializeValues(),this.isConnected)this.render()}get submitLabel(){return this.getAttribute("submit-label")||"Submit"}get resetLabel(){return this.getAttribute("reset-label")||"Reset"}get inline(){return this.hasAttribute("inline")}get readonly(){return this.hasAttribute("readonly")}get disabled(){return this.hasAttribute("disabled")}connectedCallback(){super.connectedCallback(),this.render()}attributeChangedCallback(C,k,B){if(this.isConnected&&k!==B)this.render()}getValues(){return{...this._values}}setValues(C){this._values={...this._values,...C},this.render()}validate(){if(!this._schema||!this._schema.properties)return!0;this._errors={};let C=this._schema.required||[];for(let[k,B]of Object.entries(this._schema.properties)){let J=this._values[k],G=this._validateField(k,J,B,C.includes(k));if(G.length>0)this._errors[k]=G}return this.render(),Object.keys(this._errors).length===0}getErrors(){return{...this._errors}}reset(){this._initializeValues(),this._errors={},this._touched={},this.render(),this.emit("au-reset",{values:this.getValues()},{bubbles:!0})}submit(){if(this.validate())this.emit("au-submit",this.getValues(),{bubbles:!0})}_initializeValues(){if(this._values={},!this._schema||!this._schema.properties)return;for(let[C,k]of Object.entries(this._schema.properties))if(k.default!==void 0)this._values[C]=k.default;else if(k.type==="boolean")this._values[C]=!1;else if(k.type==="number"||k.type==="integer")this._values[C]=null;else this._values[C]=""}_validateField(C,k,B,J){let G=[];if(J&&(k===""||k===null||k===void 0))return G.push(`${B.title||C} is required`),G;if(k===""||k===null||k===void 0)return G;if(B.type==="string"){if(B.minLength&&k.length<B.minLength)G.push(`Minimum ${B.minLength} characters`);if(B.maxLength&&k.length>B.maxLength)G.push(`Maximum ${B.maxLength} characters`);if(B.pattern&&!new RegExp(B.pattern).test(k))G.push(B.patternError||"Invalid format");if(B.format==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k))G.push("Invalid email address");if(B.format==="url"&&!/^https?:\/\/.+/.test(k))G.push("Invalid URL")}if(B.type==="number"||B.type==="integer"){let I=Number(k);if(isNaN(I))G.push("Must be a number");else{if(B.minimum!==void 0&&I<B.minimum)G.push(`Minimum value is ${B.minimum}`);if(B.maximum!==void 0&&I>B.maximum)G.push(`Maximum value is ${B.maximum}`)}}return G}_getInputType(C){if(C.format==="email")return"email";if(C.format==="password")return"password";if(C.format==="date")return"date";if(C.format==="time")return"time";if(C.format==="datetime-local")return"datetime-local";if(C.format==="url")return"url";if(C.format==="tel")return"tel";if(C.type==="number"||C.type==="integer")return"number";return"text"}_renderField(C,k,B){let J=this._values[C]??"",G=this._errors[C]||[],I=G.length>0,N=K(C),U=K(k.title||C),_=K(k.placeholder||""),Q=K(k.description||""),X=K(String(J)),Y=I?K(G[0]):"",W=this.disabled||k.readOnly,$=this.readonly;if(k.type==="boolean")return`
                <div class="au-schema-form-field" data-field="${N}">
                    <div class="au-schema-form-switch-row">
                        <au-switch 
                            ${J?"checked":""}
                            ${W?"disabled":""}
                            data-field="${N}"
                        ></au-switch>
                        <label class="au-schema-form-switch-label">${U}</label>
                    </div>
                    ${Q?`<div class="au-schema-form-description">${Q}</div>`:""}
                </div>
            `;if(k.enum){let O=k.enum.map((Z,P)=>{let S=K(String(Z)),y=K(k.enumLabels?.[P]||String(Z));return`<au-option value="${S}" ${J===Z?"selected":""}>${y}</au-option>`}).join("");return`
                <div class="au-schema-form-field ${I?"au-schema-form-field-error":""}" data-field="${N}">
                    <au-dropdown 
                        label="${U}${B?" *":""}"
                        value="${X}"
                        ${W?"disabled":""}
                        ${B?"required":""}
                        data-field="${N}"
                    >
                        ${O}
                    </au-dropdown>
                    ${Q?`<div class="au-schema-form-description">${Q}</div>`:""}
                    ${I?`<div class="au-schema-form-error">${Y}</div>`:""}
                </div>
            `}if(k.type==="string"&&k.multiline)return`
                <div class="au-schema-form-field ${I?"au-schema-form-field-error":""}" data-field="${N}">
                    <au-textarea
                        label="${U}${B?" *":""}"
                        placeholder="${_}"
                        ${W?"disabled":""}
                        ${$?"readonly":""}
                        ${B?"required":""}
                        data-field="${N}"
                    >${X}</au-textarea>
                    ${Q?`<div class="au-schema-form-description">${Q}</div>`:""}
                    ${I?`<div class="au-schema-form-error">${Y}</div>`:""}
                </div>
            `;let j=this._getInputType(k);return`
            <div class="au-schema-form-field ${I?"au-schema-form-field-error":""}" data-field="${N}">
                <au-input
                    type="${j}"
                    label="${U}${B?" *":""}"
                    placeholder="${_}"
                    value="${X}"
                    ${W?"disabled":""}
                    ${$?"readonly":""}
                    ${B?"required":""}
                    ${k.minimum!==void 0?`min="${k.minimum}"`:""}
                    ${k.maximum!==void 0?`max="${k.maximum}"`:""}
                    ${k.minLength?`minlength="${k.minLength}"`:""}
                    ${k.maxLength?`maxlength="${k.maxLength}"`:""}
                    data-field="${N}"
                ></au-input>
                ${Q?`<div class="au-schema-form-description">${Q}</div>`:""}
                ${I?`<div class="au-schema-form-error">${Y}</div>`:""}
            </div>
        `}render(){if(!this._schema||!this._schema.properties){this.innerHTML=`
                <div class="au-schema-form-empty-state">
                    Set the <code>schema</code> property to generate a form
                </div>
            `;return}let C=this._schema.required||[],k=Object.entries(this._schema.properties).map(([B,J])=>this._renderField(B,J,C.includes(B))).join("");this.innerHTML=`
            <div class="au-schema-form ${this.inline?"au-schema-form-inline":""}">
                ${k}
                
                <div class="au-schema-form-actions">
                    <au-button variant="filled" data-action="submit" ${this.disabled?"disabled":""}>
                        ${this.submitLabel}
                    </au-button>
                    <au-button variant="text" data-action="reset" ${this.disabled?"disabled":""}>
                        ${this.resetLabel}
                    </au-button>
                </div>
            </div>
        `,this._attachEventListeners()}_attachEventListeners(){this.querySelectorAll("au-input").forEach((C)=>{this.listen(C,"au-input",(k)=>{let B=C.dataset.field;if(this._values[B]=k.detail.value,this._touched[B]=!0,this._errors[B])delete this._errors[B],C.closest(".au-schema-form-field").classList.remove("au-schema-form-field-error"),C.closest(".au-schema-form-field").querySelector(".au-schema-form-error")?.remove();this.emit("au-change",{field:B,value:k.detail.value,values:this.getValues()},{bubbles:!0})})}),this.querySelectorAll("au-textarea").forEach((C)=>{this.listen(C,"au-input",(k)=>{let B=C.dataset.field;this._values[B]=k.detail.value,this._touched[B]=!0,this.emit("au-change",{field:B,value:k.detail.value,values:this.getValues()},{bubbles:!0})})}),this.querySelectorAll("au-dropdown").forEach((C)=>{this.listen(C,"au-change",(k)=>{let B=C.dataset.field;this._values[B]=k.detail.value,this._touched[B]=!0,this.emit("au-change",{field:B,value:k.detail.value,values:this.getValues()},{bubbles:!0})})}),this.querySelectorAll("au-switch").forEach((C)=>{this.listen(C,"au-change",(k)=>{let B=C.dataset.field;this._values[B]=k.detail.checked,this._touched[B]=!0,this.emit("au-change",{field:B,value:k.detail.checked,values:this.getValues()},{bubbles:!0})})})}handleAction(C,k,B){if(C==="submit")this.submit();else if(C==="reset")this.reset()}}if(!customElements.get("au-schema-form"))customElements.define("au-schema-form",z);export{z as AuSchemaForm};
