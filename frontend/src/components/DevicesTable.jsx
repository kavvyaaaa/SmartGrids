import { Server, Inbox } from 'lucide-react';

export default function DevicesTable({ devices }) {
  return (
    <div className="panel animate-fade-in">
      <div className="panel__header">
        <Server className="panel__icon" />
        <div>
          <div className="panel__title">Active Smart Meters</div>
          <div className="panel__subtitle">Registered devices in the grid</div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="empty-state">
          <Inbox className="empty-state__icon" />
          <span>No devices registered</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.device_id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {d.device_id}
                  </td>
                  <td>{d.device_name}</td>
                  <td>{d.device_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
