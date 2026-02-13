import{h as E}from"./chunk-hwrk9hgf.js";import{j as Z}from"./chunk-bxze911z.js";import{n as C}from"./chunk-nm01bj9t.js";class F extends C{static get observedAttributes(){return["columns","page-size","sortable","selectable","filterable","empty-message"]}static baseClass="au-datatable";static cssFile="datatable";constructor(){super();this._data=[],this._filteredData=[],this._columns=[],this._currentPage=1,this._sortField=null,this._sortDirection="asc",this._selectedRows=new Set,this._filterValue=""}get columns(){let z=this.getAttribute("columns");if(z)try{return JSON.parse(z)}catch(J){return console.warn("[au-datatable] Invalid columns JSON:",J),[]}return this._columns}set columns(z){if(this._columns=Array.isArray(z)?z:[],this.isConnected)this.render()}get pageSize(){return parseInt(this.getAttribute("page-size"))||10}set pageSize(z){this.setAttribute("page-size",z)}get sortable(){return this.hasAttribute("sortable")}get selectable(){return this.hasAttribute("selectable")}get filterable(){return this.hasAttribute("filterable")}get emptyMessage(){return this.getAttribute("empty-message")||"No data available"}connectedCallback(){super.connectedCallback(),this.render()}attributeChangedCallback(z,J,G){if(this.isConnected&&J!==G)this.render()}setData(z){this._data=Array.isArray(z)?z:[],this._filteredData=[...this._data],this._currentPage=1,this._selectedRows.clear(),this._applySort(),this.render(),this.emit("au-data-change",{data:this._data,count:this._data.length},{bubbles:!0})}getData(){return[...this._data]}getSortState(){return{field:this._sortField,direction:this._sortDirection}}getSelectedRows(){return this._data.filter((z,J)=>this._selectedRows.has(J))}getPageInfo(){let z=Math.ceil(this._filteredData.length/this.pageSize);return{page:this._currentPage,pageSize:this.pageSize,totalPages:z,totalRows:this._filteredData.length}}goToPage(z){let J=Math.ceil(this._filteredData.length/this.pageSize)||1;this._currentPage=Math.max(1,Math.min(z,J)),this.render(),this.emit("au-page-change",this.getPageInfo(),{bubbles:!0})}sortBy(z,J){if(this._sortField===z&&!J)this._sortDirection=this._sortDirection==="asc"?"desc":"asc";else this._sortField=z,this._sortDirection=J||"asc";this._applySort(),this.render(),this.emit("au-sort-change",this.getSortState(),{bubbles:!0})}filter(z){this._filterValue=z.toLowerCase(),this._applyFilter(),this._currentPage=1,this.render(!1)}_applySort(){if(!this._sortField)return;this._filteredData.sort((z,J)=>{let G=z[this._sortField]??"",K=J[this._sortField]??"";if(typeof G==="number"&&typeof K==="number")return this._sortDirection==="asc"?G-K:K-G;let O=String(G).toLowerCase(),Q=String(K).toLowerCase(),W=O.localeCompare(Q);return this._sortDirection==="asc"?W:-W})}_applyFilter(){if(!this._filterValue){this._filteredData=[...this._data];return}let z=this.columns.filter((G)=>G.filterable!==!1),J=z.length>0?z.map((G)=>G.field):this.columns.map((G)=>G.field);this._filteredData=this._data.filter((G)=>{return J.some((K)=>{return String(G[K]??"").toLowerCase().includes(this._filterValue)})})}_getPageData(){let z=(this._currentPage-1)*this.pageSize,J=z+this.pageSize;return this._filteredData.slice(z,J)}_handleHeaderClick(z){if(this.columns.find((G)=>G.field===z)?.sortable!==!1&&this.sortable)this.sortBy(z)}_handleRowSelect(z,J){let G=(this._currentPage-1)*this.pageSize+z;if(J)this._selectedRows.add(G);else this._selectedRows.delete(G);this.render(),this.emit("au-selection-change",{selected:this.getSelectedRows()},{bubbles:!0})}_handleSelectAll(z){let J=this._getPageData(),G=(this._currentPage-1)*this.pageSize;J.forEach((K,O)=>{if(z)this._selectedRows.add(G+O);else this._selectedRows.delete(G+O)}),this.render(),this.emit("au-selection-change",{selected:this.getSelectedRows()},{bubbles:!0})}render(z=!0){let J=this.columns,G=this._getPageData(),{page:K,totalPages:O,totalRows:Q}=this.getPageInfo(),W=(this._currentPage-1)*this.pageSize,_=G.length>0&&G.every((X,$)=>this._selectedRows.has(W+$)),Y=this.querySelector(".au-datatable-table tbody"),N=this.querySelector(".au-datatable-info"),U=this.querySelector(".au-datatable-pagination");if(!z&&Y){if(Y.innerHTML=this._renderTbody(G,J,W,_),N)N.innerHTML=`${Q} row${Q!==1?"s":""}${this._selectedRows.size>0?` · ${this._selectedRows.size} selected`:""}`;if(U)U.innerHTML=this._renderPaginationContent(K,O,Q);else if(O>1){let X=this.querySelector(".au-datatable-wrapper");if(X)X.insertAdjacentHTML("beforeend",this._renderPagination(K,O,Q))}this._attachEventListeners();return}this.innerHTML=`
            <div class="au-datatable-wrapper">
                ${this.filterable?`
                    <div class="au-datatable-toolbar">
                        <div class="au-datatable-search">
                            <input 
                                type="search" 
                                placeholder="Search..." 
                                value="${Z(this._filterValue)}"
                            >
                        </div>
                        <div class="au-datatable-info">
                            ${Q} row${Q!==1?"s":""}
                            ${this._selectedRows.size>0?` · ${this._selectedRows.size} selected`:""}
                        </div>
                    </div>
                `:""}

                <table class="au-datatable-table">
                    <thead>
                        <tr>
                            ${this.selectable?`
                                <th class="au-datatable-checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        ${_?"checked":""}
                                        data-select-all
                                    >
                                </th>
                            `:""}
                            ${J.map((X)=>{let $=X.sortable!==!1&&this.sortable,q=this._sortField===X.field,j=q?this._sortDirection==="asc"?"↑":"↓":"↕";return`
                                    <th 
                                        class="${$?"au-datatable-sortable":""} ${q?"au-datatable-sorted":""}"
                                        data-field="${Z(X.field)}"
                                    >
                                        ${Z(X.label||X.field)}
                                        ${$?`<span class="au-datatable-sort-icon">${j}</span>`:""}
                                    </th>
                                `}).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${this._renderTbody(G,J,W,_)}
                    </tbody>
                </table>

                ${this._renderPagination(K,O,Q)}
            </div>
        `,this._attachEventListeners()}_renderTbody(z,J,G,K){if(z.length===0)return`
                <tr>
                    <td colspan="${J.length+(this.selectable?1:0)}" class="au-datatable-empty-state">
                        ${Z(this.emptyMessage)}
                    </td>
                </tr>
            `;return z.map((O,Q)=>{let W=G+Q,_=this._selectedRows.has(W);return`
                <tr class="${_?"au-datatable-selected":""}" data-row-index="${Q}">
                    ${this.selectable?`
                        <td class="au-datatable-checkbox-cell">
                            <input 
                                type="checkbox" 
                                ${_?"checked":""}
                                data-row-select="${Q}"
                            >
                        </td>
                    `:""}
                    ${J.map((Y)=>`
                        <td data-field="${Z(Y.field)}">
                            ${Y.render?Y.render(O[Y.field],O):Z(O[Y.field]??"")}
                        </td>
                    `).join("")}
                </tr>
            `}).join("")}_renderPagination(z,J,G){if(J<=1)return"";return`
            <div class="au-datatable-pagination">
                ${this._renderPaginationContent(z,J,G)}
            </div>
        `}_renderPaginationContent(z,J,G){return`
            <div class="au-datatable-pagination-info">
                Showing ${(z-1)*this.pageSize+1}–${Math.min(z*this.pageSize,G)} of ${G}
            </div>
            <div class="au-datatable-pagination-controls">
                <button class="au-datatable-pagination-btn" data-page="prev" ${z<=1?"disabled":""}>
                    ←
                </button>
                ${this._getPaginationButtons(z,J)}
                <button class="au-datatable-pagination-btn" data-page="next" ${z>=J?"disabled":""}>
                    →
                </button>
            </div>
        `}_getPaginationButtons(z,J){let G=[],K=5,O=Math.max(1,z-Math.floor(2.5)),Q=Math.min(J,O+5-1);if(Q-O<4)O=Math.max(1,Q-5+1);for(let W=O;W<=Q;W++)G.push(`
                <button 
                    class="au-datatable-pagination-btn ${W===z?"au-datatable-pagination-btn-active":""}"
                    data-page="${W}"
                >
                    ${W}
                </button>
            `);return G.join("")}_attachEventListeners(){this.querySelectorAll("th.au-datatable-sortable").forEach((G)=>{this.listen(G,"click",()=>{this._handleHeaderClick(G.dataset.field)})}),this.querySelectorAll(".au-datatable-pagination-btn[data-page]").forEach((G)=>{this.listen(G,"click",()=>{let K=G.dataset.page;if(K==="prev")this.goToPage(this._currentPage-1);else if(K==="next")this.goToPage(this._currentPage+1);else this.goToPage(parseInt(K))})}),this.querySelectorAll("[data-row-select]").forEach((G)=>{this.listen(G,"change",(K)=>{this._handleRowSelect(parseInt(G.dataset.rowSelect),K.target.checked)})});let z=this.querySelector("[data-select-all]");if(z)this.listen(z,"change",(G)=>{this._handleSelectAll(G.target.checked)});let J=this.querySelector(".au-datatable-search input");if(J){let G=E((K)=>this.filter(K),300);this.listen(J,"input",(K)=>G(K.target.value))}}}if(!customElements.get("au-datatable"))customElements.define("au-datatable",F);export{F as AuDataTable};
