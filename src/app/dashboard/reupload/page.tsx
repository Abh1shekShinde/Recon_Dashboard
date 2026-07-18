import UploadForm from "@/components/UploadForm";
import Link from "next/link";

export default function ReuploadPage() {
  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-block text-sm text-gray-500 underline"
      >
        ← Back to dashboard
      </Link>
      <UploadForm />
    </div>
  );
}
