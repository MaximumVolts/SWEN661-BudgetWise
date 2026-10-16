import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useFormSubmit } from './base/useActions';

/** Savings goals → +: name, target, what's already saved, an optional target date and an icon. GoalService validates. */
export function useGoalFormController() {
  const { goals } = useServices();
  const nav = useAppNavigator();
  const { submitting, fieldErrors, setFieldErrors, submit } = useFormSubmit();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [iconKey, setIconKey] = useState<string | undefined>(goals.icons[0]?.key);

  const pickTargetDate = (d: Date | undefined) => {
    setTargetDate(d);
    setFieldErrors(({ targetDate: _, ...rest }) => rest);
  };
  const save = async () => {
    const r = await submit(() => goals.addGoal({ name, target, saved, targetDate, iconKey }));
    if (r.ok) nav.back();
  };

  return {
    name,
    setName,
    target,
    setTarget,
    saved,
    setSaved,
    targetDate,
    pickTargetDate,
    /** A target date can't be in the past. */
    earliestTargetDate: goals.earliestTargetDate(),
    icons: goals.icons,
    iconKey,
    setIconKey,
    submitting,
    fieldErrors,
    save,
    back: nav.back,
  };
}

export type GoalFormController = ReturnType<typeof useGoalFormController>;
