import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const AnimatedBackground = ({ isLightMode }) => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (


    
    <Particles
      id="code-sync-bg"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: { value: isLightMode ? "#fcfaf6" : "#302824" }, // light slate vs dark slate
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            onClick: { enable: true, mode: "connect" },
          },
          modes: {
            grab: {
              distance: 120,
              links: { opacity: 0.8 },
            },
            connect: { distance: 140, radius: 200 },
          },
        },
        particles: {
          number: {
            value: 40, // less = more performance
            density: { enable: true, area: 800 },
          },
          color: {
            value: isLightMode ? ["#806857", "#5a4538", "#806857"] : ["#806857", "#5a4538", "#806857"], // deep violet/pink for light mode
          },
          links: {
            enable: true,
            color: "#ffffff",
            distance: 140,
            opacity: 0.4,
            width: 1.5,
          },
          shape: { type: "circle" },
          size: {
            value: { min: 2, max: 5 },
          },
          opacity: {
            value: 0.8,
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            outModes: { default: "bounce" },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default AnimatedBackground;
