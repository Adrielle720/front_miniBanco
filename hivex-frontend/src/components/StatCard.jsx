import React from 'react';

export default function StatCard({ label, value, sub, chip, chipType = 'green', icon, yellow }) {
  return (
    <div className={`card ${yellow ? 'card-yellow' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Honeycomb accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        background: yellow ? 'rgba(244,179,21,0.1)' : 'rgba(244,179,21,0.04)',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        transform: 'rotate(-20deg)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        {icon && <span style={{ color: 'var(--yellow)', opacity: 0.7 }}>{icon}</span>}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 700,
        color: yellow ? 'var(--yellow)' : 'var(--text-primary)',
        lineHeight: 1.1,
        marginBottom: 8,
      }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {chip && <span className={`chip chip-${chipType}`}>{chip}</span>}
        {sub && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}
