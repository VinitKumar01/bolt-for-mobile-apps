import { WORKER_URL } from "@/config";

export default function CodeEditor() {
  return (
    <div className="w-3/4">
      <iframe
        src={`${WORKER_URL}`}
        width={"100%"}
        height={"100%"}
        className="rounded-2xl"
      />
    </div>
  );
}
