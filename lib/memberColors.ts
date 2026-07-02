const memberColorClasses: Record<string, string> = {
  '#007c89': 'member-color-teal',
  '#7c3aed': 'member-color-purple',
  '#f59e0b': 'member-color-amber',
  '#16a34a': 'member-color-green',
};

export const memberColorClassName = (color?: string) =>
  memberColorClasses[color?.toLowerCase() || ''] || 'member-color-teal';
