'use client';

import { useEffect, useState } from 'react';
import { FacilityType } from '@amisimedos/db';

interface ModuleSuggestion {
  module: string;
  reason: string;
}

interface SuggestionResponse {
  facilityType: string;
  suggestions: ModuleSuggestion[];
}

const facilityTypes = Object.values(FacilityType);

export default function CrmAutomationPage() {
  const [selectedType, setSelectedType] = useState<FacilityType>(FacilityType.CLINIC);
  const [suggestions, setSuggestions] = useState<ModuleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/crm/suggest-modules?facilityType=${selectedType}`)
      .then(res => res.json())
      .then((data: SuggestionResponse) => {
        setSuggestions(data.suggestions || []);
      })
      .finally(() => setLoading(false));
  }, [selectedType]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          CRM Automation
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Configure automated lead assignment, follow-ups, and module suggestions
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Auto-Assign Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
              Auto-Assign Leads
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              New leads are automatically assigned to the agent with the least workload for balanced distribution.
            </p>
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <span style={{ color: '#166534', fontSize: '14px', fontWeight: 500 }}>✓ Active</span>
            </div>
          </div>

          {/* Auto Follow-up Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
              Auto Follow-Up Reminders
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              Automatically creates follow-up tasks based on pipeline stage:
            </p>
            <ul style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li><strong>New Lead:</strong> Call within 1 day</li>
              <li><strong>Qualified:</strong> Email info pack within 3 days</li>
              <li><strong>Proposal Sent:</strong> Call within 2 days</li>
              <li><strong>Negotiation:</strong> Call within 1 day</li>
            </ul>
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '6px', border: '1px solid #bbf7d0', marginTop: '12px' }}>
              <span style={{ color: '#166534', fontSize: '14px', fontWeight: 500 }}>✓ Active</span>
            </div>
          </div>
        </div>

        {/* Module Suggestions */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: '#111827' }}>
            Module Suggestions by Facility Type
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            When a new lead is created, suggested modules are automatically added based on their facility type.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Select Facility Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as FacilityType)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: 'white',
                minWidth: '200px',
              }}
            >
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={String(index)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginRight: '8px',
                    }}>
                      {String(suggestion.module)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    {String(suggestion.reason)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
