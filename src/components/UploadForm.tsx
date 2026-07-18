"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import FileField from "./FileField";
import DropZone from "./DropZone";

// export default function UploadForm() {
//   const [ordersFile, setOrdersFile] = useState<File | null>(null);
//   const [paymentsFile, setPaymentsFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const router = useRouter();

//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     if (!ordersFile || !paymentsFile) {
//       setStatus("error");
//       setErrorMessage("Please select both files.");
//       return;
//     }

//     if (
//       !ordersFile.name.endsWith(".csv") ||
//       !paymentsFile.name.endsWith(".csv")
//     ) {
//       setStatus("error");
//       setErrorMessage("Both files must be .csv files.");
//       return;
//     }

//     setStatus("uploading");
//     setErrorMessage(null);

//     const formData = new FormData();
//     formData.append("orders", ordersFile);
//     formData.append("payments", paymentsFile);

//     try {
//       const res = await fetch("/api/ingest", {
//         method: "POST",
//         body: formData,
//       });
//       // const data = await res.json();

//       if (!res.ok) {
//         setStatus("error");
//         // setErrorMessage(data.error || "Upload failed. Please try again.");
//         setErrorMessage(
//           "Error uploading.... Please upload correct files or try again.",
//         );
//         return;
//       }

//       // Always land on /dashboard after a successful upload — whether this
//       // form was rendered at /dashboard (first upload) or /dashboard/reupload.
//       router.push("/dashboard");
//       router.refresh();
//     } catch {
//       setStatus("error");
//       setErrorMessage("Network error — check your connection and try again.");
//     }
//   }

//   return (
//     <div className="max-w-lg">
//       <h1 className="text-2xl font-bold">Upload data</h1>
//       <p className="mt-1 text-sm text-gray-500">
//         Upload your orders.csv and payments.csv to run reconciliation.
//         Re-uploading replaces your previous data.
//       </p>

//       <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//         <FileField
//           label="orders file"
//           file={ordersFile}
//           onChange={setOrdersFile}
//         />
//         <FileField
//           label="payments file"
//           file={paymentsFile}
//           onChange={setPaymentsFile}
//         />

//         {status === "error" && errorMessage && (
//           <p className="rounded bg-red-50 p-3 text-sm text-red-600">
//             {errorMessage}
//           </p>
//         )}

//         <button
//           type="submit"
//           disabled={status === "uploading"}
//           className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
//         >
//           {status === "uploading"
//             ? "Uploading and reconciling…"
//             : "Upload and reconcile"}
//         </button>
//       </form>
//     </div>
//   );
// }

export default function UploadForm() {
  const [ordersFile, setOrdersFile] = useState<File | null>(null);
  const [paymentsFile, setPaymentsFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!ordersFile || !paymentsFile) {
      setStatus("error");
      setErrorMessage("Please select both files.");
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("orders", ordersFile);
    formData.append("payments", paymentsFile);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      // const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          "Upload failed. Please upload correct files or please try again.",
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Upload data</h1>
      <p className="mt-1 text-sm text-gray-500">
        Upload your orders.csv and payments.csv to run reconciliation.
        Re-uploading replaces your previous data.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <DropZone
            label="Orders file"
            hint="orders.csv"
            file={ordersFile}
            onChange={setOrdersFile}
          />
          <DropZone
            label="Payments file"
            hint="payments.csv"
            file={paymentsFile}
            onChange={setPaymentsFile}
          />
        </div>

        {status === "error" && errorMessage && (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "uploading"}
          className="rounded bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "uploading"
            ? "Uploading and reconciling…"
            : "Upload and reconcile"}
        </button>
      </form>
    </div>
  );
}
