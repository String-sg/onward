export interface LearningJourney {
  id: number;
  tag: string;
  title: string;
  numberofpodcasts: number;
  numberofnotes: number;
  variant: 'purple' | 'amber' | 'teal';
  to: string;
}
