import { useEffect, useState } from "react";

export default function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.maxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
}
