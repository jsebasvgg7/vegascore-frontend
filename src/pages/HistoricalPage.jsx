import "../styles/HistoricalPage.css";
import useHistory from "../hooks/useHistory";

export default function HistorialPage() {
  const { history, loading } = useHistory();

  if (loading) {
    return <p className="history-loading">Cargando historial...</p>;
  }

  return (
    <div className="history-wrapper">

      <h2 className="history-title">Historial</h2>

      {history.length === 0 ? (
        <p className="history-empty">Aún no tienes historial.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-info">
                <h4>{item.match_name}</h4>
                <p className="history-date">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className={`history-result ${item.correct ? "correct" : "wrong"}`}>
                {item.correct ? "✔ Acertado" : "✘ Fallado"}
              </div>

              <div className="history-points">
                {item.points} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
