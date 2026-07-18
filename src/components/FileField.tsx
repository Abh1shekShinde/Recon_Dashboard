type FileFieldProps = {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
};

export default function FileField(props: Readonly<FileFieldProps>) {
  const { label, file, onChange } = props;
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
        {file && (
          <span className="text-xs text-green-600 whitespace-nowrap">
            ✓ selected
          </span>
        )}
      </div>
    </div>
  );
}
