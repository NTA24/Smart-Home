import { useLocation } from "react-router";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const location = useLocation();
  return (
    <section style={{ padding: 16 }}>
      <h2>{title}</h2>
      <p style={{ opacity: 0.85 }}>
        Trang React placeholder — map từ ThingsBoard Angular. Triển khai đầy đủ UI/API sẽ thay thế dần component này.
      </p>
      <p>
        <strong>Path:</strong> <code>{location.pathname}</code>
      </p>
    </section>
  );
}
