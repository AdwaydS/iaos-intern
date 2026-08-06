import { Icon } from "../../../components/Icon";

export default function AuditComment({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="card bgt-audit-comment">
      <div className="bgt-audit-comment-head">
        <Icon name="clipboard" size={16} />
        <strong>Auditor Comment</strong>
      </div>
      <p>{text}</p>
    </div>
  );
}
