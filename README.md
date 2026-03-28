# 🌻Flores Amarillas

Una página web romántica e interactiva creada con HTML, CSS y JavaScript puro.  
Cuenta una historia visual que va del **día al atardecer y a la noche**, con un jardín de girasoles que crece mientras el usuario hace scroll.

---

## 📁 Estructura del proyecto

```
/
├── index.html      # Estructura y contenido de las 8 escenas
├── styles.css      # Estilos, animaciones y diseño responsive
└── script.js       # Lógica interactiva dividida en módulos
```

> Los tres archivos deben estar en la **misma carpeta**.  
> Abre `index.html` directamente en el navegador — no requiere servidor ni instalación.

---

## 🎬 Las 8 escenas

| # | Nombre | Cielo |
|---|--------|-------|
| 1 | Intro | ☀️ Día claro con sol |
| 2 | Inicio | 🌤 Tarde clara |
| 3 | Primer cambio | 🌇 Tarde cálida |
| 4 | Crecimiento | 🌅 Pre-atardecer dorado |
| 5 | Atardecer | 🌆 Naranja-rojo |
| 6 | Confesión | 🌙 Crepúsculo violeta |
| 7 | Final | 🌃 Noche — jardín iluminado |
| 8 | Extra | 💌 Mensaje desbloqueable |

---

## ✨ Efectos y características

### Visuales
- 🌻 **Jardín de girasoles SVG** dibujados a mano que crecen con el scroll (hasta 38 flores)
- ☀️ **God Rays** — haces de luz solar en las escenas de día
- 🌫️ **Niebla baja** entre las flores del jardín nocturno
- 🪲 **Luciérnagas** animadas en las escenas de noche
- 💫 **Estrellas fugaces** que cruzan el cielo nocturno
- ⭐ **Estrellas parpadeantes** y luna con brillo pulsante
- ☁️ **Nubes en movimiento** continuo en las escenas de día
- 💛 **Corazones y pétalos flotantes** desde la escena de confesión

### Interacción
- 🖱️ **Cursor personalizado** dorado con suavizado
- 🌸 **Florecita** que sigue el cursor (escritorio)
- ✋ **Toque en flores** → animación de rebote + explosión de partículas doradas
- ✨ **Partículas** en canvas: bursts al interactuar, estela al pasar por flores, polen flotante
- 🎊 **Confeti** al presionar el botón final
- 💡 **Letras que brillan** al pasar el cursor por los textos de énfasis

### Animaciones de texto
- ✍️ **Efecto typewriter** en los nombres clave ("Sofía…")
- 📜 Textos que aparecen con **fade + slide** escalonado al hacer scroll

### Audio (Web Audio API)
- 🎵 **Campanita delicada** al cambiar de escena
- 🌬️ **Viento suave** al hacer scroll
- 🎶 **Acorde romántico** al revelar el mensaje final

### Contador
- 📅 **Días juntos** animado — cuenta desde el **3 de diciembre de 2025**

---

## 🧩 Módulos de JavaScript

```
CursorModule          → cursor dorado personalizado
FlowerCursorModule    → florecita que sigue el mouse
ParticleModule        → sistema de partículas en canvas
FlowerModule          → generación SVG y jardín por escenas
SkyModule             → nubes, estrellas, luna
GodRaysModule         → rayos de luz solar
MistModule            → niebla baja nocturna
FireflyModule         → luciérnagas animadas
ShootingStarsModule   → estrellas fugaces
HeartsModule          → corazones flotantes
TypewriterModule      → efecto escritura animada
GlowLettersModule     → hover letra por letra
DaysCounterModule     → contador de días con animación
ConfettiModule        → explosión de confeti
SoundModule           → sonidos con Web Audio API
ScrollSoundModule     → sonido al cambiar de escena
ScrollModule          → IntersectionObserver para scroll
UIModule              → botones y pétalos flotantes
ProgressModule        → puntos de progreso lateral
```

---

## 📱 Responsive

| Dispositivo | Ancho | Ajustes |
|-------------|-------|---------|
| Móvil | ≤ 480px | Flores al 78%, menos efectos, texto optimizado, `100svh` |
| Tablet | 481–768px | Flores al 85%, efectos intermedios |
| Escritorio | > 768px | Experiencia completa |

- Cursor y florecita se **ocultan en dispositivos táctiles**
- Flores, luciérnagas, estrellas y partículas se **reducen en móvil** para mejor rendimiento
- Compatible con el problema de altura de Safari iOS (`-webkit-fill-available`)
- Respeta `prefers-reduced-motion` para accesibilidad

---

## 🛠️ Personalización rápida

### Cambiar la fecha del contador
En `script.js`, busca:
```js
const START_DATE = new Date('2025-12-03T00:00:00');
```
Reemplaza la fecha por la que necesites en formato `AAAA-MM-DD`.

### Cambiar el nombre
En `index.html`, busca todas las ocurrencias de `Sofía` y reemplázalas.

### Cambiar la cantidad de flores por escena
En `script.js`, busca el array `GARDENS_BASE` y modifica el campo `count` de cada escena.

### Cambiar colores de pétalos
En `script.js`, busca el array `petalColors` dentro de `makeSunflower()`.

---

## 🌐 Compatibilidad

| Navegador | Soporte |
|-----------|---------|
| Chrome / Edge | ✅ Completo |
| Firefox | ✅ Completo |
| Safari (macOS) | ✅ Completo |
| Safari (iOS) | ✅ Con ajustes |
| Chrome Android | ✅ Con ajustes |

> El audio requiere una interacción del usuario (clic/toque) antes de reproducirse — comportamiento estándar de los navegadores modernos.

---

## 📝 Tecnologías

- **HTML5** — estructura semántica
- **CSS3** — variables, animaciones, `clamp()`, `IntersectionObserver` friendly
- **JavaScript ES6+** — módulos IIFE, Canvas API, Web Audio API, IntersectionObserver
- Sin frameworks. Sin dependencias. Sin instalación.

---

*Hecho con 💛 para Sofía*
