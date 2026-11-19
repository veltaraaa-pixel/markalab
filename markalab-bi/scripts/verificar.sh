#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Una sola orden antes de cada despliegue. Si esto pasa, el despliegue pasa.
#
#   bash scripts/verificar.sh
#
# El flujo de n8n no vive en este repositorio, porque no se despliega con el
# sitio. Si se quiere revisar también, se le pasa la carpeta que lo contiene:
#
#   bash scripts/verificar.sh ../../01_workflows
# ---------------------------------------------------------------------------
set -uo pipefail
cd "$(dirname "$0")/.."

FLUJOS="${1:-}"
fallo=0
paso () { printf '\n\033[1m%s\033[0m\n' "$1"; }

paso "1/4 · Tipos"
npx tsc --noEmit || fallo=1

paso "2/4 · Compilación"
npm run build || fallo=1

paso "3/4 · Workflows de n8n"
if [ -z "$FLUJOS" ]; then
  echo "  Omitido: los flujos viven en la carpeta de la entrega, no aquí."
  echo "  Para revisarlos: bash scripts/verificar.sh <carpeta con los .json>"
elif [ ! -d "$FLUJOS" ]; then
  echo "  ERROR: no existe la carpeta $FLUJOS"; fallo=1
else
  encontrados=0
  for f in "$FLUJOS"/*.json; do
    [ -e "$f" ] || continue
    encontrados=$((encontrados + 1))
    node -e '
      const d = require(process.argv[1]);
      const n = new Set((d.nodes || []).map(x => x.name));
      const malas = [];
      for (const [o, s] of Object.entries(d.connections || {})) {
        if (!n.has(o)) malas.push("origen inexistente: " + o);
        for (const ramas of Object.values(s))
          for (const r of ramas) for (const c of r)
            if (!n.has(c.node)) malas.push("destino inexistente: " + c.node);
      }
      if (malas.length) { console.error("  fallo:", malas.join(" / ")); process.exit(1); }
      console.log("  " + process.argv[1].split("/").pop() + "  " + n.size + " nodos, conexiones correctas");
    ' "$(cd "$(dirname "$f")" && pwd)/$(basename "$f")" || fallo=1
  done
  [ "$encontrados" -eq 0 ] && echo "  No hay archivos .json en $FLUJOS"
fi

paso "4/4 · Secretos fuera del repositorio"
if git ls-files --error-unmatch .env .env.local >/dev/null 2>&1; then
  echo "  ERROR: hay un archivo .env rastreado por git"; fallo=1
else
  echo "  Ningún .env rastreado"
fi
if grep -rInE '(sk-ant|supabase\.co/rest).{0,20}[A-Za-z0-9_-]{24,}' app lib components 2>/dev/null; then
  echo "  ERROR: parece haber una llave escrita en el código"; fallo=1
else
  echo "  Ninguna llave en el código"
fi

printf '\n'
if [ "$fallo" -eq 0 ]; then
  echo "Todo en orden. Se puede desplegar."
else
  echo "Hay fallos. No desplegar."; exit 1
fi
