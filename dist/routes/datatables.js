import{a as f}from"./chunk-zv0xkssz.js";import"./chunk-jn8zd153.js";import"./chunk-ce0w0142.js";import"./chunk-wvr0ptzf.js";import"./chunk-s1kj67sf.js";import{i as p,l as c,m as h}from"./chunk-afwem87e.js";class m extends p{static get observedAttributes(){return["columns","page-size","sortable","selectable","filterable","empty-message"]}static baseClass="au-datatable";static cssFile="datatable";constructor(){super();this._data=[],this._filteredData=[],this._columns=[],this._currentPage=1,this._sortField=null,this._sortDirection="asc",this._selectedRows=new Set,this._filterValue=""}get columns(){let t=this.getAttribute("columns");if(t)try{return JSON.parse(t)}catch(a){return console.warn("[au-datatable] Invalid columns JSON:",a),[]}return this._columns}set columns(t){if(this._columns=Array.isArray(t)?t:[],this.isConnected)this.render()}get pageSize(){return parseInt(this.getAttribute("page-size"))||10}set pageSize(t){this.setAttribute("page-size",t)}get sortable(){return this.hasAttribute("sortable")}get selectable(){return this.hasAttribute("selectable")}get filterable(){return this.hasAttribute("filterable")}get emptyMessage(){return this.getAttribute("empty-message")||"No data available"}connectedCallback(){super.connectedCallback(),this.render()}attributeChangedCallback(t,a,e){if(this.isConnected&&a!==e)this.render()}setData(t){this._data=Array.isArray(t)?t:[],this._filteredData=[...this._data],this._currentPage=1,this._selectedRows.clear(),this._applySort(),this.render(),this.emit("au-data-change",{data:this._data,count:this._data.length},{bubbles:!0})}getData(){return[...this._data]}getSortState(){return{field:this._sortField,direction:this._sortDirection}}getSelectedRows(){return this._data.filter((t,a)=>this._selectedRows.has(a))}getPageInfo(){let t=Math.ceil(this._filteredData.length/this.pageSize);return{page:this._currentPage,pageSize:this.pageSize,totalPages:t,totalRows:this._filteredData.length}}goToPage(t){let a=Math.ceil(this._filteredData.length/this.pageSize)||1;this._currentPage=Math.max(1,Math.min(t,a)),this.render(),this.emit("au-page-change",this.getPageInfo(),{bubbles:!0})}sortBy(t,a){if(this._sortField===t&&!a)this._sortDirection=this._sortDirection==="asc"?"desc":"asc";else this._sortField=t,this._sortDirection=a||"asc";this._applySort(),this.render(),this.emit("au-sort-change",this.getSortState(),{bubbles:!0})}filter(t){this._filterValue=t.toLowerCase(),this._applyFilter(),this._currentPage=1,this.render(!1)}_applySort(){if(!this._sortField)return;this._filteredData.sort((t,a)=>{let e=t[this._sortField]??"",s=a[this._sortField]??"";if(typeof e==="number"&&typeof s==="number")return this._sortDirection==="asc"?e-s:s-e;let i=String(e).toLowerCase(),r=String(s).toLowerCase(),l=i.localeCompare(r);return this._sortDirection==="asc"?l:-l})}_applyFilter(){if(!this._filterValue){this._filteredData=[...this._data];return}let t=this.columns.filter((e)=>e.filterable!==!1),a=t.length>0?t.map((e)=>e.field):this.columns.map((e)=>e.field);this._filteredData=this._data.filter((e)=>{return a.some((s)=>{return String(e[s]??"").toLowerCase().includes(this._filterValue)})})}_getPageData(){let t=(this._currentPage-1)*this.pageSize,a=t+this.pageSize;return this._filteredData.slice(t,a)}_handleHeaderClick(t){if(this.columns.find((a)=>a.field===t)?.sortable!==!1&&this.sortable)this.sortBy(t)}_handleRowSelect(t,a){let e=(this._currentPage-1)*this.pageSize+t;if(a)this._selectedRows.add(e);else this._selectedRows.delete(e);this.render(),this.emit("au-selection-change",{selected:this.getSelectedRows()},{bubbles:!0})}_handleSelectAll(t){let a=this._getPageData(),e=(this._currentPage-1)*this.pageSize;a.forEach((s,i)=>{if(t)this._selectedRows.add(e+i);else this._selectedRows.delete(e+i)}),this.render(),this.emit("au-selection-change",{selected:this.getSelectedRows()},{bubbles:!0})}render(t=!0){let a=this.columns,e=this._getPageData(),{page:s,totalPages:i,totalRows:r}=this.getPageInfo(),l=(this._currentPage-1)*this.pageSize,d=e.length>0&&e.every((n,u)=>this._selectedRows.has(l+u)),o=this.querySelector(".au-datatable-table tbody"),g=this.querySelector(".au-datatable-info"),b=this.querySelector(".au-datatable-pagination");if(!t&&o){if(o.innerHTML=this._renderTbody(e,a,l,d),g)g.innerHTML=`${r} row${r!==1?"s":""}${this._selectedRows.size>0?` · ${this._selectedRows.size} selected`:""}`;if(b)b.innerHTML=this._renderPaginationContent(s,i,r);else if(i>1){let n=this.querySelector(".au-datatable-wrapper");if(n)n.insertAdjacentHTML("beforeend",this._renderPagination(s,i,r))}this._attachEventListeners();return}this.innerHTML=h`
            <div class="au-datatable-wrapper">
                ${this.filterable?h`
                    <div class="au-datatable-toolbar">
                        <div class="au-datatable-search">
                            <input 
                                type="search" 
                                placeholder="Search..." 
                                value="${this._filterValue}"
                            >
                        </div>
                        <div class="au-datatable-info">
                            ${r} row${r!==1?"s":""}
                            ${this._selectedRows.size>0?` · ${this._selectedRows.size} selected`:""}
                        </div>
                    </div>
                `:""}

                <table class="au-datatable-table">
                    <thead>
                        <tr>
                            ${this.selectable?h`
                                <th class="au-datatable-checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        ${d?"checked":""}
                                        data-select-all
                                    >
                                </th>
                            `:""}
                            ${c(a.map((n)=>{let u=n.sortable!==!1&&this.sortable,_=this._sortField===n.field,S=_?this._sortDirection==="asc"?"↑":"↓":"↕";return h`
                                    <th 
                                        class="${u?"au-datatable-sortable":""} ${_?"au-datatable-sorted":""}"
                                        data-field="${n.field}"
                                    >
                                        ${n.label||n.field}
                                        ${u?`<span class="au-datatable-sort-icon">${S}</span>`:""}
                                    </th>
                                `}).join(""))}
                        </tr>
                    </thead>
                    <tbody>
                        ${c(this._renderTbody(e,a,l,d))}
                    </tbody>
                </table>

                ${c(this._renderPagination(s,i,r))}
            </div>
        `,this._attachEventListeners()}_renderTbody(t,a,e,s){if(t.length===0)return h`
                <tr>
                    <td colspan="${a.length+(this.selectable?1:0)}" class="au-datatable-empty-state">
                        ${this.emptyMessage}
                    </td>
                </tr>
            `;return t.map((i,r)=>{let l=e+r,d=this._selectedRows.has(l);return h`
                <tr class="${d?"au-datatable-selected":""}" data-row-index="${r}">
                    ${this.selectable?h`
                        <td class="au-datatable-checkbox-cell">
                            <input 
                                type="checkbox" 
                                ${d?"checked":""}
                                data-row-select="${r}"
                            >
                        </td>
                    `:""}
                    ${c(a.map((o)=>h`
                        <td data-field="${o.field}">
                            ${o.render?c(o.render(i[o.field],i)):i[o.field]??""}
                        </td>
                    `).join(""))}
                </tr>
            `}).join("")}_renderPagination(t,a,e){if(a<=1)return"";return`
            <div class="au-datatable-pagination">
                ${this._renderPaginationContent(t,a,e)}
            </div>
        `}_renderPaginationContent(t,a,e){return`
            <div class="au-datatable-pagination-info">
                Showing ${(t-1)*this.pageSize+1}–${Math.min(t*this.pageSize,e)} of ${e}
            </div>
            <div class="au-datatable-pagination-controls">
                <button class="au-datatable-pagination-btn" data-page="prev" ${t<=1?"disabled":""}>
                    ←
                </button>
                ${this._getPaginationButtons(t,a)}
                <button class="au-datatable-pagination-btn" data-page="next" ${t>=a?"disabled":""}>
                    →
                </button>
            </div>
        `}_getPaginationButtons(t,a){let e=[],s=5,i=Math.max(1,t-Math.floor(2.5)),r=Math.min(a,i+5-1);if(r-i<4)i=Math.max(1,r-5+1);for(let l=i;l<=r;l++)e.push(`
                <button 
                    class="au-datatable-pagination-btn ${l===t?"au-datatable-pagination-btn-active":""}"
                    data-page="${l}"
                >
                    ${l}
                </button>
            `);return e.join("")}_attachEventListeners(){this.querySelectorAll("th.au-datatable-sortable").forEach((e)=>{this.listen(e,"click",()=>{this._handleHeaderClick(e.dataset.field)})}),this.querySelectorAll(".au-datatable-pagination-btn[data-page]").forEach((e)=>{this.listen(e,"click",()=>{let s=e.dataset.page;if(s==="prev")this.goToPage(this._currentPage-1);else if(s==="next")this.goToPage(this._currentPage+1);else this.goToPage(parseInt(s))})}),this.querySelectorAll("[data-row-select]").forEach((e)=>{this.listen(e,"change",(s)=>{this._handleRowSelect(parseInt(e.dataset.rowSelect),s.target.checked)})});let t=this.querySelector("[data-select-all]");if(t)this.listen(t,"change",(e)=>{this._handleSelectAll(e.target.checked)});let a=this.querySelector(".au-datatable-search input");if(a){let e=f((s)=>this.filter(s),300);this.listen(a,"input",(s)=>e(s.target.value))}}}if(!customElements.get("au-datatable"))customElements.define("au-datatable",m);
