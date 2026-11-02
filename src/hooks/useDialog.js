import { useEffect, useRef } from "react";

// Keep keyboard navigation inside an open dialog and restore the opener on close.
export default function useDialog(open, onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      [
        ...(ref.current?.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) || []),
      ].filter((el) => el.getClientRects().length && el.tabIndex >= 0);
    const frame = requestAnimationFrame(() => {
      (focusable()[0] || ref.current)?.focus();
    });
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current?.();
      }
      if (e.key !== "Tab") return;
      const controls = focusable();
      if (!controls.length) {
        e.preventDefault();
        ref.current?.focus();
        return;
      }
      const first = controls[0],
        last = controls[controls.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !ref.current?.contains(document.activeElement))
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !ref.current?.contains(document.activeElement))
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return ref;
}
