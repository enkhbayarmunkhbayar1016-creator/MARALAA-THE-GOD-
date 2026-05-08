import { useEffect, useState } from "react";
import { useToast } from "../../components/ui/Toast";

export function useStudentData(fetcher, deps = []) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const result = await fetcher();
        if (cancelled) return;
        setData(result);
        setError("");
      } catch (err) {
        if (cancelled) return;
        const msg = err?.message || "Мэдээлэл ачааллахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
