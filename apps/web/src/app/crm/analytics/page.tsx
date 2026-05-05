'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface AnalyticsData {
  kpis: {
    totalLeads: number;
    conversionRate: number;
    revenue: number;
    pipelineValue: number;
    wonLeads: number;
  };
  leadsPerSource: { source: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function CrmAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crm/analytics')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (!data) return <div className="p-8">Failed to load analytics.</div>;

  const { kpis, leadsPerSource } = data;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const conversionData = [
    { name: 'Won', value: kpis.wonLeads },
    { name: 'Lost/Open', value: kpis.totalLeads - kpis.wonLeads },
  ];

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const cardTitleStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: '8px',
  };

  const cardValueStyle = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
  };

  const chartCardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
          CRM Analytics
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Total Leads</div>
            <div style={cardValueStyle}>{kpis.totalLeads}</div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Conversion Rate</div>
            <div style={cardValueStyle}>{kpis.conversionRate}%</div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Revenue Generated</div>
            <div style={cardValueStyle}>{formatCurrency(kpis.revenue)}</div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Pipeline Value</div>
            <div style={cardValueStyle}>{formatCurrency(kpis.pipelineValue)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div style={chartCardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Leads per Source
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsPerSource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={chartCardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Conversion Rate
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conversionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
