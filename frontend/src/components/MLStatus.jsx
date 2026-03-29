import { BrainCircuit } from 'lucide-react';

export default function MLStatus({ mlStatus }) {
  const entries = Object.entries(mlStatus || {});

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="panel animate-fade-in">
      <div className="panel__header">
        <BrainCircuit className="panel__icon" />
        <div>
          <div className="panel__title">ML Anomaly Detection Models</div>
          <div className="panel__subtitle">
            Isolation Forest training status per device
          </div>
        </div>
      </div>

      <div className="ml-grid">
        {entries.map(([deviceId, info]) => {
          const samples = info.training_samples || 0;
          const trained = info.model_trained;
          const progress = Math.min((samples / 30) * 100, 100);
          const lastPred = info.last_prediction;

          return (
            <div key={deviceId} className="ml-card">
              <div className="ml-card__device">{deviceId}</div>

              <div className="ml-card__row">
                <span className="ml-card__label">Samples</span>
                <span className="ml-card__val">{samples}</span>
              </div>

              <div className="ml-card__row">
                <span className="ml-card__label">Model Status</span>
                <span
                  className={`ml-card__val ${
                    trained ? 'ml-card__val--trained' : 'ml-card__val--pending'
                  }`}
                >
                  {trained ? 'Trained' : 'Collecting...'}
                </span>
              </div>

              {lastPred && (
                <div className="ml-card__row">
                  <span className="ml-card__label">Last Score</span>
                  <span className="ml-card__val">{lastPred.score}</span>
                </div>
              )}

              <div className="ml-progress">
                <div
                  className="ml-progress__bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
