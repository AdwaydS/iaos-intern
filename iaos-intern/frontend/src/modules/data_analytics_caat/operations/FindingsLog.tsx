import { ClipboardList } from "lucide-react";

export default function FindingsLog() {

return(

<>

<h2>Observation & Finding Log</h2>

<p className="subtitle">
Track audit observations and findings.
</p>

<div className="caat-grid">

<div className="caat-card">
<ClipboardList className="icon"/>
<h2>64</h2>
<span>Total Findings</span>
</div>

<div className="caat-card">
<h2>18</h2>
<span>High Risk</span>
</div>

<div className="caat-card">
<h2>26</h2>
<span>Open</span>
</div>

</div>

<div className="caat-section">

<h2>Findings</h2>

<table>

<thead>

<tr>

<th>ID</th>
<th>Finding</th>
<th>Risk</th>
<th>Status</th>

</tr>

</thead>

<tbody>

<tr>

<td>FD001</td>
<td>Duplicate Vendor</td>
<td>High</td>
<td>Open</td>

</tr>

<tr>

<td>FD002</td>
<td>Missing Invoice</td>
<td>Medium</td>
<td>Assigned</td>

</tr>

<tr>

<td>FD003</td>
<td>Weekend Posting</td>
<td>High</td>
<td>Closed</td>

</tr>

</tbody>

</table>

</div>

</>

);

}