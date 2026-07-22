export default function ScopeAuditUniverse() {

const units=[
{
entity:"Corporate HQ",
process:"Finance",
risk:"High",
status:"In Scope",
owner:"Finance Head"
},
{
entity:"Factory A",
process:"Procurement",
risk:"Medium",
status:"In Scope",
owner:"Purchase Head"
},
{
entity:"Warehouse",
process:"Inventory",
risk:"High",
status:"Pending",
owner:"Operations"
},
{
entity:"Sales Office",
process:"Revenue",
risk:"Low",
status:"Out of Scope",
owner:"Sales"
}
];

return(

<div>

<h2>Scope & Audit Universe</h2>

<p
style={{
color:"var(--slate)",
marginBottom:20
}}
>
Define auditable entities, business units and processes.
</p>

<div className="caat-grid">

<div className="caat-card">
<h2>32</h2>
<span>Entities</span>
</div>

<div className="caat-card">
<h2>84</h2>
<span>Processes</span>
</div>

<div className="caat-card">
<h2>21</h2>
<span>High Risk</span>
</div>

<div className="caat-card">
<h2>82%</h2>
<span>Coverage</span>
</div>

</div>

<div className="chart-card">

<h3>Audit Universe</h3>

<table>

<thead>

<tr>

<th>Entity</th>
<th>Process</th>
<th>Risk</th>
<th>Status</th>
<th>Owner</th>

</tr>

</thead>

<tbody>

{units.map((u)=>(
<tr key={u.entity}>

<td>{u.entity}</td>

<td>{u.process}</td>

<td>{u.risk}</td>

<td>{u.status}</td>

<td>{u.owner}</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

);

}