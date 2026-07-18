type AIButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export default function AIButton({
  onClick,
  disabled,
  children,
}: Readonly<AIButtonProps>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group rounded-lg bg-linear-to-r from-violet-500 via-fuchsia-500 to-amber-400 p-[1.5px] transition-opacity disabled:opacity-50"
    >
      <span className="flex items-center gap-2 rounded-[7px] bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors group-hover:bg-gray-50">
        <span className="bg-linear-to-r from-violet-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">
          ✦
        </span>
        {children}
      </span>
    </button>
  );
}
