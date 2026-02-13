import{i as r}from"./chunk-kma5vhbb.js";import{j as o,k as d}from"./chunk-9rtqr92f.js";class i extends o{static baseClass="au-api-table";static observedAttributes=["type"];render(){let a=this.attr("type","attributes"),t=Array.from(this.querySelectorAll("au-api-row")),e={attributes:["Name","Type","Default","Description"],properties:["Name","Type","Description"],methods:["Name","Signature","Description"],events:["Name","Detail","Description"],tokens:["Token","Default","Description"]},c=e[a]||e.attributes,n=t.map((s)=>({name:s.getAttribute("name")||"",type:s.getAttribute("type")||"",default:s.getAttribute("default")||"-",signature:s.getAttribute("signature")||"",detail:s.getAttribute("detail")||"",description:s.textContent.trim()}));this.innerHTML=`
            <table class="au-api-table__table">
                <thead>
                    <tr>
                        ${c.map((s)=>`<th>${s}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${n.map((s)=>this.#t(a,s)).join("")}
                </tbody>
            </table>
        `,this.#e()}#t(a,t){let e={name:r(t.name),type:r(t.type),default:r(t.default),signature:r(t.signature),detail:r(t.detail),description:r(t.description)};switch(a){case"attributes":return`<tr>
                    <td><code>${e.name}</code></td>
                    <td><code class="type">${e.type}</code></td>
                    <td><code class="default">${e.default}</code></td>
                    <td>${e.description}</td>
                </tr>`;case"properties":return`<tr>
                    <td><code>${e.name}</code></td>
                    <td><code class="type">${e.type}</code></td>
                    <td>${e.description}</td>
                </tr>`;case"methods":return`<tr>
                    <td><code>${e.name}</code></td>
                    <td><code class="signature">${e.signature}</code></td>
                    <td>${e.description}</td>
                </tr>`;case"events":return`<tr>
                    <td><code>${e.name}</code></td>
                    <td><code class="detail">${e.detail}</code></td>
                    <td>${e.description}</td>
                </tr>`;case"tokens":return`<tr>
                    <td><code>${e.name}</code></td>
                    <td><code class="default">${e.default}</code></td>
                    <td>${e.description}</td>
                </tr>`;default:return""}}#e(){this.style.display="block",this.style.overflowX="auto",this.style.marginBottom="24px";let a=this.querySelector(".au-api-table__table");if(a)a.style.width="100%",a.style.borderCollapse="collapse",a.style.fontSize="var(--md-sys-typescale-body-medium-size)";this.querySelectorAll("th").forEach((t)=>{t.style.textAlign="left",t.style.padding="16px",t.style.height="56px",t.style.background="var(--md-sys-color-surface-container)",t.style.fontWeight="500",t.style.color="var(--md-sys-color-on-surface)",t.style.borderBottom="1px solid var(--md-sys-color-outline-variant)"}),this.querySelectorAll("td").forEach((t)=>{t.style.padding="16px",t.style.minHeight="52px",t.style.borderBottom="1px solid var(--md-sys-color-outline-variant)",t.style.verticalAlign="middle",t.style.lineHeight="1.5"}),this.querySelectorAll("code").forEach((t)=>{t.style.fontFamily="'Fira Code', monospace",t.style.fontSize="13px",t.style.padding="2px 6px",t.style.borderRadius="4px",t.style.background="var(--md-sys-color-surface-container-highest)"}),this.querySelectorAll("code.type, code.detail").forEach((t)=>{t.style.color="var(--md-sys-color-primary)"}),this.querySelectorAll("code.default").forEach((t)=>{t.style.color="var(--md-sys-color-secondary)"})}}class l extends o{static baseClass="au-api-row";static observedAttributes=["name","type","default","signature","detail"];render(){}}d("au-api-table",i);d("au-api-row",l);
