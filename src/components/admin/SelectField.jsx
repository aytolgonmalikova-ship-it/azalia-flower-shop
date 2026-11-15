// Выпадающий список в стиле полей формы сайта (те же классы, что у FormField).
export default function SelectField({ id, label, options, ...selectProps }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="field__control admin-select" {...selectProps}>
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
