export default function RiskControlMatrix() {

const controls=[
{
process:"Procurement",
risk:"Duplicate Payments",
control:"Duplicate Invoice Check",
owner:"Finance",
frequency:"Daily",
status:"Effective"
},
{
process:"Payroll",
risk:"Ghost Employees",
control:"HR Master Validation",
owner:"HR",
frequency:"Monthly",
status:"Effective"
},
{
process:"Inventory",
risk:"Stock Theft",
control:"Cycle Count",
owner:"Warehouse",
frequency:"Weekly",
status:"Needs Review"
},
{
process:"Revenue",
risk:"Revenue Leakage",
control:"Invoice Matching",
owner:"Sales",
frequency:"Daily",
status:"Effective"
}
];

return(

<div>

<h2>Risk & Control Matrix</h2>

<p
style={{
color:"var(--slate)",
marginBottom:20
}}
>
Catalogue risks, controls and control owners.
</p>

<div className="caat-grid">

<div className="caat-card">
<h2>64</h2>
<span>Risks</span>
</div>

<div className="caat-card">
<h2>92</h2>
<span>Controls</span>
</div>

<div className="caat-card">
<h2>88%</h2>
<span>Effective</span>
</div>

<div className="caat-card">
<h2>7</h2>
<span>Needs Review</span>
</div>

</div>

<div className="chart-card">

<h3>Risk Control Matrix</h3>

<table>

<thead>

<tr>

<th>Process</th>
<th>Risk</th>
<th>Control</th>
<th>Owner</th>
<th>Frequency</th>
<th>Status</th>

</tr>

</thead>

<tbody>

{controls.map((c)=>(
<tr key={c.control}>

<td>{c.process}</td>
<td>{c.risk}</td>
<td>{c.control}</td>
<td>{c.owner}</td>
<td>{c.frequency}</td>
<td>{c.status}</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

);

}