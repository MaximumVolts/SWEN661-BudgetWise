import DateTimePicker from '@react-native-community/datetimepicker';

export interface DatePickerProps {
  value: Date;
  minimumDate?: Date;
  /** The chosen date, or undefined if the user dismissed the picker. Closes the picker. */
  onDone: (date: Date | undefined) => void;
}

/** The system date picker (Android dialog / iOS picker). The desktop app uses DatePicker.web.tsx. */
export function DatePicker({ value, minimumDate, onDone }: DatePickerProps) {
  return <DateTimePicker value={value} mode="date" minimumDate={minimumDate} onValueChange={(_event, date) => onDone(date)} />;
}
