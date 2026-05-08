import { useState, useEffect } from "react";

const slides = [
  "/team4/auth_images/school2.jpg",
  "/team4/auth_images/school3.jpg",
  "/team4/auth_images/school4.jpg",
  "/team4/auth_images/school1.jpg",
];

function RightPanel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden min-h-0 min-w-0 overflow-hidden lg:block lg:min-h-screen lg:w-1/2">
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover select-none transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          draggable="false"
        />
      ))}
    </div>
  );
}

export function AuthLayout({ children }) {
  return (
    <div
      className="flex min-h-screen -mx-4 -my-6 sm:-m-6 md:-my-10 md:-mx-8"
      style={{ background: "#f0fdfa" }}
    >
      <div className="flex w-full min-w-0 flex-col lg:w-1/2 lg:min-h-screen">
        <div className="flex flex-1 items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      <RightPanel />
    </div>
  );
}