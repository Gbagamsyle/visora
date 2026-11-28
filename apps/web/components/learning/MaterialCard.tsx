import Link from "next/link";
import { ArrowUpRight, Bookmark, BookmarkCheck, Clock3, FileText } from "lucide-react";
import type { LearningMaterialSummary } from "@visora/shared";
import "./MaterialCard.css";

interface MaterialCardProps {
  material: LearningMaterialSummary;
  onToggleSave: (materialId: string, isSaved: boolean) => void;
  saving?: boolean;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export default function MaterialCard({ material, onToggleSave, saving = false }: MaterialCardProps) {
  const context = [material.courseCode, material.topicTitle ?? material.courseTitle].filter(Boolean).join(" · ");
  const SaveIcon = material.isSaved ? BookmarkCheck : Bookmark;

  return (
    <article className="learn-resource learning-material-row">
      <Link className="resource-icon" href={`/learn/materials/${material.id}`} aria-label={`Open ${material.title}`}>
        <FileText size={18} aria-hidden="true" />
      </Link>
      <div className="resource-copy">
        <Link className="learning-material-title" href={`/learn/materials/${material.id}`}>{material.title}</Link>
        <span>{context || material.description || "Course material"}</span>
      </div>
      <span className="resource-type">{material.type}</span>
      <time dateTime={material.createdAt}><Clock3 size={13} aria-hidden="true" /> {formatDate(material.createdAt)}</time>
      <button
        className="learning-row-action"
        type="button"
        aria-label={`${material.isSaved ? "Remove" : "Save"} ${material.title} ${material.isSaved ? "from" : "to"} saved materials`}
        aria-pressed={material.isSaved}
        disabled={saving}
        onClick={() => onToggleSave(material.id, material.isSaved)}
      >
        <SaveIcon size={16} aria-hidden="true" />
      </button>
      <Link className="learning-row-action" href={`/learn/materials/${material.id}`} aria-label={`Open ${material.title}`}>
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
