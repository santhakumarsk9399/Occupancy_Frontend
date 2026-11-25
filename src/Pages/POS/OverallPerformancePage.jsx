import React, { useState } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import './OverallPerformancePage.css'

const TIME_FILTERS = ['Yesterday', 'This week', 'Last week', 'This month', 'Last month']

const SERIES = [
  { key: 'b101', name: 'SONA CLOTH B.NO.101', color: '#60a5fa' },
  { key: 'b102', name: 'SONA CLOTH B.NO.102', color: '#f97316' },
  { key: 'b103', name: 'SONA CLOTH B.NO.103', color: '#7c3aed' },
  { key: 'b104', name: 'SONA CLOTH B.NO.104', color: '#22d3ee' },
]

const DATASETS = {
  'Last week': {
    b101: [{ x: 1150, y: 25 }],
    b102: [{ x: 4450, y: 10 }],
    b103: [{ x: 2250, y: 8  }],
    b104: [{ x: 3600, y: 25 }],
  },
  Yesterday: {
    b101: [{ x: 1200, y: 20 }],
    b102: [{ x: 4200, y: 8  }],
    b103: [{ x: 2100, y: 7  }],
    b104: [{ x: 3100, y: 18 }],
  },
  'This week': {
    b101: [{ x: 1350, y: 22 }],
    b102: [{ x: 4450, y: 11 }],
    b103: [{ x: 2300, y: 9  }],
    b104: [{ x: 3300, y: 21 }],
  },
  'This month': {
    b101: [{ x: 1500, y: 19 }],
    b102: [{ x: 4800, y: 9  }],
    b103: [{ x: 2600, y: 6  }],
    b104: [{ x: 3900, y: 22 }],
  },
  'Last month': {
    b101: [{ x: 1050, y: 23 }],
    b102: [{ x: 4100, y: 7  }],
    b103: [{ x: 1950, y: 8  }],
    b104: [{ x: 3400, y: 20 }],
  },
}

// Mid lines matching the image exactly: x=2500, y=10
const X_MID = 2500
const Y_MID = 10

const CustomDot = ({ cx, cy, fill }) => (
  <circle cx={cx} cy={cy} r={10} fill={fill} stroke="#fff" strokeWidth={2.5} />
)

const CustomTooltip = ({ active, payload, seriesName, seriesColor }) => {
  if (!active || !payload?.length) return null
  const { x, y } = payload[0]?.payload || {}
  return (
    <div className="op-tooltip">
      <div className="op-tooltip__header">
        <span className="op-tooltip__dot" style={{ background: seriesColor }} />
        <span className="op-tooltip__name">{seriesName}</span>
      </div>
      <div className="op-tooltip__row">Counts: <b>{x?.toLocaleString()}</b></div>
      <div className="op-tooltip__row">Conversion: <b>{y}%</b></div>
    </div>
  )
}

