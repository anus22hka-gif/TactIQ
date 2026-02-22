import { createContext, useContext, useState, ReactNode } from "react";

type DemoRole = "coach" | "player" | null;

type DemoUser = {
  role: DemoRole;
  id: string | null;
  name: string | null;
};

type DemoUserContextValue = {
  user: DemoUser;
  setCoachDemo: () => void;
  setPlayerDemo: () => void;
};

const DemoUserContext = createContext<DemoUserContextValue | undefined>(undefined);

export const DemoUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DemoUser>({
    role: null,
    id: null,
    name: null,
  });

  const setCoachDemo = () => {
    setUser({
      role: "coach",
      id: "coach_demo",
      name: "Coach Demo",
    });
  };

  const setPlayerDemo = () => {
    setUser({
      role: "player",
      id: "martinez",
      name: "J. Martinez",
    });
  };

  return (
    <DemoUserContext.Provider value={{ user, setCoachDemo, setPlayerDemo }}>
      {children}
    </DemoUserContext.Provider>
  );
};

export const useDemoUser = () => {
  const ctx = useContext(DemoUserContext);
  if (!ctx) {
    throw new Error("useDemoUser must be used within DemoUserProvider");
  }
  return ctx;
};

