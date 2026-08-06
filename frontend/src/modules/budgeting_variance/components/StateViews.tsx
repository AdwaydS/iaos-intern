import { Icon } from "../../../components/Icon";

export function LoadingState({ message = "Loading audit workspace…" }: { message?: string }) {
  return (
    <div className="card bgt-state-card">
      <div className="bgt-state-spinner" />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ message = "No data available for the selected filters." }: { message?: string }) {
  return (
    <div className="card bgt-state-card">
      <Icon name="layers" size={32} />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Unable to load data. Please retry.", onRetry }: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card bgt-state-card bgt-state-error">
      <Icon name="alert-triangle" size={32} />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
