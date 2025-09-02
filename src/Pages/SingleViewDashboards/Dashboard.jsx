import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchZones, fetchDashboard } from './api';
import { useInactivityAutoAdvance } from './hooks';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import './Dashboard.css';

// Icons
import OccupancyIcon from '../../components/Assets/dashboard/sv_occupancy.svg';
import CapacityIcon from '../../components/Assets/dashboard/sv_capcity.svg';
import PercentageIcon from '../../components/Assets/dashboard/sv_percentage.svg';
import SafeIcon from '../../components/Assets/dashboard/sv_safetoenter.svg';
import AlmostFullIcon from '../../components/Assets/dashboard/sv_allmostfull.svg';
import FullIcon from '../../components/Assets/dashboard/sv_full.svg';
import EmptyIcon from '../../components/Assets/dashboard/sv_empty.svg';
import RemainingCapacityIcon from '../../components/Assets/dashboard/sv_remainingcapacity.svg';
import PeakOccIcon from '../../components/Assets/dashboard/sv_peakoccupancy.svg';
import PeakHourIcon from '../../components/Assets/dashboard/sv_peakhour.svg';
import Footer from '../CommonComponents/Footer';

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [zones, setZones] = useState([]);
  const [zoneIndex, setZoneIndex] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeZone = zones[zoneIndex];

  useInactivityAutoAdvance({
    items: zones,
    activeIndex: zoneIndex,
    onAdvance: setZoneIndex,
    inactivityMs: 10000
  });

  // 🔑 Load token + zones from sessionStorage (set during login)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        if (!userData?.token) {
          throw new Error('Missing session token, please log in again');
        }

        if (!mounted) return;
        setToken(userData.token);

        const z = await fetchZones(userData.token, userData.user.vid, userData.user.username);
        if (!mounted) return;
        setZones(z);
      } catch (e) {
        if (mounted) setError(e.message);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadData = useCallback(
    async (zone) => {
      if (!token || !zone) return;
      setLoading(true);
      setError(null);
      try {
        const d = await fetchDashboard(token, zone);
        setData(d);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Load dashboard when zone changes
  useEffect(() => {
    loadData(activeZone);
  }, [activeZone, loadData]);

  // Auto-refresh every 10s
  useEffect(() => {
    if (!token || !activeZone) return;
    const id = setInterval(() => loadData(activeZone), 10000);
    return () => clearInterval(id);
  }, [token, activeZone, loadData]);

  const hourly = useMemo(() => data?.hourlyData || [], [data]);
  const status = data?.peakStats?.Status || '';
  const statusLower = status.toLowerCase();
  let badgeCls = 'badge-safe';
  if (statusLower.includes('full')) badgeCls = 'badge-full';
  else if (statusLower.includes('almost') || statusLower.includes('high')) badgeCls = 'badge-almost';
  else if (statusLower.includes('empty')) badgeCls = 'badge-empty';

  return (
    <div className="dashboard-wrapper">
      <div className="single_dashboard-header">
        <div className='dashboard-projectTitle'>
          <h3>Occupancy 2.0</h3>
        </div>
        <div className="dashboard-title">
          SEZ Zone1 Occupancy
        </div>
        <div className="zone-selector">
          <label>Zone</label>
          <select
            className="zone-select"
            value={zoneIndex}
            onChange={(e) => setZoneIndex(Number(e.target.value))}
            disabled={!zones.length}
          >
            {zones.map((z, i) => (
              <option key={z} value={i}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats Grid */}
      <div className="dash3-stat-grid">
        <StatCard icon={OccupancyIcon} label="Live Occupancy">
          <AnimatedNumber value={data?.liveStats?.LiveOccupancy} />
        </StatCard>
        <StatCard icon={CapacityIcon} label="Max Capacity">
          <AnimatedNumber value={data?.capacityStats?.Maxcapacity} />
        </StatCard>
        <StatCard icon={PercentageIcon} label="Percentage ">
          <AnimatedNumber value={data?.liveStats?.Percentage} suffix="%" />
        </StatCard>
        <div className={`dash3-status-badge ${badgeCls}`}>
          <img
            src={
              statusLower.includes('safe') ? SafeIcon :
              statusLower.includes('almost') || statusLower.includes('high') ? AlmostFullIcon :
              statusLower.includes('full') ? FullIcon :
              statusLower.includes('empty') ? EmptyIcon :
              SafeIcon
            }
            alt={status || 'status'}
            className="dash3-icon badge-icon"
          />
          <div className="dash3-status-text">
            {status ? (statusLower.includes('safe') ? 'Safe to Enter' : status) : '...'}
          </div>
        </div>
      </div>

      {/* Chart + Side Stats */}
      <div className="dash3-bottom-row">
        <div className="dash3-chart-section">
          <h3>Hourly Trends</h3>
          {loading && <div className="spinner" />}
          {!loading && (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="Hours" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} width={60} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                         labelFormatter={(l) => `Hour: ${l}`}
                         formatter={(v) => [v, 'Live Occupancy']}
                />
                <ReferenceLine
                  x={hourly[Math.min(hourly.length - 1, 10)]?.Hours}
                  stroke="#111827" strokeDasharray="4 4"
                />
                <Area type="monotone" dataKey="LiveOccupancy"
                      stroke="#1d4ed8" fill="url(#fill2)" strokeWidth={3}
                      dot={{ r: 4 }} activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="dash3-chart-footer">
            <span>Total In: <strong className="dash3-in"><AnimatedNumber value={data?.totals?.Totalin} /></strong></span>
            <span>Total Out: <strong className="dash3-out"><AnimatedNumber value={data?.totals?.Totalout} /></strong></span>
          </div>
        </div>
        <div className="dash3-side-grid">
          <StatSideCard icon={RemainingCapacityIcon} label="Remaining Capacity">
            <AnimatedNumber value={data?.capacityStats?.Remainingcapacity} />
          </StatSideCard>
          <StatSideCard icon={PeakOccIcon} label="Peak Occupancy">
            <AnimatedNumber value={data?.peakStats?.Peakoccupancy} />
          </StatSideCard>
          <StatSideCard icon={PeakHourIcon} label="Peak Hour">
            {data?.peakStats?.Peakhour ?? '--'} <span className="dash3-hr-suffix">Hr</span>
          </StatSideCard>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

/* --- Reusable Components --- */
function StatCard({ icon, label, children }) {
  return (
    <div className="dash3-stat-card">
      <div className="cardsec1">
        <img src={icon} alt={label} className="dash3-icon" />
        <div className="dash3-stat-main">{children}</div>
      </div>
      <div className="dash3-stat-label">{label}</div>
    </div>
  );
}

function StatSideCard({ icon, label, children }) {
  return (
    <div className="dash3-side-card">
      <div className="cardsec1">
        <img src={icon} alt={label} className="dash3-icon" />
        <div className="dash3-side-main">{children}</div>
      </div>
      <div className="dash3-side-label">{label}</div>
    </div>
  );
}

function AnimatedNumber({ value, duration = 600, suffix = '' }) {
  const [display, setDisplay] = useState(value ?? 0);
  const prevRef = React.useRef(value ?? 0);

  useEffect(() => {
    if (value == null || value === prevRef.current) return;
    const start = performance.now();
    const from = prevRef.current || 0;
    const to = value || 0;
    const d = duration;
    function ease(p) {
      return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    }
    function step(ts) {
      const p = Math.min(1, (ts - start) / d);
      const eased = ease(p);
      const current = from + (to - from) * eased;
      setDisplay(Math.round(current));
      if (p < 1) requestAnimationFrame(step);
      else prevRef.current = to;
    }
    requestAnimationFrame(step);
  }, [value, duration]);

  return value == null
    ? <span className="animated-number">--</span>
    : <span className="animated-number">{display}{suffix}</span>;
}
