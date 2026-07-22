export default function RuleLibrary() {

const rules=[
{
name:"Duplicate Invoice",
category:"Payments",
severity:"High",
status:"Active"
},
{
name:"Benford Analysis",
category:"Fraud",
severity:"Medium",
status:"Active"
},
{
name:"Weekend Posting",
category:"Journal",
severity:"High",
status:"Draft"
},
{
name:"Round Amount",
category:"Payments",
severity:"Low",
status:"Active"
},
{
name:"Missing Invoice",
category:"AP",
severity:"High",
status:"Active"
},
];

return(

<div>

<h2>Test & Analytics Rule Library</h2>

<p
style={{
color:"var(--slate)",
marginBottom:20
}}
>
Configure automated audit rules and red-flag analytics.
</p>

<div className="caat-grid">

<div className="caat-card">
<h2>126</h2>
<span>Total Rules</span>
</div>

<div className="caat-card">
<h2>102</h2>
<span>Active</span>
</div>

<div className="caat-card">
<h2>18</h2>
<span>Draft</span>
</div>

<div className="caat-card">
<h2>6</h2>
<span>Disabled</span>
</div>

</div>

<div className="chart-card">

<h3>Analytics Rules</h3>

<table>

<thead>

<tr>

<th>Rule</th>
<th>Category</th>
<th>Severity</th>
<th>Status</th>

</tr>

</thead>

<tbody>

{rules.map((rule)=>(
<tr key={rule.name}>

<td>{rule.name}</td>

<td>{rule.category}</td>

<td>{rule.severity}</td>

<td>{rule.status}</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

);

}