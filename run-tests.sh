#!/bin/bash
# run-tests.sh - Script helper para ejecutar tests en Triagre Frontend

echo "=========================================="
echo "Triagre Frontend — Testing Suite"
echo "=========================================="
echo ""

case "$1" in
  "all")
    echo "🧪 Ejecutando todos los tests..."
    npm test -- --watch=false
    ;;
  "watch")
    echo "👁️  Ejecutando tests en watch mode..."
    npm test
    ;;
  "coverage")
    echo "📊 Ejecutando tests con cobertura..."
    npm test -- --watch=false --code-coverage
    echo "✅ Cobertura generada en ./coverage/"
    ;;
  "auth")
    echo "🔐 Tests de autenticación..."
    npm test -- --include='**/auth*.spec.ts' --watch=false
    ;;
  "services")
    echo "🔧 Tests de servicios..."
    npm test -- --include='**/service.spec.ts' --watch=false
    ;;
  "components")
    echo "🎨 Tests de componentes..."
    npm test -- --include='**/*.component.spec.ts' --watch=false
    ;;
  "solicitudes")
    echo "📝 Tests de solicitudes..."
    npm test -- --include='**/solicitudes/**/*.spec.ts' --watch=false
    ;;
  "debug")
    echo "🐛 Debugging mode..."
    echo "Abre http://localhost:9876 en tu navegador"
    npm test
    ;;
  "help"|"-h"|"")
    echo "Uso: ./run-tests.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  all          - Ejecutar todos los tests una sola vez"
    echo "  watch        - Ejecutar tests en watch mode (default)"
    echo "  coverage     - Generar reporte de cobertura"
    echo "  auth         - Tests de autenticación y guards"
    echo "  services     - Tests de servicios"
    echo "  components   - Tests de componentes"
    echo "  solicitudes  - Tests de módulo de solicitudes"
    echo "  debug        - Abrir navegador para debug"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Ejemplo:"
    echo "  ./run-tests.sh coverage"
    ;;
  *)
    echo "❌ Comando desconocido: $1"
    echo "Usa './run-tests.sh help' para ver opciones disponibles"
    exit 1
    ;;
esac

