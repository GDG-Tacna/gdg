# 👾 Google 3D Pixel Studio (GDG Edition)

Aplicación web interactiva que detecta mediante visión por computadora los rasgos físicos de la persona (tono de piel, color y estilo de cabello, y prendas de ropa) y genera un **personaje 3D interactivo en estilo pixel art / voxel (Minecraft & Crossy Road)** renderizado en tiempo real con **Three.js**.

La interfaz utiliza la paleta oficial de colores de Google (**Azul `#4285F4`**, **Rojo `#EA4335`**, **Amarillo `#FBBC05`**, **Verde `#34A853`**) y tipografías retro de Google Fonts (*Press Start 2P* y *Silkscreen*).

---

## 🚀 Nuevo Enfoque: Detección de Rasgos + Generación 3D

1. **Escaneo y Detección de Rasgos (IA / Visión)**:
   - 🎨 **Tono de Piel**: Muestreo zonal facial (excluyendo brillos y sombras extremas) con clasificación de tono y colorimetría precisa.
   - 💇 **Estilo y Color de Cabello**: Análisis de coronilla y laterales para identificar longitud y volumen (Corto moderno, Ondulado/Afro, Largo, De lado, Despeinado, Rapado) y su color exacto.
   - 👕 **Ropa y Colores**: Muestreo de la zona del torso para clasificar el tipo de prenda (Hoodie, Polera/T-Shirt, Chaqueta) y sus colores primarios y de contraste.
   - 🧔 **Rasgos Faciales**: Detección de barba/vello facial y anteojos/lentes.

2. **Personaje 3D en Tiempo Real (Three.js)**:
   - 🕹️ **Geometría Voxel Auténtica**: Proporciones de avatar cúbico (cabeza, capa exterior de cabello 3D, torso, brazos y piernas con articulaciones).
   - 🔄 **Controles Orbitales 360°**: Haz clic y arrastra con el ratón o pantalla táctil para rotar al personaje, hacer zoom y examinarlo desde cualquier ángulo.
   - 🏃 **Animaciones Vivas**:
     - *Idle*: Respiración suave y movimiento de cabeza.
     - *Saludar (Wave)*: Levanta el brazo derecho y saluda.
     - *Caminar (Walk)*: Marcha rítmica de brazos y piernas.
     - *Giro 360° automático*: Rotación continua sobre el pedestal.
   - 🏛️ **Pedestal Google 3D**: Plataforma cilíndrica retro con los 4 sectores de colores de Google que proyectan sombras suaves.
   - 🏷️ **Tag de Jugador Flotante**: Etiqueta superior con nivel XP **99** y el nombre/rol del usuario.
   - ⚔️ **Accesorios 3D**: Casco de diamante, espada de diamante, lentes de sol 3D.

3. **Panel de Ajuste y Calibración en Vivo**:
   - Ajusta o cambia manualmente cualquier rasgo detectado (color de piel, peinado, color de sudadera o pantalón) con paletas rápidas y selectores de color.
   - El modelo 3D responde y se actualiza al instante sin recargar la página.

4. **Captura y Exportación**:
   - 📸 **Foto del Avatar 3D**: Captura instantánea en alta resolución en formato PNG con fondo transparente o arcade para usar como avatar en Discord, GitHub, Twitter o credenciales GDG.

---

## 🛠️ Tecnologías

- **Motor 3D**: [Three.js](https://threejs.org/) + OrbitControls
- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Pixel Art personalizado
- **Audio Retro**: Sintetizador Web Audio API 8-bit
- **Gestor de Paquetes**: `pnpm`

---

## 💻 Comandos de Ejecución

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Previsualizar producción
pnpm preview
```
