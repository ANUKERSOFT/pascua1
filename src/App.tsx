import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./styles.css";

const App: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPressing && progress < 100 && !isRevealed) {
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate(10);
      pressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 5;
          if (next >= 100) {
            clearInterval(pressTimerRef.current!);
            setIsPressing(false);
            setIsDisintegrating(true);
            return 100;
          }
          return next;
        });
      }, 30);
    } else {
      clearInterval(pressTimerRef.current!);
      if (!isDisintegrating && !isRevealed) setProgress(0);
    }
    return () => clearInterval(pressTimerRef.current!);
  }, [isPressing, progress, isDisintegrating, isRevealed]);

  useEffect(() => {
    if (isDisintegrating && particlesContainerRef.current) {
      const container = particlesContainerRef.current;
      for (let i = 0; i < 60; i++) {
        const p = document.createElement("div");
        p.className = "mistic-particle";
        container.appendChild(p);
        gsap.to(p, {
          duration: 0.8,
          x: gsap.utils.random(-150, 150),
          y: gsap.utils.random(-150, 150),
          opacity: 0,
          scale: 0,
          onComplete: () => p.remove(),
        });
      }
      setTimeout(() => {
        setIsDisintegrating(false);
        setIsRevealed(true);
      }, 800);
    }
  }, [isDisintegrating]);

  useEffect(() => {
    if (isRevealed && messageRef.current) {
      const tl = gsap.timeline();

      // 1. Entrada de Elementos fijos
      tl.fromTo(
        ".angelical-title, .ornament-top, .ornament-bottom",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 1 }
      );

      // 2. Secuencia de Lectura con Animación de Texto Elevado
      const paragraphs = document.querySelectorAll(".paragraph-reveal");
      paragraphs.forEach((p, index) => {
        const isLast = index === paragraphs.length - 1;

        tl.to(
          p,
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            color: "#ffffff",
            borderLeft: "2px solid #00e5ff",
            paddingLeft: "15px",
            boxShadow: "-10px 0px 15px -10px rgba(0, 229, 255, 0.6)",
            duration: 1.2,
            ease: "power2.out",
          },
          index === 0 ? "+=0.5" : "+=0.2"
        );

        // Tiempo de lectura
        tl.to({}, { duration: isLast ? 3 : 6 });

        // Si no es el último, lo atenuamos para pasar al siguiente
        if (!isLast) {
          tl.to(p, {
            opacity: 0.3,
            borderLeft: "0px solid transparent",
            paddingLeft: "0px",
            boxShadow: "none",
            duration: 1,
          });
        }
      });

      // 3. APARICIÓN DE LA B (DISPARADOR)
      tl.fromTo(
        ".final-sigil-container",
        { opacity: 0, scale: 0.5, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
      );

      // 4. INICIO AUTOMÁTICO DE LA ANIMACIÓN GRANDE (Tras ver la B pequeña)
      tl.to(
        ".text-fade-out",
        {
          opacity: 0,
          filter: "blur(10px)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        "+=1.5"
      ); // Breve pausa para notar la B antes de que todo se limpie

      tl.to(
        ".final-sigil-container",
        {
          scale: 2.2,
          y: () => {
            const el = document.querySelector(".final-sigil-container");
            if (!el) return "-35vh";
            const rect = el.getBoundingClientRect();
            const viewportHeight = window.visualViewport
              ? window.visualViewport.height
              : window.innerHeight;
            return viewportHeight / 2 - (rect.top + rect.height / 2);
          },
          duration: 2.5,
          ease: "power4.inOut",
          onStart: () => {
            // Empezar el dibujo del corazón justo cuando empieza a moverse al centro
            gsap.fromTo(
              ".subtle-heart",
              { scale: 0.8, opacity: 0 },
              { scale: 1.4, opacity: 0.6, duration: 2, ease: "power1.out" }
            );
            gsap.fromTo(
              ".heart-path",
              { strokeDasharray: 300, strokeDashoffset: 300 },
              { strokeDashoffset: 0, duration: 3, ease: "power1.inOut" }
            );
          },
          onComplete: () => {
            // Latido infinito una vez centrado
            gsap.to(".subtle-heart", {
              scale: 1.6,
              opacity: 0,
              duration: 3.5,
              repeat: -1,
              ease: "sine.out",
            });
          },
        },
        "<"
      );

      // 5. Cierre TV
      tl.to(".tv-screen", {
        scaleY: 0.005,
        backgroundColor: "#fff",
        duration: 0.2,
        ease: "power4.in",
        delay: 5,
      }).to(".tv-screen", { scaleX: 0, opacity: 0, duration: 0.15 });
    }
  }, [isRevealed]);

  return (
    <div className="app-container mistic-bg noselect">
      <div className="tv-screen">
        {!isRevealed && !isDisintegrating && (
          <div className="lock-screen">
            <div className="loader-label">
              Coloca tu dedo para desbloquear el mensaje
            </div>
            <div
              className={`celestial-scanner ${isPressing ? "pressing" : ""}`}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsPressing(true);
              }}
              onTouchEnd={() => setIsPressing(false)}
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
            >
              <svg className="scanner-rings" viewBox="0 0 200 200">
                <circle className="ring outer" cx="100" cy="100" r="90" />
                <circle className="ring inner" cx="100" cy="100" r="50" />
                <circle
                  className="progress-fill"
                  cx="100"
                  cy="100"
                  r="70"
                  style={{
                    strokeDasharray: 440,
                    strokeDashoffset: 440 - (440 * progress) / 100,
                  }}
                />
              </svg>
              <div
                className={`scanner-core ${isPressing ? "core-active" : ""}`}
              ></div>
              <svg
                className="icon-finger"
                viewBox="0 0 100 100"
                width="50"
                height="50"
              >
                <path
                  d="M45.5,13.5 C43,13.5 41,15.5 41,18 L41,45 C41,45 36,41 33,41 C29,41 27,45 29,49 L42,68 C45,73 49,85 55,85 C61,85 68,76 68,66 L68,34 C68,31.5 66,29.5 63.5,29.5 C61,29.5 59,31.5 59,34 L59,45 L59,26 C59,23.5 57,21.5 54.5,21.5 C52,21.5 50,23.5 50,26 L50,45 L50,18 C50,15.5 48,13.5 45.5,13.5 Z"
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="instruction celestial-text">
              {isPressing ? "Conectando..." : "Espera..."}
            </p>
          </div>
        )}

        {isDisintegrating && (
          <div
            ref={particlesContainerRef}
            className="particles-container"
          ></div>
        )}

        {isRevealed && (
          <div className="message-screen" ref={messageRef}>
            <div className="ornament-top text-fade-out">✧</div>
            <h1 className="angelical-title text-fade-out">MENSAJE DEL ALMA</h1>
            <div className="message-body-container text-fade-out">
              <p className="paragraph-reveal">
                Hay almas que, sin saberlo, iluminan el camino de otros.
                Observar tu fuerza, la belleza de tu esencia y el amor infinito
                que entregas a los tuyos ha sido mi mayor inspiración. Gracias
                por despertar en mí siempre una luz enorme. Eres una mujer
                excepcional.
              </p>
              <p className="paragraph-reveal">
                Admirarte es un privilegio. Tienes una integridad que inspira y
                una belleza que va mucho más allá de lo visible. La forma en que
                abrazas la vida y cuidas de quienes amas me ha enseñado mucho.
                Gracias por existir y ser a la distancia un faro a seguir en el
                día a día.
              </p>
              <p className="paragraph-reveal">
                Pocas veces en la vida te cruzas con una mujer tan completa. Tu
                entereza, tu luz como madre y lo bonito de tu corazón han sido
                un despertar para mí día a día siempre. Guardo una admiración
                profunda por la mujer que eres. Nunca dejes de brillar así.
                Nunca dejes de sonreír.
              </p>
              <p className="paragraph-reveal signature">
                Un abrazo enorme a la distancia y un haz de luz infinito para ti
                y los tuyos. Siempre en el corazón.
              </p>
            </div>
            <div className="ornament-bottom text-fade-out">✧</div>
            <div className="final-sigil-container">
              <div className="b-wings-symbol">
                <svg className="subtle-heart" viewBox="0 0 100 100">
                  <path
                    className="heart-path"
                    d="M50,80 C50,80 20,50 20,30 C20,15 35,10 45,20 C50,25 50,25 50,25 C50,25 50,25 55,20 C65,10 80,15 80,30 C80,50 50,80 50,80 Z"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="0.2"
                  />
                </svg>
                <span className="celestial-wing">𓆩</span>
                <span className="b-letter">B</span>
                <span className="celestial-wing">𓆪</span>
              </div>
              <p className="pascua-text">FELICES PASCUAS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
