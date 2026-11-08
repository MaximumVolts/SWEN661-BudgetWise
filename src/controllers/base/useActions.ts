import { useCallback, useRef, useState } from 'react';
import { FieldValidationException, messageFor } from '../../models/appException';
import { useNotice } from '../../state/NoticeContext';

/** Runs user actions (saving, deleting…): failures are shown as a notice. Resolves true on success. */
export function useAction() {
  const notify = useNotice();
  return useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      try {
        await action();
        return true;
      } catch (e) {
        notify(messageFor(e));
        return false;
      }
    },
    [notify],
  );
}

/**
 * A form's submission: one at a time, with [submitting] while it runs. A FieldValidationException
 * becomes per-field [fieldErrors] (shown next to the fields); other failures become a notice.
 */
export function useFormSubmit() {
  const notify = useNotice();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const busy = useRef(false);

  const submit = useCallback(
    async <T>(action: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> => {
      if (busy.current) return { ok: false };
      busy.current = true;
      setSubmitting(true);
      setFieldErrors({});
      try {
        return { ok: true, value: await action() };
      } catch (e) {
        if (e instanceof FieldValidationException) setFieldErrors(e.fieldErrors);
        else notify(messageFor(e));
        return { ok: false };
      } finally {
        busy.current = false;
        setSubmitting(false);
      }
    },
    [notify],
  );

  return { submitting, fieldErrors, setFieldErrors, submit };
}
