"""Genera los recursos de marca de E&E Gastronomia a partir de logo.jpg.

El logo original es un cuadrado de 500x500 con el campo vinoso incrustado.
Radios medidos desde el centro (250,250): circulo exterior termina en r=200.
Recortamos a r=202 para dejar 2px de margen y aplicamos mascara circular.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "logo.jpg"
ASSETS = ROOT / "frontend" / "src" / "assets" / "images"
PUBLIC = ROOT / "frontend" / "public"

CENTER = 250
RADIUS = 202
WINE = (105, 19, 22)  # #691316

def circular_logo():
    im = Image.open(SRC).convert("RGB")
    box = (CENTER - RADIUS, CENTER - RADIUS, CENTER + RADIUS, CENTER + RADIUS)
    cropped = im.crop(box)
    size = RADIUS * 2

    # Mascara circular con supersampling x4 para bordes suaves
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)

    out = cropped.convert("RGBA")
    out.putalpha(mask)
    return out

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    logo = circular_logo()
    logo.save(ASSETS / "logo-circular.png")

    logo.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32.png")
    logo.resize((180, 180), Image.LANCZOS).save(PUBLIC / "favicon-180.png")

    # Open Graph 1200x630: campo vinoso con el logo centrado.
    # Sin texto agregado: el logo ya contiene el wordmark "GASTRONOMIA",
    # lo que evita depender de que Playfair este instalada en el sistema.
    og = Image.new("RGB", (1200, 630), WINE)
    badge = logo.resize((480, 480), Image.LANCZOS)
    og.paste(badge, ((1200 - 480) // 2, (630 - 480) // 2), badge)
    og.save(PUBLIC / "og-image.jpg", quality=90)

    print("Recursos generados en", ASSETS, "y", PUBLIC)

if __name__ == "__main__":
    main()
