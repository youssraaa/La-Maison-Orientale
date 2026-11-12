import { useRef, useState } from "react";
import staffOpsApi from "../api/staffOpsApi";

function AdminImageUpload({ token, value, onChange, label = "Image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFileSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const result = await staffOpsApi.uploadImage(token, file);
      onChange(result.url);
    } catch (err) {
      setError(err.message || "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-upload">
      <label className="admin-form__field admin-form__field--full">
        <span>{label}</span>
        <input value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="/uploads/… ou /images/…" />
      </label>
      <div className="admin-upload__preview-row">
        <div className="admin-upload__preview-box">
          {value ? (
            <img src={value} alt="Aperçu" className="admin-upload__preview" />
          ) : (
            <div className="admin-upload__placeholder">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
              <span>Aucune image</span>
            </div>
          )}
        </div>
        <div className="admin-upload__actions-col">
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFileSelected} />
          <button type="button" className="admin-agents__ghost" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Envoi…" : "Téléverser une image"}
          </button>
          {value ? (
            <button type="button" className="admin-agents__ghost" style={{ color: "#b91c1c" }} onClick={() => onChange("")}>
              Supprimer
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="admin-dash__status admin-dash__status--error">{error}</p> : null}
    </div>
  );
}

export default AdminImageUpload;
