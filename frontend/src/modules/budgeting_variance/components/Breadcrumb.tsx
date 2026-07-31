import { Icon } from "../../../components/Icon";

interface BreadcrumbProps {
  moduleTitle: string;
  pageName: string;
  category: string;
  pageId: number;
}

export default function Breadcrumb({ moduleTitle, pageName, category, pageId }: BreadcrumbProps) {
  return (
    <nav className="bgt-breadcrumb" aria-label="Breadcrumb">
      <span className="bgt-crumb">{moduleTitle}</span>
      <Icon name="chevron-right" size={14} />
      <span className="bgt-crumb muted">{category}</span>
      <Icon name="chevron-right" size={14} />
      <span className="bgt-crumb active">{pageId}. {pageName}</span>
    </nav>
  );
}
