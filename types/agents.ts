import { listEnabledAgents } from '../config/agents';

export interface Agent {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: 'orange' | 'blue' | 'purple' | 'green';
  enabled: boolean;
}

export const AGENTS: Agent[] = listEnabledAgents().map((a) => ({
  id: a.id,
  name: a.name,
  title: a.title,
  description: a.description,
  icon: a.ui.icon,
  color: a.ui.color,
  enabled: a.enabled,
}));
