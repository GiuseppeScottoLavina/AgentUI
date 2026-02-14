import{n as Q,o as G}from"./chunk-0f7ph7sp.js";import{p as X}from"./chunk-aeetm00j.js";class Y extends X{static get observedAttributes(){return["submit-label","reset-label","inline","readonly","disabled"]}static baseClass="au-schema-form";static cssFile="schema-form";constructor(){super();this._schema=null,this._values={},this._errors={},this._touched={}}get schema(){return this._schema}set schema(B){if(this._schema=B,this._initializeValues(),this.isConnected)this.render()}get submitLabel(){return this.getAttribute("submit-label")||"Submit"}get resetLabel(){return this.getAttribute("reset-label")||"Reset"}get inline(){return this.hasAttribute("inline")}get readonly(){return this.hasAttribute("readonly")}get disabled(){return this.hasAttribute("disabled")}connectedCallback(){super.connectedCallback(),this.render()}attributeChangedCallback(B,k,C){if(this.isConnected&&k!==C)this.render()}getValues(){return{...this._values}}setValues(B){this._values={...this._values,...B},this.render()}validate(){if(!this._schema||!this._schema.properties)return!0;this._errors={};let B=this._schema.required||[];for(let[k,C]of Object.entries(this._schema.properties)){let I=this._values[k],D=this._validateField(k,I,C,B.includes(k));if(D.length>0)this._errors[k]=D}return this.render(),Object.keys(this._errors).length===0}getErrors(){return{...this._errors}}reset(){this._initializeValues(),this._errors={},this._touched={},this.render(),this.emit("au-reset",{values:this.getValues()},{bubbles:!0})}submit(){if(this.validate())this.emit("au-submit",this.getValues(),{bubbles:!0})}_initializeValues(){if(this._values={},!this._schema||!this._schema.properties)return;for(let[B,k]of Object.entries(this._schema.properties))if(k.default!==void 0)this._values[B]=k.default;else if(k.type==="boolean")this._values[B]=!1;else if(k.type==="number"||k.type==="integer")this._values[B]=null;else this._values[B]=""}_validateField(B,k,C,I){let D=[];if(I&&(k===""||k===null||k===void 0))return D.push(`${C.title||B} is required`),D;if(k===""||k===null||k===void 0)return D;if(C.type==="string"){if(C.minLength&&k.length<C.minLength)D.push(`Minimum ${C.minLength} characters`);if(C.maxLength&&k.length>C.maxLength)D.push(`Maximum ${C.maxLength} characters`);if(C.pattern&&!new RegExp(C.pattern).test(k))D.push(C.patternError||"Invalid format");if(C.format==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k))D.push("Invalid email address");if(C.format==="url"&&!/^https?:\/\/.+/.test(k))D.push("Invalid URL")}if(C.type==="number"||C.type==="integer"){let J=Number(k);if(isNaN(J))D.push("Must be a number");else{if(C.minimum!==void 0&&J<C.minimum)D.push(`Minimum value is ${C.minimum}`);if(C.maximum!==void 0&&J>C.maximum)D.push(`Maximum value is ${C.maximum}`)}}return D}_getInputType(B){if(B.format==="email")return"email";if(B.format==="password")return"password";if(B.format==="date")return"date";if(B.format==="time")return"time";if(B.format==="datetime-local")return"datetime-local";if(B.format==="url")return"url";if(B.format==="tel")return"tel";if(B.type==="number"||B.type==="integer")return"number";return"text"}_renderField(B,k,C){let I=this._values[B]??"",D=this._errors[B]||[],J=D.length>0,L=k.title||B,U=k.placeholder||"",K=k.description||"",O=J?D[0]:"",N=this.disabled||k.readOnly,W=this.readonly;if(k.type==="boolean")return G`
                <div class="au-schema-form-field" data-field="${B}">
                    <div class="au-schema-form-switch-row">
                        <au-switch 
                            ${I?"checked":""}
                            ${N?"disabled":""}
                            data-field="${B}"
                        ></au-switch>
                        <label class="au-schema-form-switch-label">${L}</label>
                    </div>
                    ${K?G`<div class="au-schema-form-description">${K}</div>`:""}
                </div>
            `;if(k.enum){let _=k.enum.map((P,$)=>{return G`<au-option value="${String(P)}" ${I===P?"selected":""}>${k.enumLabels?.[$]||String(P)}</au-option>`}).join("");return G`
                <div class="au-schema-form-field ${J?"au-schema-form-field-error":""}" data-field="${B}">
                    <au-dropdown 
                        label="${L}${C?" *":""}"
                        value="${String(I)}"
                        ${N?"disabled":""}
                        ${C?"required":""}
                        data-field="${B}"
                    >
                        ${Q(_)}
                    </au-dropdown>
                    ${K?G`<div class="au-schema-form-description">${K}</div>`:""}
                    ${J?G`<div class="au-schema-form-error">${O}</div>`:""}
                </div>
            `}if(k.type==="string"&&k.multiline)return G`
                <div class="au-schema-form-field ${J?"au-schema-form-field-error":""}" data-field="${B}">
                    <au-textarea
                        label="${L}${C?" *":""}"
                        placeholder="${U}"
                        ${N?"disabled":""}
                        ${W?"readonly":""}
                        ${C?"required":""}
                        data-field="${B}"
                    >${String(I)}</au-textarea>
                    ${K?G`<div class="au-schema-form-description">${K}</div>`:""}
                    ${J?G`<div class="au-schema-form-error">${O}</div>`:""}
                </div>
            `;let Z=this._getInputType(k);return G`
            <div class="au-schema-form-field ${J?"au-schema-form-field-error":""}" data-field="${B}">
                <au-input
                    type="${Z}"
                    label="${L}${C?" *":""}"
                    placeholder="${U}"
                    value="${String(I)}"
                    ${N?"disabled":""}
                    ${W?"readonly":""}
                    ${C?"required":""}
                    ${k.minimum!==void 0?`min="${k.minimum}"`:""}
                    ${k.maximum!==void 0?`max="${k.maximum}"`:""}
                    ${k.minLength?`minlength="${k.minLength}"`:""}
                    ${k.maxLength?`maxlength="${k.maxLength}"`:""}
                    data-field="${B}"
                ></au-input>
                ${K?G`<div class="au-schema-form-description">${K}</div>`:""}
                ${J?G`<div class="au-schema-form-error">${O}</div>`:""}
            </div>
        `}render(){if(!this._schema||!this._schema.properties){this.innerHTML=`
                <div class="au-schema-form-empty-state">
                    Set the <code>schema</code> property to generate a form
                </div>
            `;return}let B=this._schema.required||[],k=Object.entries(this._schema.properties).map(([C,I])=>this._renderField(C,I,B.includes(C))).join("");this.innerHTML=G`
            <div class="au-schema-form ${this.inline?"au-schema-form-inline":""}">
                ${Q(k)}
                
                <div class="au-schema-form-actions">
                    <au-button variant="filled" data-action="submit" ${this.disabled?"disabled":""}>
                        ${this.submitLabel}
                    </au-button>
                    <au-button variant="text" data-action="reset" ${this.disabled?"disabled":""}>
                        ${this.resetLabel}
                    </au-button>
                </div>
            </div>
        `,this._attachEventListeners()}_attachEventListeners(){this.querySelectorAll("au-input").forEach((B)=>{this.listen(B,"au-input",(k)=>{let C=B.dataset.field;if(this._values[C]=k.detail.value,this._touched[C]=!0,this._errors[C])delete this._errors[C],B.closest(".au-schema-form-field").classList.remove("au-schema-form-field-error"),B.closest(".au-schema-form-field").querySelector(".au-schema-form-error")?.remove();this.emit("au-change",{field:C,value:k.detail.value,values:this.getValues()},{bubbles:!0})})}),this.querySelectorAll("au-textarea").forEach((B)=>{this.listen(B,"au-input",(k)=>{let C=B.dataset.field;this._values[C]=k.detail.value,this._touched[C]=!0,this.emit("au-change",{field:C,value:k.detail.value,values:this.getValues()},{bubbles:!0})})}),this.querySelectorAll("au-dropdown").forEach((B)=>{this.listen(B,"au-change",(k)=>{let C=B.dataset.field;this._values[C]=k.detail.value,this._touched[C]=!0,this.emit("au-change",{field:C,value:k.detail.value,values:this.getValues()},{bubbles:!0})})}),this.querySelectorAll("au-switch").forEach((B)=>{this.listen(B,"au-change",(k)=>{let C=B.dataset.field;this._values[C]=k.detail.checked,this._touched[C]=!0,this.emit("au-change",{field:C,value:k.detail.checked,values:this.getValues()},{bubbles:!0})})})}handleAction(B,k,C){if(B==="submit")this.submit();else if(B==="reset")this.reset()}}if(!customElements.get("au-schema-form"))customElements.define("au-schema-form",Y);export{Y as AuSchemaForm};
