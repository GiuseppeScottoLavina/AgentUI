import{j as B}from"./chunk-bxze911z.js";import{n as C,o as F}from"./chunk-y03bwgrc.js";class K extends C{static baseClass="au-api-table";static observedAttributes=["type"];render(){let x=this.attr("type","attributes"),z=Array.from(this.querySelectorAll("au-api-row")),q={attributes:["Name","Type","Default","Description"],properties:["Name","Type","Description"],methods:["Name","Signature","Description"],events:["Name","Detail","Description"],tokens:["Token","Default","Description"]},G=q[x]||q.attributes,I=z.map((v)=>({name:v.getAttribute("name")||"",type:v.getAttribute("type")||"",default:v.getAttribute("default")||"-",signature:v.getAttribute("signature")||"",detail:v.getAttribute("detail")||"",description:v.textContent.trim()}));this.innerHTML=`
            <table class="au-api-table__table">
                <thead>
                    <tr>
                        ${G.map((v)=>`<th>${v}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${I.map((v)=>this.#k(x,v)).join("")}
                </tbody>
            </table>
        `,this.#q()}#k(x,z){let q={name:B(z.name),type:B(z.type),default:B(z.default),signature:B(z.signature),detail:B(z.detail),description:B(z.description)};switch(x){case"attributes":return`<tr>
                    <td><code>${q.name}</code></td>
                    <td><code class="type">${q.type}</code></td>
                    <td><code class="default">${q.default}</code></td>
                    <td>${q.description}</td>
                </tr>`;case"properties":return`<tr>
                    <td><code>${q.name}</code></td>
                    <td><code class="type">${q.type}</code></td>
                    <td>${q.description}</td>
                </tr>`;case"methods":return`<tr>
                    <td><code>${q.name}</code></td>
                    <td><code class="signature">${q.signature}</code></td>
                    <td>${q.description}</td>
                </tr>`;case"events":return`<tr>
                    <td><code>${q.name}</code></td>
                    <td><code class="detail">${q.detail}</code></td>
                    <td>${q.description}</td>
                </tr>`;case"tokens":return`<tr>
                    <td><code>${q.name}</code></td>
                    <td><code class="default">${q.default}</code></td>
                    <td>${q.description}</td>
                </tr>`;default:return""}}#q(){this.style.display="block",this.style.overflowX="auto",this.style.marginBottom="24px";let x=this.querySelector(".au-api-table__table");if(x)x.style.width="100%",x.style.borderCollapse="collapse",x.style.fontSize="var(--md-sys-typescale-body-medium-size)";this.querySelectorAll("th").forEach((k)=>{k.style.textAlign="left",k.style.padding="16px",k.style.height="56px",k.style.background="var(--md-sys-color-surface-container)",k.style.fontWeight="500",k.style.color="var(--md-sys-color-on-surface)",k.style.borderBottom="1px solid var(--md-sys-color-outline-variant)"}),this.querySelectorAll("td").forEach((k)=>{k.style.padding="16px",k.style.minHeight="52px",k.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",k.style.verticalAlign="middle",k.style.lineHeight="1.5"}),this.querySelectorAll("code").forEach((k)=>{k.style.fontFamily="'Fira Code', monospace",k.style.fontSize="13px",k.style.padding="2px 6px",k.style.borderRadius="4px",k.style.background="var(--md-sys-color-surface-container-highest)"}),this.querySelectorAll("code.type, code.detail").forEach((k)=>{k.style.color="var(--md-sys-color-primary)"}),this.querySelectorAll("code.default").forEach((k)=>{k.style.color="var(--md-sys-color-secondary)"})}}class N extends C{static baseClass="au-api-row";static observedAttributes=["name","type","default","signature","detail"];render(){}}F("au-api-table",K);F("au-api-row",N);export{K as AuApiTable,N as AuApiRow};
