export default function ProfileNotice({
  setup,
  error,
  setupDescription = "Add your details below. A photo and profile links are optional; you can update them later.",
}) {
  if (!setup && !error) return null;
  return (
    <div
      className={
        setup
          ? "cn-profile-setup cn-profile-page-notice"
          : "cn-inline-notice cn-profile-page-notice"
      }
      role="status"
    >
      <div>
        <strong>
          {setup
            ? "One quick setup. More opportunities ahead."
            : "Your profile couldn’t be loaded."}
        </strong>
        <p>{setup ? setupDescription : error}</p>
      </div>
    </div>
  );
}
