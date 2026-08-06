import {
ResponsiveContainer,
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
PieChart,
Pie,
Cell
} from "recharts";

const trend=[
{month:"Jan",risk:45},
{month:"Feb",risk:50},
{month:"Mar",risk:58},
{month:"Apr",risk:62},
{month:"May",risk:55},
{month:"Jun",risk:69},
];

const coverage=[
{name:"Covered",value:82},
{name:"Pending",value:18},
];

const colors=["#2563EB","#F59E0B"];

export default function ModuleDashboard(){

return(

<div>

<h2>Module Dashboard & KPIs</h2>

<p style={{color:"var(--slate)",marginBottom:20}}>
Executive summary of Data Analytics & CAAT performance.
</p>

<div className="caat-grid">

<div className="caat-card">
<h2>82%</h2>
<span>Audit Coverage</span>
</div>

<div className="caat-card">
<h2>41</h2>
<span>Open Exceptions</span>
</div>

<div className="caat-card">
<h2>18</h2>
<span>Open Findings</span>
</div>

<div className="caat-card">
<h2>97%</h2>
<span>Compliance</span>
</div>

</div>

<div className="chart-grid">

<div className="chart-card">

<h3>Risk Trend</h3>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={trend}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="month"/>

<YAxis/>

<Tooltip/>

<Line
dataKey="risk"
stroke="#2563EB"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

<h3>Audit Coverage</h3>

<ResponsiveContainer width="100%" height={300}>

<PieChart>

<Pie
data={coverage}
dataKey="value"
outerRadius={90}
>

{coverage.map((_,i)=>

<Cell
key={i}
fill={colors[i]}
/>

)}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

</div>

</div>

);

}