function Chart({ dataset, hidden, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 36, left: 55 }}>

        {/* Zone fills — no grid lines, pure colored zones */}
        <ReferenceArea x1={1000} x2={X_MID} y1={Y_MID} y2={30} fill="rgba(252,165,165,0.38)" stroke="none" />
        <ReferenceArea x1={X_MID} x2={5000} y1={Y_MID} y2={30} fill="rgba(196,181,253,0.38)" stroke="none" />
        <ReferenceArea x1={1000} x2={X_MID} y1={0}     y2={Y_MID} fill="rgba(253,230,138,0.52)" stroke="none" />
        <ReferenceArea x1={X_MID} x2={5000} y1={0}     y2={Y_MID} fill="rgba(167,243,208,0.52)" stroke="none" />

        {/* Mid dividers */}
        <ReferenceArea x1={X_MID} x2={X_MID + 1} y1={0} y2={30} fill="rgba(255,255,255,0.9)" stroke="none" />
        <ReferenceArea x1={1000} x2={5000} y1={Y_MID - 0.15} y2={Y_MID + 0.15} fill="rgba(255,255,255,0.9)" stroke="none" />

        {/* Zone labels */}
        <ReferenceArea x1={1000} x2={X_MID} y1={Y_MID} y2={30} fill="transparent" stroke="none"
          label={{ value: 'Highest Opportunity', position: 'center', fontSize: 15, fontWeight: 700, fill: 'rgba(20,20,50,0.4)', fontFamily: 'inherit' }} />
        <ReferenceArea x1={X_MID} x2={5000} y1={Y_MID} y2={30} fill="transparent" stroke="none"
          label={{ value: 'High Performance', position: 'center', fontSize: 15, fontWeight: 700, fill: 'rgba(20,20,50,0.4)', fontFamily: 'inherit' }} />
        <ReferenceArea x1={1000} x2={X_MID} y1={0} y2={Y_MID} fill="transparent" stroke="none"
          label={{ value: 'Low Performance', position: 'center', fontSize: 15, fontWeight: 700, fill: 'rgba(20,20,50,0.4)', fontFamily: 'inherit' }} />
        <ReferenceArea x1={X_MID} x2={5000} y1={0} y2={Y_MID} fill="transparent" stroke="none"
          label={{ value: 'Needs Promotions', position: 'center', fontSize: 15, fontWeight: 700, fill: 'rgba(20,20,50,0.4)', fontFamily: 'inherit' }} />

        <XAxis
          type="number"
          dataKey="x"
          domain={[1000, 5000]}
          ticks={[1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]}
          tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'inherit' }}
          tickLine={false}
          axisLine={false}
          label={{
            value: 'COUNTS',
            position: 'insideBottom',
            offset: -20,
            fontSize: 11,
            fill: '#9ca3af',
            letterSpacing: 1.5,
            fontFamily: 'inherit',
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={[0, 30]}
          ticks={[0, 10, 20, 30]}
          tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'inherit' }}
          tickLine={false}
          axisLine={false}
          width={20}
          label={{
            value: 'SALES CONVERSION(%)',
            angle: -90,
            position: 'insideLeft',
            dx: -45,
            dy: 80,
            fontSize: 11,
            fill: '#9ca3af',
            letterSpacing: 1,
            fontFamily: 'inherit',
          }}
        />

        {SERIES.map(s =>
          !hidden.has(s.key) ? (
            <Scatter
              key={s.key}
              name={s.name}
              data={dataset[s.key]}
              fill={s.color}
              shape={<CustomDot fill={s.color} />}
            >
              <Tooltip content={<CustomTooltip seriesName={s.name} seriesColor={s.color} />} />
            </Scatter>
          ) : null
        )}
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default function OverallPerformancePage() {
  const [activeFilter, setActiveFilter] = useState('Last week')
  const [hidden, setHidden] = useState(new Set())
  const [expanded, setExpanded] = useState(false)

  const toggle = (key) => setHidden(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const dataset = DATASETS[activeFilter]

  return (
    <>
      {/* ── Normal card ── */}
      <div className="op-page">
        <div className="op-card">

          {/* Top Bar */}
          <div className="op-topbar">
            <h2 className="op-title">Overall Performance</h2>
            <div className="op-topbar-right">
              <div className="op-filters">
                {TIME_FILTERS.map(f => (
                  <button
                    key={f}
                    className={`op-filter-btn${activeFilter === f ? ' active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button className="op-expand-btn" onClick={() => setExpanded(true)} aria-label="Expand">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 6V1h5M1 1l5 5M10 1h5v5M15 1l-5 5M1 10v5h5M1 15l5-5M15 10v5h-5M15 15l-5-5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Chart */}
          <Chart dataset={dataset} hidden={hidden} height={300} />

          {/* Legend */}
          <Legend hidden={hidden} toggle={toggle} />
        </div>
      </div>

      {/* ── Expanded modal ── */}
      {expanded && (
        <div className="op-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="op-modal" onClick={e => e.stopPropagation()}>
            <div className="op-topbar">
              <h2 className="op-title">Overall Performance</h2>
              <div className="op-topbar-right">
                <div className="op-filters">
                  {TIME_FILTERS.map(f => (
                    <button
                      key={f}
                      className={`op-filter-btn${activeFilter === f ? ' active' : ''}`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button className="op-expand-btn" onClick={() => setExpanded(false)} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M14 2L2 14" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <Chart dataset={dataset} hidden={hidden} height={520} />
            <Legend hidden={hidden} toggle={toggle} />
          </div>
        </div>
      )}
    </>
  )
}

function Legend({ hidden, toggle }) {
  return (
    <div className="op-legend">
      {SERIES.map(s => (
        <button
          key={s.key}
          className={`op-legend-item${hidden.has(s.key) ? ' off' : ''}`}
          onClick={() => toggle(s.key)}
        >
          <span
            className="op-legend-check"
            style={{
              background: hidden.has(s.key) ? '#fff' : s.color,
              borderColor: s.color,
            }}
          >
            {!hidden.has(s.key) && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="op-legend-label">{s.name}</span>
        </button>
      ))}
    </div>
  )
}
