export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
};

export const getPriorityBadgeClass = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'badge-danger';
    case 'medium':
      return 'badge-warning';
    case 'low':
      return 'badge-primary';
    default:
      return 'badge-secondary';
  }
};

export const getSentimentColor = (sentiment?: string): string => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return '#10B981'; // Success Green
    case 'negative':
      return '#EF4444'; // Danger Red
    case 'neutral':
    default:
      return '#2563EB'; // Primary Blue
  }
};

export const getRiskColorClass = (risk?: string): string => {
  switch (risk?.toLowerCase()) {
    case 'at churn risk':
    case 'high risk':
      return 'text-danger bg-danger-light';
    case 'medium risk':
      return 'text-warning bg-warning-light';
    case 'low risk':
    default:
      return 'text-success bg-success-light';
  }
};
