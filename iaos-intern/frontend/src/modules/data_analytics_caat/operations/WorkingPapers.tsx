import { FileText } from "lucide-react";

export default function WorkingPapers() {

return(

<>

<h2>Working Papers & Evidence</h2>

<p className="subtitle">
Maintain audit working papers and supporting evidence.
</p>

<div className="caat-grid">

<div className="caat-card">
<FileText className="icon"/>
<h2>148</h2>
<span>Working Papers</span>
</div>

<div className="caat-card">
<h2>92%</h2>
<span>Reviewed</span>
</div>

<div className="caat-card">
<h2>41</h2>
<span>Pending Review</span>
</div>

</div>

<div className="caat-section">

<h2>Documents</h2>

<table>

<thead>
<tr>
<th>Paper</th>
<th>Owner</th>
<th>Status</th>
</tr>
</thead>

<tbody>

<tr>
<td>Revenue Testing</td>
<td>Audit Team</td>
<td>Approved</td>
</tr>

<tr>
<td>Payroll Review</td>
<td>Rajesh</td>
<td>Pending</td>
</tr>

<tr>
<td>Vendor Analysis</td>
<td>HS</td>
<td>Draft</td>
</tr>

</tbody>

</table>

</div>

</>

);

}