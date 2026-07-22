import { CheckCircle2 } from "lucide-react";

export default function RemediationTracker(){

return(

<>

<h2>Remediation / Action Tracker</h2>

<p className="subtitle">
Track corrective actions and CAPA progress.
</p>

<div className="caat-grid">

<div className="caat-card">
<CheckCircle2 className="icon"/>
<h2>34</h2>
<span>Action Items</span>
</div>

<div className="caat-card">
<h2>21</h2>
<span>Completed</span>
</div>

<div className="caat-card">
<h2>13</h2>
<span>Pending</span>
</div>

</div>

<div className="caat-section">

<h2>CAPA Tracker</h2>

<table>

<thead>

<tr>

<th>Action</th>
<th>Owner</th>
<th>Due</th>
<th>Status</th>

</tr>

</thead>

<tbody>

<tr>

<td>Update Vendor Master</td>
<td>Finance</td>
<td>20 Jul</td>
<td>Open</td>

</tr>

<tr>

<td>Review Payroll</td>
<td>HR</td>
<td>22 Jul</td>
<td>In Progress</td>

</tr>

<tr>

<td>Invoice Validation</td>
<td>AP</td>
<td>25 Jul</td>
<td>Completed</td>

</tr>

</tbody>

</table>

</div>

</>

);

}