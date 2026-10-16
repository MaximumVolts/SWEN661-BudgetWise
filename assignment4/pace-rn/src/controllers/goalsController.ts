import type { SavingsGoal } from '../models/goal';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 13 - Savings goals: kept separate from spending budgets. */
export function useGoalsController() {
  const { goals } = useServices();
  const nav = useAppNavigator();
  const { promptText } = useDialogs();
  const notify = useNotice();
  const perform = useAction();
  const { state, reload } = useAsyncData(() => goals.getGoals(), [goals], [goals.changes]);

  /** Asks how much to add to [goal], then adds it (GoalService checks the amount). */
  const contribute = async (goal: SavingsGoal) => {
    const text = await promptText({ title: `Add to ${goal.name ?? 'Unnamed goal'}`, label: 'Amount', action: 'Add' });
    if (text === undefined) return;
    await perform(() => goals.addContribution(goal.id, text));
  };

  return {
    state,
    reload,
    back: nav.back,
    addGoal: nav.openGoalForm,
    editGoal: () => notify('Editing goals is not implemented yet.'),
    contribute,
  };
}

export type GoalsController = ReturnType<typeof useGoalsController>;
