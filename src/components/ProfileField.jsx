export default function ProfileField({
  label,
  name,
  type = "text",
  disabled = false,
  icon,
  record,
  editing,
  onChange,
}) {
  return (
    <div className="cn-profile-field">
      <label htmlFor={`profile-${name}`}>{label}</label>
      {editing ? (
        <div
          className={icon ? "cn-profile-input with-icon" : "cn-profile-input"}
        >
          {icon && <span>{icon}</span>}
          <input
            id={`profile-${name}`}
            type={type}
            name={name}
            value={record[name] ?? ""}
            onChange={onChange}
            disabled={disabled}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        </div>
      ) : (
        <div className="cn-profile-value">
          {icon && <span>{icon}</span>}
          {record[name] || (
            <span className="cn-profile-unspecified">Not specified</span>
          )}
        </div>
      )}
    </div>
  );
}
